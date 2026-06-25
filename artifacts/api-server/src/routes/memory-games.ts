import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, memoryGamesTable, profilesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// ─── Points / XP / Gems helpers ───────────────────────────────────────────────

const BASE_POINTS: Record<number, number> = { 2: 150, 4: 500, 6: 1200, 8: 2500 };
const PAR_SECONDS: Record<number, number> = { 2: 25, 4: 60, 6: 120, 8: 200 };
const XP_PER_SIZE: Record<number, number> = { 2: 1, 4: 1, 6: 2, 8: 3 };
const MIN_FLIPS: Record<number, number> = { 2: 8, 4: 16, 6: 32, 8: 64 };

function calcMemoryPoints(gridSize: number, elapsedSeconds: number, flips: number): number {
  const base = BASE_POINTS[gridSize] ?? 500;
  const par = PAR_SECONDS[gridSize] ?? 60;
  const minFlips = MIN_FLIPS[gridSize] ?? 16;
  const timeBonus = Math.max(0, (par - elapsedSeconds) / par) * 0.5;
  const extraFlips = Math.max(0, flips - minFlips);
  const flipPenalty = Math.max(0.4, 1 - 0.02 * extraFlips);
  return Math.max(10, Math.round(base * (1 + timeBonus) * flipPenalty));
}

function calcMemoryGems(points: number): number {
  return Math.max(1, Math.floor(points / 5000));
}

// ─── POST /memory-games  (create) ────────────────────────────────────────────

router.post("/memory-games", async (req, res): Promise<void> => {
  const { profileId, gridSize } = req.body as { profileId?: number; gridSize?: number };

  if (!gridSize || ![2, 4, 6, 8].includes(gridSize)) {
    res.status(400).json({ error: "gridSize must be 2, 4, 6, or 8" });
    return;
  }

  const [game] = await db
    .insert(memoryGamesTable)
    .values({
      profileId: typeof profileId === "number" ? profileId : null,
      gridSize,
      status: "active",
      elapsedSeconds: 0,
      flips: 0,
    })
    .returning();

  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

// ─── POST /memory-games/:id/complete ─────────────────────────────────────────

router.post("/memory-games/:id/complete", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { elapsedSeconds, flips } = req.body as { elapsedSeconds?: number; flips?: number };
  if (typeof elapsedSeconds !== "number" || typeof flips !== "number") {
    res.status(400).json({ error: "elapsedSeconds and flips are required numbers" });
    return;
  }

  const [existing] = await db.select().from(memoryGamesTable).where(eq(memoryGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points, xpEarned: existing.xpEarned, gemsEarned: existing.gemsEarned });
    return;
  }

  const points = calcMemoryPoints(existing.gridSize, elapsedSeconds, flips);
  const xpEarned = XP_PER_SIZE[existing.gridSize] ?? 1;
  const gemsEarned = calcMemoryGems(points);

  const [game] = await db
    .update(memoryGamesTable)
    .set({ status: "completed", elapsedSeconds, flips, points, xpEarned, gemsEarned, completedAt: new Date() })
    .where(eq(memoryGamesTable.id, id))
    .returning();

  if (existing.profileId) {
    await db
      .update(profilesTable)
      .set({ gems: sql`gems + ${gemsEarned}`, xp: sql`xp + ${xpEarned}` })
      .where(eq(profilesTable.id, existing.profileId));
  }

  res.json({ points, xpEarned, gemsEarned, completedAt: game.completedAt?.toISOString() });
});

// ─── GET /memory-games/leaderboard ───────────────────────────────────────────

router.get("/memory-games/leaderboard", async (req, res): Promise<void> => {
  const gridSize = req.query.gridSize ? parseInt(req.query.gridSize as string, 10) : 4;

  const rows = await db
    .select({
      profileId: memoryGamesTable.profileId,
      username: profilesTable.username,
      avatar: profilesTable.avatar,
      points: memoryGamesTable.points,
      xpEarned: memoryGamesTable.xpEarned,
      elapsedSeconds: memoryGamesTable.elapsedSeconds,
      flips: memoryGamesTable.flips,
      completedAt: memoryGamesTable.completedAt,
    })
    .from(memoryGamesTable)
    .innerJoin(profilesTable, eq(memoryGamesTable.profileId, profilesTable.id))
    .where(and(eq(memoryGamesTable.status, "completed"), eq(memoryGamesTable.gridSize, gridSize)))
    .orderBy(desc(memoryGamesTable.points))
    .limit(20);

  res.json(rows.map(r => ({ ...r, completedAt: r.completedAt?.toISOString() ?? null })));
});

export default router;
