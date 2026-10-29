import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, memoryGamesTable, jigsawGamesTable, profilesTable } from "@workspace/db";
import { GetPlayerStatsParams, GetPlayerStatsResponse } from "@workspace/api-zod";
import { hasMeaningfulMemoryActivity, hasMeaningfulSudokuActivity } from "../utils/game-activity";

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
      currentGrid: gamesTable.currentGrid,
      initialGrid: puzzlesTable.grid,
      completedAt: gamesTable.completedAt,
      difficulty: puzzlesTable.difficulty,
      gridSize: puzzlesTable.gridSize,
    })
    .from(gamesTable)
    .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
    .where(eq(gamesTable.profileId, profileId))
    .orderBy(desc(gamesTable.createdAt));

  // Creating a row is not enough to count as a played game: setup auto-starts
  // and difficulty changes can create and immediately abandon a row. Count
  // completed games always, otherwise require either 10 seconds or one move.
  const meaningfulGames = allGames.filter(hasMeaningfulSudokuActivity);
  const totalGames = meaningfulGames.length;
  const wins = meaningfulGames.filter((g) => g.status === "completed");
  const totalWins = wins.length;
  const winRate = totalGames > 0 ? totalWins / totalGames : 0;

  const bestTimes: Record<string, number | null> = {};
  for (const size of [3, 4, 6, 9, 16]) {
    for (const diff of ["easy", "medium", "hard", "expert"] as const) {
      const matching = wins.filter((g) => g.gridSize === size && g.difficulty === diff);
      bestTimes[`${size}-${diff}`] = matching.length > 0
        ? Math.min(...matching.map((g) => g.elapsedSeconds))
        : null;
    }
  }

  const totalTime = wins.reduce((sum, g) => sum + g.elapsedSeconds, 0);
  const averageTime = totalWins > 0 ? Math.round(totalTime / totalWins) : null;
  const totalMistakes = meaningfulGames.reduce((sum, g) => sum + g.mistakeCount, 0);

  let currentStreak = 0;
  for (const game of meaningfulGames) {
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
  const meaningfulMemoryGames = allMemoryGames.filter(hasMeaningfulMemoryActivity);
  const totalMemoryGames = meaningfulMemoryGames.length;
  const totalMemoryWins = meaningfulMemoryGames.filter((g) => g.status === "completed").length;
  const memoryWinRate = totalMemoryGames > 0 ? totalMemoryWins / totalMemoryGames : 0;
  let memoryWinStreak = 0;
  for (const game of meaningfulMemoryGames) {
    if (game.status === "completed") memoryWinStreak++;
    else break;
  }

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

  // ── Jigsaw stats ──────────────────────────────────────────────────────────
  const allJigsawGames = await db
    .select({
      status: jigsawGamesTable.status,
      gridSize: jigsawGamesTable.gridSize,
      level: jigsawGamesTable.level,
      elapsedSeconds: jigsawGamesTable.elapsedSeconds,
      points: jigsawGamesTable.points,
      dailyDate: jigsawGamesTable.dailyDate,
    })
    .from(jigsawGamesTable)
    .where(eq(jigsawGamesTable.profileId, profileId))
    .orderBy(desc(jigsawGamesTable.createdAt));
  const jigsawWins = allJigsawGames.filter((game) => game.status === "completed");
  const jigsawBestTimes: Record<string, number | null> = {};
  for (const size of [2, 3, 4, 5]) {
    for (const level of [1, 2, 3]) {
      const matching = jigsawWins.filter((game) => game.gridSize === size && game.level === level);
      jigsawBestTimes[`${size}-${level}`] = matching.length > 0
        ? Math.min(...matching.map((game) => game.elapsedSeconds))
        : null;
    }
  }
  const jigsawDailyDates = new Set(jigsawWins.flatMap((game) => game.dailyDate ? [game.dailyDate] : []));
  let jigsawWinStreak = 0;
  for (const game of allJigsawGames) {
    if (game.status === "completed") jigsawWinStreak++;
    else break;
  }

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
      winStreak: memoryWinStreak,
    },
    jigsaw: {
      totalGames: allJigsawGames.length,
      totalWins: jigsawWins.length,
      winRate: allJigsawGames.length > 0 ? jigsawWins.length / allJigsawGames.length : 0,
      bestTimes: jigsawBestTimes,
      averageTime: jigsawWins.length > 0
        ? Math.round(jigsawWins.reduce((sum, game) => sum + game.elapsedSeconds, 0) / jigsawWins.length)
        : null,
      totalPoints: jigsawWins.reduce((sum, game) => sum + (game.points ?? 0), 0),
      dailyChallengesCompleted: jigsawDailyDates.size,
      winStreak: jigsawWinStreak,
    },
  };

  res.json(GetPlayerStatsResponse.parse(stats));
});

export default router;
