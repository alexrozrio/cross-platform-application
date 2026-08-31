import { Router, type IRouter } from "express";
import { eq, desc, and, asc } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, profilesTable, dailyChallengesTable } from "@workspace/db";
import {
  CreateGameBody,
  GetGameParams,
  GetGameResponse,
  SaveGameParams,
  SaveGameBody,
  SaveGameResponse,
  CompleteGameParams,
  CompleteGameBody,
  CompleteGameResponse,
} from "@workspace/api-zod";
import { calcPoints, calcGems } from "../utils/points";
import { XP_PER_DIFFICULTY } from "../utils/levels";
import { awardPreviousPeriodBadges } from "../utils/awards";
import { resolveChallengeForGame } from "./challenges";
import { sql } from "drizzle-orm";

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function updateStreakIfDailyChallenge(profileId: number, puzzleId: number): Promise<void> {
  const today = todayDateString();

  const [challenge] = await db
    .select()
    .from(dailyChallengesTable)
    .where(and(eq(dailyChallengesTable.date, today), eq(dailyChallengesTable.puzzleId, puzzleId)));

  if (!challenge) return;

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  if (!profile) return;

  const last = profile.lastChallengeDate;

  if (last === today) return;

  const yesterday = yesterdayDateString();
  const newStreak = last === yesterday ? profile.currentStreak + 1 : 1;
  const newLongest = Math.max(profile.longestStreak, newStreak);

  await db
    .update(profilesTable)
    .set({ currentStreak: newStreak, longestStreak: newLongest, lastChallengeDate: today })
    .where(eq(profilesTable.id, profileId));
}

const router: IRouter = Router();

function formatGame(game: typeof gamesTable.$inferSelect, puzzle?: typeof puzzlesTable.$inferSelect) {
  return {
    ...game,
    puzzle: puzzle ? {
      ...puzzle,
      createdAt: puzzle.createdAt.toISOString(),
    } : undefined,
    completedAt: game.completedAt ? game.completedAt.toISOString() : null,
    createdAt: game.createdAt.toISOString(),
  };
}

router.post("/games", async (req, res): Promise<void> => {
  const parsed = CreateGameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, parsed.data.puzzleId));
  if (!puzzle) {
    res.status(404).json({ error: "Puzzle not found" });
    return;
  }

  const [game] = await db.insert(gamesTable).values({
    profileId: parsed.data.profileId ?? null,
    puzzleId: parsed.data.puzzleId,
    status: "active",
    currentGrid: puzzle.grid,
    elapsedSeconds: 0,
    mistakeCount: 0,
    hintsUsed: 0,
  }).returning();

  res.status(201).json(GetGameResponse.parse(formatGame(game, puzzle)));
});

router.get("/games/active/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId, 10);
  if (isNaN(profileId)) {
    res.status(400).json({ error: "Invalid profileId" });
    return;
  }
  const [game] = await db
    .select()
    .from(gamesTable)
    .where(and(eq(gamesTable.profileId, profileId), eq(gamesTable.status, "active")))
    .orderBy(desc(gamesTable.createdAt))
    .limit(1);
  if (!game) {
    res.status(404).json({ error: "No active game" });
    return;
  }
  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, game.puzzleId));
  res.json(formatGame(game, puzzle ?? undefined));
});

router.get("/games/:id", async (req, res): Promise<void> => {
  const params = GetGameParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.id));
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, game.puzzleId));

  res.json(GetGameResponse.parse(formatGame(game, puzzle)));
});

router.patch("/games/:id", async (req, res): Promise<void> => {
  const params = SaveGameParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SaveGameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.currentGrid !== undefined) updateData.currentGrid = parsed.data.currentGrid;
  if (parsed.data.elapsedSeconds !== undefined) updateData.elapsedSeconds = parsed.data.elapsedSeconds;
  if (parsed.data.mistakeCount !== undefined) updateData.mistakeCount = parsed.data.mistakeCount;
  if (parsed.data.hintsUsed !== undefined) updateData.hintsUsed = parsed.data.hintsUsed;

  const [game] = await db.update(gamesTable).set(updateData).where(eq(gamesTable.id, params.data.id)).returning();
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, game.puzzleId));

  res.json(SaveGameResponse.parse(formatGame(game, puzzle)));
});

router.post("/games/:id/complete", async (req, res): Promise<void> => {
  const params = CompleteGameParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CompleteGameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, existing.puzzleId));

  // Completion requests can be retried after a lost network response. Do not
  // award XP, gems, or stats a second time for an already completed game.
  if (existing.status === "completed") {
    res.json({ ...CompleteGameResponse.parse(formatGame(existing, puzzle)), isPersonalBest: false });
    return;
  }

  // Check for personal best (fastest prior completion for same profile+gridSize+difficulty)
  let isPersonalBest = false;
  if (existing.profileId && puzzle) {
    const [prevBest] = await db
      .select({ elapsedSeconds: gamesTable.elapsedSeconds })
      .from(gamesTable)
      .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
      .where(and(
        eq(gamesTable.profileId, existing.profileId),
        eq(gamesTable.status, "completed"),
        eq(puzzlesTable.gridSize, puzzle.gridSize),
        eq(puzzlesTable.difficulty, puzzle.difficulty),
      ))
      .orderBy(asc(gamesTable.elapsedSeconds))
      .limit(1);
    isPersonalBest = !prevBest || parsed.data.elapsedSeconds < (prevBest.elapsedSeconds ?? Infinity);
  }

  const mistakes = parsed.data.mistakeCount ?? 0;
  const hints = parsed.data.hintsUsed ?? 0;
  const elapsed = parsed.data.elapsedSeconds;
  const points = puzzle
    ? calcPoints(puzzle.gridSize, puzzle.difficulty, elapsed, mistakes, hints)
    : 0;
  const gemsEarned = calcGems(points);

  const [game] = await db
    .update(gamesTable)
    .set({
      status: "completed",
      elapsedSeconds: elapsed,
      mistakeCount: mistakes,
      hintsUsed: hints,
      points,
      completedAt: new Date(),
    })
    .where(and(eq(gamesTable.id, params.data.id), eq(gamesTable.status, "active")))
    .returning();
  if (!game) {
    const [completedGame] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.id));
    if (completedGame?.status === "completed") {
      res.json({ ...CompleteGameResponse.parse(formatGame(completedGame, puzzle)), isPersonalBest: false });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  // Award gems and XP to the player's profile
  if (existing.profileId) {
    const xpEarned = puzzle ? (XP_PER_DIFFICULTY[puzzle.difficulty] ?? 1) : 1;
    await db
      .update(profilesTable)
      .set({ gems: sql`gems + ${gemsEarned}`, xp: sql`xp + ${xpEarned}` })
      .where(eq(profilesTable.id, existing.profileId));

    updateStreakIfDailyChallenge(existing.profileId, existing.puzzleId).catch(() => {});
  }

  res.json({ ...CompleteGameResponse.parse(formatGame(game, puzzle)), isPersonalBest });

  awardPreviousPeriodBadges().catch(() => {});
  resolveChallengeForGame(params.data.id).catch(() => {});
});

export default router;
