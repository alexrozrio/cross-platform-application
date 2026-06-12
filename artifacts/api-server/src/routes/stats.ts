import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, gamesTable, puzzlesTable } from "@workspace/db";
import { GetPlayerStatsParams, GetPlayerStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/:profileId", async (req, res): Promise<void> => {
  const params = GetPlayerStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const profileId = params.data.profileId;

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
    easy: null,
    medium: null,
    hard: null,
    expert: null,
  };

  for (const diff of ["easy", "medium", "hard", "expert"] as const) {
    const diffWins = wins.filter((g) => g.difficulty === diff);
    if (diffWins.length > 0) {
      bestTimes[diff] = Math.min(...diffWins.map((g) => g.elapsedSeconds));
    }
  }

  const totalTime = wins.reduce((sum, g) => sum + g.elapsedSeconds, 0);
  const averageTime = totalWins > 0 ? Math.round(totalTime / totalWins) : null;
  const totalMistakes = allGames.reduce((sum, g) => sum + g.mistakeCount, 0);

  let currentStreak = 0;
  for (const game of allGames) {
    if (game.status === "completed") {
      currentStreak++;
    } else {
      break;
    }
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
  };

  res.json(GetPlayerStatsResponse.parse(stats));
});

export default router;
