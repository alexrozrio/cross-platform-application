import { Router, type IRouter } from "express";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { db, memoryGamesTable, profilesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { resolveDuelForMemoryGame } from "./memory-duels";

const router: IRouter = Router();

// ─── Points / XP / Gems helpers ───────────────────────────────────────────────

const BASE_POINTS: Record<number, number> = { 2: 150, 4: 500, 6: 1200, 8: 2500 };
const PAR_SECONDS: Record<number, number> = { 2: 25, 4: 60, 6: 120, 8: 200 };
const XP_PER_SIZE: Record<number, number> = { 2: 1, 4: 1, 6: 2, 8: 3 };
const MIN_FLIPS: Record<number, number> = { 2: 8, 4: 16, 6: 32, 8: 64 };

function calcMemoryPoints(gridSize: number, elapsedSeconds: number, flips: number, tipsUsed: number = 0): number {
  const base = BASE_POINTS[gridSize] ?? 500;
  const par = PAR_SECONDS[gridSize] ?? 60;
  const minFlips = MIN_FLIPS[gridSize] ?? 16;
  const timeBonus = Math.max(0, (par - elapsedSeconds) / par) * 0.5;
  const extraFlips = Math.max(0, flips - minFlips);
  const flipPenalty = Math.max(0.4, 1 - 0.02 * extraFlips);
  const tipPenalty = Math.max(0.6, 1 - 0.15 * tipsUsed);
  return Math.max(10, Math.round(base * (1 + timeBonus) * flipPenalty * tipPenalty));
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

  const { elapsedSeconds, flips, tipsUsed } = req.body as { elapsedSeconds?: number; flips?: number; tipsUsed?: number };
  if (typeof elapsedSeconds !== "number" || typeof flips !== "number") {
    res.status(400).json({ error: "elapsedSeconds and flips are required numbers" });
    return;
  }
  const tips = typeof tipsUsed === "number" ? Math.max(0, Math.min(tipsUsed, 2)) : 0;

  const [existing] = await db.select().from(memoryGamesTable).where(eq(memoryGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points, xpEarned: existing.xpEarned, gemsEarned: existing.gemsEarned });
    return;
  }

  const points = calcMemoryPoints(existing.gridSize, elapsedSeconds, flips, tips);
  const xpEarned = XP_PER_SIZE[existing.gridSize] ?? 1;
  const gemsEarned = calcMemoryGems(points);

  const [game] = await db
    .update(memoryGamesTable)
    .set({ status: "completed", elapsedSeconds, flips, points, xpEarned, gemsEarned, completedAt: new Date() })
    .where(eq(memoryGamesTable.id, id))
    .returning();

  if (existing.profileId) {
    // Update gems, XP, and memory daily streak
    const today = new Date().toISOString().slice(0, 10);
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, existing.profileId));
    if (profile) {
      const last = profile.lastMemoryDate as string | null;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let newStreak = profile.memoryStreak ?? 0;
      if (last === today) {
        // already played today, no change to streak
      } else if (last === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      const newLongest = Math.max(newStreak, profile.longestMemoryStreak ?? 0);
      await db
        .update(profilesTable)
        .set({
          gems: sql`gems + ${gemsEarned}`,
          xp: sql`xp + ${xpEarned}`,
          memoryStreak: newStreak,
          longestMemoryStreak: newLongest,
          lastMemoryDate: today,
        })
        .where(eq(profilesTable.id, existing.profileId));
    } else {
      await db
        .update(profilesTable)
        .set({ gems: sql`gems + ${gemsEarned}`, xp: sql`xp + ${xpEarned}` })
        .where(eq(profilesTable.id, existing.profileId));
    }
  }

  // Resolve any memory duel that references this game
  await resolveDuelForMemoryGame(id).catch(() => {});

  res.json({ points, xpEarned, gemsEarned, completedAt: game.completedAt?.toISOString() });
});

// ─── GET /memory-games/leaderboard ───────────────────────────────────────────

