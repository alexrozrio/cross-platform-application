/**
 * Unified invite-link endpoints — works for both Sudoku challenges and Memory duels.
 *
 * GET  /api/invite/:token          — public, returns challenge/duel info
 * POST /api/invite/:token/accept   — body: { profileId }  → creates game, returns { type, gameId, gridSize? }
 * POST /api/invite/:token/decline  — body: { profileId }
 */

import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  challengesTable,
  memoryDuelsTable,
  profilesTable,
  gamesTable,
  puzzlesTable,
  memoryGamesTable,
} from "@workspace/db";

const router: IRouter = Router();

// ─── Helper: find a challenge or duel by shareToken ─────────────────────────

async function findByToken(token: string) {
  const [c] = await db
    .select()
    .from(challengesTable)
    .where(eq(challengesTable.shareToken, token))
    .limit(1);
  if (c) return { type: "sudoku" as const, record: c };

  const [d] = await db
    .select()
    .from(memoryDuelsTable)
    .where(eq(memoryDuelsTable.shareToken, token))
    .limit(1);
  if (d) return { type: "memory" as const, record: d };

  return null;
}

// ─── GET /api/invite/:token ──────────────────────────────────────────────────

router.get("/invite/:token", async (req, res): Promise<void> => {
  const found = await findByToken(req.params.token);
  if (!found) { res.status(404).json({ error: "Invite not found" }); return; }

  const { type, record } = found;

  const [challenger] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, record.challengerId));

  const challenged = record.challengedId
    ? await db.select().from(profilesTable).where(eq(profilesTable.id, record.challengedId)).then((r) => r[0])
    : undefined;

  const base = {
    type,
    id: record.id,
    status: record.status,
    shareToken: record.shareToken,
    challengerId: record.challengerId,
    challengedId: record.challengedId ?? null,
    challengerUsername: challenger?.username ?? "Unknown",
    challengerAvatar: challenger?.avatar ?? null,
    challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? null,
    createdAt: record.createdAt.toISOString(),
  };

  if (type === "sudoku") {
    const c = record as typeof challengesTable.$inferSelect;
    const [puzzle] = await db
      .select()
      .from(puzzlesTable)
      .where(eq(puzzlesTable.id, c.puzzleId));
    res.json({ ...base, difficulty: puzzle?.difficulty ?? "medium", gridSize: puzzle?.gridSize ?? 9 });
  } else {
    const d = record as typeof memoryDuelsTable.$inferSelect;
    res.json({ ...base, gridSize: d.gridSize });
  }
});

// ─── POST /api/invite/:token/accept ─────────────────────────────────────────

router.post("/invite/:token/accept", async (req, res): Promise<void> => {
  const { profileId } = req.body as { profileId?: unknown };
  if (typeof profileId !== "number") {
    res.status(400).json({ error: "profileId required" });
    return;
  }

  const found = await findByToken(req.params.token);
  if (!found) { res.status(404).json({ error: "Invite not found" }); return; }

  const { type, record } = found;

  if (record.challengerId === profileId) {
    res.status(400).json({ error: "You cannot accept your own challenge" });
    return;
  }
  if (record.status !== "pending") {
    res.status(400).json({ error: "Challenge is no longer pending" });
    return;
  }
  // If challenge was sent to a specific user, only that user may accept
  if (record.challengedId !== null && record.challengedId !== profileId) {
    res.status(403).json({ error: "This challenge was sent to a specific player" });
    return;
  }

  if (type === "sudoku") {
    const c = record as typeof challengesTable.$inferSelect;
    const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, c.puzzleId));
    if (!puzzle) { res.status(404).json({ error: "Puzzle not found" }); return; }

    const [game] = await db
      .insert(gamesTable)
      .values({
        profileId,
        puzzleId: c.puzzleId,
        status: "active",
        currentGrid: puzzle.grid,
        elapsedSeconds: 0,
        mistakeCount: 0,
        hintsUsed: 0,
      })
      .returning();

    await db
      .update(challengesTable)
      .set({ status: "accepted", challengedId: profileId, challengedGameId: game.id })
      .where(eq(challengesTable.id, c.id));

    res.json({ type: "sudoku", gameId: game.id });
  } else {
    const d = record as typeof memoryDuelsTable.$inferSelect;

    const [game] = await db
      .insert(memoryGamesTable)
      .values({ profileId, gridSize: d.gridSize, status: "active", elapsedSeconds: 0, flips: 0 })
      .returning();

    await db
      .update(memoryDuelsTable)
      .set({ status: "accepted", challengedId: profileId, challengedGameId: game.id })
      .where(eq(memoryDuelsTable.id, d.id));

    res.json({ type: "memory", gameId: game.id, gridSize: d.gridSize });
  }
});

// ─── POST /api/invite/:token/decline ────────────────────────────────────────

router.post("/invite/:token/decline", async (req, res): Promise<void> => {
  const { profileId } = req.body as { profileId?: unknown };
  if (typeof profileId !== "number") {
    res.status(400).json({ error: "profileId required" });
    return;
  }

  const found = await findByToken(req.params.token);
  if (!found) { res.status(404).json({ error: "Invite not found" }); return; }

  const { type, record } = found;

  if (record.challengerId === profileId) {
    res.status(400).json({ error: "You cannot decline your own challenge" });
    return;
  }
  if (record.status !== "pending") {
    res.status(400).json({ error: "Challenge is no longer pending" });
    return;
  }
  if (record.challengedId !== null && record.challengedId !== profileId) {
    res.status(403).json({ error: "This challenge was sent to a specific player" });
    return;
  }

  if (type === "sudoku") {
    await db
      .update(challengesTable)
      .set({ status: "declined", challengedId: profileId })
      .where(eq(challengesTable.id, record.id));
  } else {
    await db
      .update(memoryDuelsTable)
      .set({ status: "declined", challengedId: profileId })
      .where(eq(memoryDuelsTable.id, record.id));
  }

  res.json({ success: true });
});

export default router;
