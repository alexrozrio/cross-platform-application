import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, memoryGamesTable, profilesTable } from "@workspace/db";
import { GetPlayerStatsParams, GetPlayerStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/:profileId", async (req, res): Promise<void> => {
  const params = GetPlayerStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const profileId = params.data.profileId;

  // ── Sudoku stats ──────────────────────────────────────────────────────────
  const allGames = await db
    .select({
      status: gamesTable.status,
      elapsedSeconds: gamesTable.elapsedSeconds,
      mistakeCount: gamesTable.mistakeCount,
      completedAt: gamesTable.completedAt,
      difficulty: puzzlesTable.difficulty,
    })
    .from(gamesTable)
    .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
    .where(eq(gamesTable.profileId, profileId))
    .orderBy(desc(gamesTable.createdAt));

  const totalGames = allGames.length;
  const wins = allGames.filter((g) => g.status === "completed");
  const totalWins = wins.length;
  const winRate = totalGames > 0 ? totalWins / totalGames : 0;

  const bestTimes: Record<string, number | null> = {
    easy: null, medium: null, hard: null, expert: null,
  };
  for (const diff of ["easy", "medium", "hard", "expert"] as const) {
    const diffWins = wins.filter((g) => g.difficulty === diff);
    if (diffWins.length > 0) bestTimes[diff] = Math.min(...diffWins.map((g) => g.elapsedSeconds));
  }

  const totalTime = wins.reduce((sum, g) => sum + g.elapsedSeconds, 0);
  const averageTime = totalWins > 0 ? Math.round(totalTime / totalWins) : null;
  const totalMistakes = allGames.reduce((sum, g) => sum + g.mistakeCount, 0);

  let currentStreak = 0;
  for (const game of allGames) {
    if (game.status === "completed") currentStreak++;
    else break;
  }

  // ── Memory Match stats ────────────────────────────────────────────────────
  const allMemoryGames = await db
    .select({
      status: memoryGamesTable.status,
      elapsedSeconds: memoryGamesTable.elapsedSeconds,
      flips: memoryGamesTable.flips,
      gridSize: memoryGamesTable.gridSize,
      points: memoryGamesTable.points,
    })
    .from(memoryGamesTable)
    .where(eq(memoryGamesTable.profileId, profileId))
    .orderBy(desc(memoryGamesTable.createdAt));

  const memoryWins = allMemoryGames.filter((g) => g.status === "completed");
  const totalMemoryGames = allMemoryGames.length;
  const totalMemoryWins = memoryWins.length;
  const memoryWinRate = totalMemoryGames > 0 ? totalMemoryWins / totalMemoryGames : 0;

  const memoryBestTimes: Record<string, number | null> = { 2: null, 4: null, 6: null, 8: null } as unknown as Record<string, number | null>;
  for (const size of [2, 4, 6, 8]) {
    const sizeWins = memoryWins.filter((g) => g.gridSize === size);
    if (sizeWins.length > 0) memoryBestTimes[String(size)] = Math.min(...sizeWins.map((g) => g.elapsedSeconds));
  }

  const totalMemoryTime = memoryWins.reduce((sum, g) => sum + (g.elapsedSeconds ?? 0), 0);
  const averageMemoryTime = totalMemoryWins > 0 ? Math.round(totalMemoryTime / totalMemoryWins) : null;
  const totalFlips = memoryWins.reduce((sum, g) => sum + (g.flips ?? 0), 0);
  const averageFlips = totalMemoryWins > 0 ? Math.round(totalFlips / totalMemoryWins) : null;

  // streak from profile
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  const memoryCurrentStreak = profile?.memoryStreak ?? 0;
  const memoryLongestStreak = profile?.longestMemoryStreak ?? 0;

  const stats = {
    profileId,
    totalGames,
    totalWins,
    winRate,
    bestTimes,
    averageTime,
    totalMistakes,
    currentStreak,
    memory: {
      totalGames: totalMemoryGames,
      totalWins: totalMemoryWins,
      winRate: memoryWinRate,
      bestTimes: memoryBestTimes,
      averageTime: averageMemoryTime,
      averageFlips,
      currentStreak: memoryCurrentStreak,
      longestStreak: memoryLongestStreak,
    },
  };

  res.json(GetPlayerStatsResponse.parse(stats));
});

export default router;
