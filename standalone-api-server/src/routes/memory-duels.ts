import { Router, type IRouter } from "express";
import { eq, or, and } from "drizzle-orm";
import { db, memoryDuelsTable, memoryGamesTable, profilesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

const VALID_GRID_SIZES = [2, 4, 6, 8];

async function formatDuel(duel: typeof memoryDuelsTable.$inferSelect) {
  const [challenger, challenged] = await Promise.all([
    db.select().from(profilesTable).where(eq(profilesTable.id, duel.challengerId)).then((r) => r[0]),
    db.select().from(profilesTable).where(eq(profilesTable.id, duel.challengedId)).then((r) => r[0]),
  ]);

  let challengerPoints: number | null = null;
  let challengedPoints: number | null = null;

  if (duel.challengerGameId) {
    const [g] = await db.select().from(memoryGamesTable).where(eq(memoryGamesTable.id, duel.challengerGameId));
    if (g) challengerPoints = g.points ?? null;
  }
  if (duel.challengedGameId) {
    const [g] = await db.select().from(memoryGamesTable).where(eq(memoryGamesTable.id, duel.challengedGameId));
    if (g) challengedPoints = g.points ?? null;
  }

  return {
    id: duel.id,
    gameType: "memory" as const,
    challengerId: duel.challengerId,
    challengedId: duel.challengedId,
    gridSize: duel.gridSize,
    status: duel.status,
    challengerGameId: duel.challengerGameId ?? null,
    challengedGameId: duel.challengedGameId ?? null,
    winnerId: duel.winnerId ?? null,
    challengerUsername: challenger?.username ?? "Unknown",
    challengedUsername: challenged?.username ?? "Unknown",
    challengerAvatar: challenger?.avatar ?? null,
    challengedAvatar: challenged?.avatar ?? null,
    challengerXp: challenger?.xp ?? 0,
    challengedXp: challenged?.xp ?? 0,
    challengerPoints,
    challengedPoints,
    createdAt: duel.createdAt.toISOString(),
  };
}

// POST /memory-duels — create
router.post("/memory-duels", async (req, res): Promise<void> => {
  const { challengerId, challengedId, gridSize } = req.body as Record<string, unknown>;

  if (typeof challengerId !== "number" || typeof challengedId !== "number") {
    res.status(400).json({ error: "challengerId and challengedId must be numbers" });
    return;
  }
  if (!VALID_GRID_SIZES.includes(gridSize as number)) {
    res.status(400).json({ error: "gridSize must be 2, 4, 6, or 8" });
    return;
  }
  if (challengerId === challengedId) {
    res.status(400).json({ error: "Cannot challenge yourself" });
    return;
  }

  const [challenger] = await db.select().from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select().from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  // Create challenger's game immediately
  const [challengerGame] = await db
    .insert(memoryGamesTable)
    .values({ profileId: challengerId, gridSize: gridSize as number, status: "active", elapsedSeconds: 0, flips: 0 })
    .returning();

  const [duel] = await db
    .insert(memoryDuelsTable)
    .values({
      challengerId,
      challengedId,
      gridSize: gridSize as number,
      status: "pending",
      challengerGameId: challengerGame.id,
      challengedGameId: null,
      winnerId: null,
    })
    .returning();

  res.status(201).json(await formatDuel(duel));
});

// GET /memory-duels/for/:profileId
router.get("/memory-duels/for/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId, 10);
  if (isNaN(profileId)) {
    res.status(400).json({ error: "Invalid profileId" });
    return;
  }

  const duels = await db
    .select()
    .from(memoryDuelsTable)
    .where(or(eq(memoryDuelsTable.challengerId, profileId), eq(memoryDuelsTable.challengedId, profileId)))
    .orderBy(memoryDuelsTable.createdAt);

  const details = await Promise.all(duels.map(formatDuel));
  res.json(details.reverse());
});

// GET /memory-duels/:id
router.get("/memory-duels/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [duel] = await db.select().from(memoryDuelsTable).where(eq(memoryDuelsTable.id, id));
  if (!duel) {
    res.status(404).json({ error: "Duel not found" });
    return;
  }
  res.json(await formatDuel(duel));
});

// PATCH /memory-duels/:id/respond
router.patch("/memory-duels/:id/respond", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { action } = req.body as { action?: string };
  if (action !== "accept" && action !== "decline") {
    res.status(400).json({ error: "action must be 'accept' or 'decline'" });
    return;
  }

  const [duel] = await db.select().from(memoryDuelsTable).where(eq(memoryDuelsTable.id, id));
  if (!duel) {
    res.status(404).json({ error: "Duel not found" });
    return;
  }
  if (duel.status !== "pending") {
    res.status(400).json({ error: "Duel is no longer pending" });
    return;
  }

  if (action === "decline") {
    const [updated] = await db
      .update(memoryDuelsTable)
      .set({ status: "declined" })
      .where(eq(memoryDuelsTable.id, id))
      .returning();
    res.json(await formatDuel(updated));
    return;
  }

  // Accept: create challenged player's game
  const [challengedGame] = await db
    .insert(memoryGamesTable)
    .values({ profileId: duel.challengedId, gridSize: duel.gridSize, status: "active", elapsedSeconds: 0, flips: 0 })
    .returning();

  const [updated] = await db
    .update(memoryDuelsTable)
    .set({ status: "accepted", challengedGameId: challengedGame.id })
    .where(eq(memoryDuelsTable.id, id))
    .returning();

  res.json(await formatDuel(updated));
});

// Called from memory-games complete route to resolve any linked duels
export async function resolveDuelForMemoryGame(gameId: number): Promise<void> {
  const duels = await db
    .select()
    .from(memoryDuelsTable)
    .where(
      and(
        or(eq(memoryDuelsTable.challengerGameId, gameId), eq(memoryDuelsTable.challengedGameId, gameId)),
        eq(memoryDuelsTable.status, "accepted"),
      ),
    );

  for (const duel of duels) {
    if (!duel.challengerGameId || !duel.challengedGameId) continue;

    const [cGame] = await db.select().from(memoryGamesTable).where(eq(memoryGamesTable.id, duel.challengerGameId));
    const [dGame] = await db.select().from(memoryGamesTable).where(eq(memoryGamesTable.id, duel.challengedGameId));

    if (!cGame || !dGame) continue;
    if (cGame.status !== "completed" || dGame.status !== "completed") continue;

    const cPoints = cGame.points ?? 0;
    const dPoints = dGame.points ?? 0;
    let winnerId: number | null = null;
    if (cPoints > dPoints) winnerId = duel.challengerId;
    else if (dPoints > cPoints) winnerId = duel.challengedId;

    await db
      .update(memoryDuelsTable)
      .set({ status: "completed", winnerId })
      .where(eq(memoryDuelsTable.id, duel.id));

    if (winnerId) {
      await db
        .update(profilesTable)
        .set({ gems: sql`gems + 10` })
        .where(eq(profilesTable.id, winnerId));
    } else {
      // Tie — award 2 gems to both players
      await db
        .update(profilesTable)
        .set({ gems: sql`gems + 2` })
        .where(eq(profilesTable.id, duel.challengerId));
      await db
        .update(profilesTable)
        .set({ gems: sql`gems + 2` })
        .where(eq(profilesTable.id, duel.challengedId));
    }
  }
}

export default router;
