import { Router, type IRouter } from "express";
import { eq, or, and } from "drizzle-orm";
import { db, challengesTable, profilesTable, puzzlesTable, gamesTable } from "@workspace/db";
import { generatePuzzle } from "../lib/sudoku";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

type Difficulty = "easy" | "medium" | "hard" | "expert";
const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
const VALID_GRID_SIZES = [3, 4, 9, 16];

function validateChallengeInput(body: unknown): { challengerId: number; challengedId: number; difficulty: Difficulty; gridSize: number } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.challengerId !== "number" || typeof b.challengedId !== "number") return null;
  if (!VALID_DIFFICULTIES.includes(b.difficulty as Difficulty)) return null;
  if (!VALID_GRID_SIZES.includes(b.gridSize as number)) return null;
  return { challengerId: b.challengerId, challengedId: b.challengedId, difficulty: b.difficulty as Difficulty, gridSize: b.gridSize as number };
}

function validateChallengeResponse(body: unknown): { action: "accept" | "decline"; profileId?: number } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.action !== "accept" && b.action !== "decline") return null;
  return { action: b.action, profileId: typeof b.profileId === "number" ? b.profileId : undefined };
}

async function formatChallenge(challenge: typeof challengesTable.$inferSelect) {
  const [challenger, challenged] = await Promise.all([
    db.select().from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((r) => r[0]),
    db.select().from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((r) => r[0]),
  ]);

  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, challenge.puzzleId));

  let challengerPoints: number | null = null;
  let challengedPoints: number | null = null;

  if (challenge.challengerGameId) {
    const [g] = await db.select().from(gamesTable).where(eq(gamesTable.id, challenge.challengerGameId));
    if (g) challengerPoints = g.points ?? null;
  }
  if (challenge.challengedGameId) {
    const [g] = await db.select().from(gamesTable).where(eq(gamesTable.id, challenge.challengedGameId));
    if (g) challengedPoints = g.points ?? null;
  }

  return {
    id: challenge.id,
    challengerId: challenge.challengerId,
    challengedId: challenge.challengedId,
    puzzleId: challenge.puzzleId,
    status: challenge.status,
    challengerGameId: challenge.challengerGameId ?? null,
    challengedGameId: challenge.challengedGameId ?? null,
    winnerId: challenge.winnerId ?? null,
    challengerUsername: challenger?.username ?? "Unknown",
    challengedUsername: challenged?.username ?? "Unknown",
    challengerAvatar: challenger?.avatar ?? null,
    challengedAvatar: challenged?.avatar ?? null,
    challengerPoints,
    challengedPoints,
    difficulty: puzzle?.difficulty ?? "medium",
    gridSize: puzzle?.gridSize ?? 9,
    createdAt: challenge.createdAt.toISOString(),
  };
}

router.post("/challenges", async (req, res): Promise<void> => {
  const parsed = validateChallengeInput(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { challengerId, challengedId, difficulty, gridSize } = parsed;

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

  const puzzleData = generatePuzzle(difficulty, gridSize);
  const [puzzle] = await db
    .insert(puzzlesTable)
    .values({ difficulty, gridSize, grid: puzzleData.grid, solution: puzzleData.solution })
    .returning();

  const [challengerGame] = await db
    .insert(gamesTable)
    .values({
      profileId: challengerId,
      puzzleId: puzzle.id,
      status: "active",
      currentGrid: puzzle.grid,
      elapsedSeconds: 0,
      mistakeCount: 0,
      hintsUsed: 0,
    })
    .returning();

  const [challenge] = await db
    .insert(challengesTable)
    .values({
      challengerId,
      challengedId,
      puzzleId: puzzle.id,
      status: "pending",
      challengerGameId: challengerGame.id,
      challengedGameId: null,
      winnerId: null,
    })
    .returning();

  const detail = await formatChallenge(challenge);
  res.status(201).json(detail);
});

router.get("/challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId, 10);
  if (isNaN(profileId)) {
    res.status(400).json({ error: "Invalid profileId" });
    return;
  }

  const challenges = await db
    .select()
    .from(challengesTable)
    .where(or(eq(challengesTable.challengerId, profileId), eq(challengesTable.challengedId, profileId)))
    .orderBy(challengesTable.createdAt);

  const details = await Promise.all(challenges.map(formatChallenge));
  res.json(details.reverse());
});

router.get("/challenges/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, id));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  res.json(await formatChallenge(challenge));
});

router.patch("/challenges/:id/respond", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = validateChallengeResponse(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, id));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }
  if (challenge.status !== "pending") {
    res.status(400).json({ error: "Challenge is no longer pending" });
    return;
  }

  if (parsed.action === "decline") {
    const [updated] = await db
      .update(challengesTable)
      .set({ status: "declined" })
      .where(eq(challengesTable.id, id))
      .returning();
    res.json(await formatChallenge(updated));
    return;
  }

  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, challenge.puzzleId));
  if (!puzzle) {
    res.status(404).json({ error: "Puzzle not found" });
    return;
  }

  const [challengedGame] = await db
    .insert(gamesTable)
    .values({
      profileId: challenge.challengedId,
      puzzleId: puzzle.id,
      status: "active",
      currentGrid: puzzle.grid,
      elapsedSeconds: 0,
      mistakeCount: 0,
      hintsUsed: 0,
    })
    .returning();

  const [updated] = await db
    .update(challengesTable)
    .set({ status: "accepted", challengedGameId: challengedGame.id })
    .where(eq(challengesTable.id, id))
    .returning();

  res.json(await formatChallenge(updated));
});

export async function resolveChallengeForGame(gameId: number): Promise<void> {
  const challenges = await db
    .select()
    .from(challengesTable)
    .where(
      and(
        or(eq(challengesTable.challengerGameId, gameId), eq(challengesTable.challengedGameId, gameId)),
        eq(challengesTable.status, "accepted"),
      ),
    );

  for (const challenge of challenges) {
    if (!challenge.challengerGameId || !challenge.challengedGameId) continue;

    const [cGame] = await db.select().from(gamesTable).where(eq(gamesTable.id, challenge.challengerGameId));
    const [dGame] = await db.select().from(gamesTable).where(eq(gamesTable.id, challenge.challengedGameId));

    if (!cGame || !dGame) continue;
    if (cGame.status !== "completed" || dGame.status !== "completed") continue;

    const cPoints = cGame.points ?? 0;
    const dPoints = dGame.points ?? 0;
    let winnerId: number | null = null;
    if (cPoints > dPoints) winnerId = challenge.challengerId;
    else if (dPoints > cPoints) winnerId = challenge.challengedId;

    await db
      .update(challengesTable)
      .set({ status: "completed", winnerId })
      .where(eq(challengesTable.id, challenge.id));

    if (winnerId) {
      await db
        .update(profilesTable)
        .set({ gems: sql`gems + 10` })
        .where(eq(profilesTable.id, winnerId));
    }
  }
}

export default router;
