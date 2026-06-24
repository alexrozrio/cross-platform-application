import { Router, type IRouter } from "express";
import { eq, and, count, sql } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, dailyChallengesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/achievements/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId);
  if (isNaN(profileId)) {
    res.status(400).json({ error: "Invalid profileId" });
    return;
  }

  const completed = await db
    .select({
      difficulty: puzzlesTable.difficulty,
      elapsedSeconds: gamesTable.elapsedSeconds,
      mistakeCount: gamesTable.mistakeCount,
      hintsUsed: gamesTable.hintsUsed,
      puzzleId: gamesTable.puzzleId,
    })
    .from(gamesTable)
    .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
    .where(
      and(
        eq(gamesTable.profileId, profileId),
        eq(gamesTable.status, "completed"),
      )
    );

  // Daily challenge completions count
  const dailyRows = await db
    .select({ puzzleId: gamesTable.puzzleId })
    .from(gamesTable)
    .innerJoin(dailyChallengesTable, eq(gamesTable.puzzleId, dailyChallengesTable.puzzleId))
    .where(
      and(
        eq(gamesTable.profileId, profileId),
        eq(gamesTable.status, "completed"),
      )
    );

  const totalWins = completed.length;
  const dailyCount = dailyRows.length;
  const minTime = completed.length > 0 ? Math.min(...completed.map(g => g.elapsedSeconds)) : Infinity;
  const hasPerfect = completed.some(g => g.mistakeCount === 0);
  const hasNoHints = completed.some(g => g.hintsUsed === 0);
  const hasExpert = completed.some(g => g.difficulty === "expert");
  const hasHard = completed.some(g => g.difficulty === "hard");
  const hasMedium = completed.some(g => g.difficulty === "medium");

  res.json({
    first_win:       { unlocked: totalWins >= 1,   progress: Math.min(totalWins, 1),   total: 1   },
    dedicated:       { unlocked: totalWins >= 10,  progress: Math.min(totalWins, 10),  total: 10  },
    half_century:    { unlocked: totalWins >= 50,  progress: Math.min(totalWins, 50),  total: 50  },
    century:         { unlocked: totalWins >= 100, progress: Math.min(totalWins, 100), total: 100 },
    medium_solver:   { unlocked: hasMedium,  progress: hasMedium  ? 1 : 0, total: 1 },
    hard_solver:     { unlocked: hasHard,    progress: hasHard    ? 1 : 0, total: 1 },
    expert_solver:   { unlocked: hasExpert,  progress: hasExpert  ? 1 : 0, total: 1 },
    perfectionist:   { unlocked: hasPerfect, progress: hasPerfect ? 1 : 0, total: 1 },
    no_hints:        { unlocked: hasNoHints, progress: hasNoHints ? 1 : 0, total: 1 },
    speed_demon:     { unlocked: minTime <= 300, progress: minTime <= 300 ? 1 : 0, total: 1 },
    lightning:       { unlocked: minTime <= 120, progress: minTime <= 120 ? 1 : 0, total: 1 },
    daily_devotion:  { unlocked: dailyCount >= 7,  progress: Math.min(dailyCount, 7),  total: 7  },
    daily_faithful:  { unlocked: dailyCount >= 30, progress: Math.min(dailyCount, 30), total: 30 },
  });
});

export default router;