router.get("/memory-games/leaderboard", async (req, res): Promise<void> => {
  const rawGridSize = req.query.gridSize as string | undefined;
  const isAll = !rawGridSize || rawGridSize === "all";
  const gridSize = isAll ? null : parseInt(rawGridSize, 10);

  if (isAll) {
    // Aggregate total points per player across all grid sizes
    const rows = await db
      .select({
        profileId: memoryGamesTable.profileId,
        username: profilesTable.username,
        avatar: profilesTable.avatar,
        profileXp: profilesTable.xp,
        points: memoryGamesTable.points,
        xpEarned: memoryGamesTable.xpEarned,
        gridSize: memoryGamesTable.gridSize,
        completedAt: memoryGamesTable.completedAt,
      })
      .from(memoryGamesTable)
      .innerJoin(profilesTable, eq(memoryGamesTable.profileId, profilesTable.id))
      .where(eq(memoryGamesTable.status, "completed"))
      .orderBy(desc(memoryGamesTable.points));

    // Aggregate by profile
    const agg = new Map<number, {
      username: string;
      avatar: string | null;
      profileXp: number;
      totalPoints: number;
      totalXp: number;
      gamesPlayed: number;
      lastCompletedAt: string | null;
    }>();

    for (const row of rows) {
      if (!row.profileId) continue;
      const cur = agg.get(row.profileId) ?? {
        username: row.username,
        avatar: row.avatar ?? null,
        profileXp: row.profileXp ?? 0,
        totalPoints: 0,
        totalXp: 0,
        gamesPlayed: 0,
        lastCompletedAt: null,
      };
      cur.totalPoints += row.points ?? 0;
      cur.totalXp += row.xpEarned ?? 0;
      cur.gamesPlayed += 1;
      const ca = row.completedAt?.toISOString() ?? null;
      if (ca && (!cur.lastCompletedAt || ca > cur.lastCompletedAt)) cur.lastCompletedAt = ca;
      agg.set(row.profileId, cur);
    }

    const sorted = Array.from(agg.entries())
      .sort((a, b) => b[1].totalPoints - a[1].totalPoints)
      .slice(0, 25)
      .map(([profileId, d], i) => ({
        rank: i + 1,
        profileId,
        username: d.username,
        avatar: d.avatar,
        profileXp: d.profileXp,
        totalPoints: d.totalPoints,
        totalXp: d.totalXp,
        gamesPlayed: d.gamesPlayed,
        completedAt: d.lastCompletedAt,
        points: d.totalPoints,
        xpEarned: d.totalXp,
        elapsedSeconds: null,
        flips: null,
      }));

    res.json(sorted);
    return;
  }

  // Single grid size
  const rows = await db
    .select({
      profileId: memoryGamesTable.profileId,
      username: profilesTable.username,
      avatar: profilesTable.avatar,
      profileXp: profilesTable.xp,
      points: memoryGamesTable.points,
      xpEarned: memoryGamesTable.xpEarned,
      elapsedSeconds: memoryGamesTable.elapsedSeconds,
      flips: memoryGamesTable.flips,
      completedAt: memoryGamesTable.completedAt,
    })
    .from(memoryGamesTable)
    .innerJoin(profilesTable, eq(memoryGamesTable.profileId, profilesTable.id))
    .where(and(eq(memoryGamesTable.status, "completed"), eq(memoryGamesTable.gridSize, gridSize!)))
    .orderBy(desc(memoryGamesTable.points))
    .limit(20);

  res.json(rows.map(r => ({ ...r, completedAt: r.completedAt?.toISOString() ?? null })));
});

// ─── GET /memory-games/history/:profileId ────────────────────────────────────

router.get("/memory-games/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number(req.params.profileId);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  const rawMonth = typeof req.query.month === "string" ? req.query.month : new Date().toISOString().slice(0, 7);
  // Strict validation: must be YYYY-MM with valid month 01-12
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth)) {
    res.status(400).json({ error: "Invalid month — use YYYY-MM format (e.g. 2026-06)" }); return;
  }

  const [year, mon] = rawMonth.split("-").map(Number);
  // Build UTC timestamp boundaries so filtering is timezone-consistent with returned date strings
  const monthStart = new Date(Date.UTC(year, mon - 1, 1));
  const monthEnd   = new Date(Date.UTC(year, mon, 1));

  // Filter in SQL using the timestamp range — avoids loading all rows into JS
  const rows = await db
    .select({ completedAt: memoryGamesTable.completedAt })
    .from(memoryGamesTable)
    .where(
      and(
        eq(memoryGamesTable.profileId, profileId),
        eq(memoryGamesTable.status, "completed"),
        gte(memoryGamesTable.completedAt, monthStart),
        lt(memoryGamesTable.completedAt, monthEnd),
      )
    );

  // Deduplicate: one calendar dot per UTC date even if the player finished multiple games that day
  const completedDates = [
    ...new Set(rows.map(r => r.completedAt!.toISOString().slice(0, 10))),
  ];

  res.json({ month: rawMonth, completedDates });
});

// ─── GET /memory-games/streak/:profileId ─────────────────────────────────────

router.get("/memory-games/streak/:profileId", async (req, res): Promise<void> => {
  const profileId = Number(req.params.profileId);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const today = new Date().toISOString().slice(0, 10);
  const completedToday = (profile.lastMemoryDate as string | null) === today;

  res.json({
    currentStreak: profile.memoryStreak ?? 0,
    longestStreak: profile.longestMemoryStreak ?? 0,
    lastMemoryDate: (profile.lastMemoryDate as string | null) ?? null,
    completedToday,
  });
});

export default router;
