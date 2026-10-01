import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, dailyChallengesTable, memoryGamesTable, profilesTable } from "@workspace/db";
import { countAchievementProgress, SUDOKU_ACHIEVEMENT_TARGETS } from "../utils/achievement-progress";

const router: IRouter = Router();

router.get("/achievements/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId);
  if (isNaN(profileId)) {
    res.status(400).json({ error: "Invalid profileId" });
    return;
  }

  // ── Sudoku data ────────────────────────────────────────────────────────────
  const completedSudoku = await db
    .select({
      difficulty: puzzlesTable.difficulty,
      gridSize:   puzzlesTable.gridSize,
      elapsedSeconds: gamesTable.elapsedSeconds,
      mistakeCount:   gamesTable.mistakeCount,
      hintsUsed:      gamesTable.hintsUsed,
    })
    .from(gamesTable)
    .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
    .where(and(eq(gamesTable.profileId, profileId), eq(gamesTable.status, "completed")));

  const dailyRows = await db
    .select({ puzzleId: gamesTable.puzzleId })
    .from(gamesTable)
    .innerJoin(dailyChallengesTable, eq(gamesTable.puzzleId, dailyChallengesTable.puzzleId))
    .where(and(eq(gamesTable.profileId, profileId), eq(gamesTable.status, "completed")));

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));

  const totalWins  = completedSudoku.length;
  const dailyCount = dailyRows.length;
  const loginStreak = profile?.loginStreak ?? 0;

  // Repeat-play targets spread unlocks over multiple games instead of awarding
  // several grid and skill achievements for a single first-game completion.
  const gridTarget = SUDOKU_ACHIEVEMENT_TARGETS.gridPerSize;
  const gridCounts = new Map<number, number>();
  for (const game of completedSudoku) {
    gridCounts.set(game.gridSize, (gridCounts.get(game.gridSize) ?? 0) + 1);
  }
  const gridSizes = [3, 4, 6, 9, 16];
  const gridProgress = gridSizes.filter(size => (gridCounts.get(size) ?? 0) >= gridTarget).length;
  const has3x3 = (gridCounts.get(3) ?? 0) >= gridTarget;
  const has4x4 = (gridCounts.get(4) ?? 0) >= gridTarget;
  const has6x6 = (gridCounts.get(6) ?? 0) >= gridTarget;
  const has9x9 = (gridCounts.get(9) ?? 0) >= gridTarget;
  const has16x16 = (gridCounts.get(16) ?? 0) >= gridTarget;
  const hasAllGrids = gridProgress === gridSizes.length;

  const perfectCount = completedSudoku.filter(g => g.mistakeCount === 0).length;
  const noHintsCount = completedSudoku.filter(g => g.hintsUsed === 0).length;
  const expertCount = completedSudoku.filter(g => g.difficulty === "expert").length;
  const difficultyCounts = {
    easy: completedSudoku.filter(g => g.difficulty === "easy").length,
    medium: completedSudoku.filter(g => g.difficulty === "medium").length,
    hard: completedSudoku.filter(g => g.difficulty === "hard").length,
    expert: expertCount,
  };
  const difficultyTarget = SUDOKU_ACHIEVEMENT_TARGETS.eachDifficulty;
  const difficultyProgress = Object.values(difficultyCounts)
    .filter(count => count >= difficultyTarget).length;
  const hasAllDifficulties = difficultyProgress === 4;

  const flawlessExpertCount = completedSudoku.filter(g => g.difficulty === "expert" && g.mistakeCount === 0).length;
  const flawlessHardCount = completedSudoku.filter(g => g.difficulty === "hard" && g.mistakeCount === 0).length;
  const hintFreeHardCount = completedSudoku.filter(g => g.difficulty === "hard" && g.hintsUsed === 0).length;
  const hintFreeExpertCount = completedSudoku.filter(g => g.difficulty === "expert" && g.hintsUsed === 0).length;
  const bigBrainCount = completedSudoku.filter(g =>
    g.difficulty === "expert" && g.gridSize === 9 && g.mistakeCount === 0 && g.hintsUsed === 0
  ).length;
  const comebackCount = completedSudoku.filter(g => g.mistakeCount === 2).length;

  const sudoku4x4Games = completedSudoku.filter(g => g.gridSize === 4);
  const expertGames = completedSudoku.filter(g => g.difficulty === "expert");
  const sudoku16x16Games = completedSudoku.filter(g => g.gridSize === 16);
  const speedDemonCount = completedSudoku.filter(g => g.elapsedSeconds < 300).length;
  const lightningCount = completedSudoku.filter(g => g.elapsedSeconds < 120).length;
  const speed4x4Count = sudoku4x4Games.filter(g => g.elapsedSeconds < 60).length;
  const speedExpertCount = expertGames.filter(g => g.elapsedSeconds < 600).length;
  const speed16x16Count = sudoku16x16Games.filter(g => g.elapsedSeconds < 900).length;

  // ── Memory Match data ──────────────────────────────────────────────────────
  const completedMemory = await db
    .select({
      gridSize:       memoryGamesTable.gridSize,
      elapsedSeconds: memoryGamesTable.elapsedSeconds,
      flips:          memoryGamesTable.flips,
    })
    .from(memoryGamesTable)
    .where(and(eq(memoryGamesTable.profileId, profileId), eq(memoryGamesTable.status, "completed")));

  const totalMemoryWins = completedMemory.length;
  const memoryStreak    = profile?.memoryStreak ?? 0;
  const has8x8          = completedMemory.some(g => g.gridSize === 8);
  const hasMemory6x6    = completedMemory.some(g => g.gridSize === 6);

  const memory4x4Games  = completedMemory.filter(g => g.gridSize === 4);
  const best4x4Time     = memory4x4Games.length > 0 ? Math.min(...memory4x4Games.map(g => g.elapsedSeconds)) : Infinity;

  const memory6x6Games  = completedMemory.filter(g => g.gridSize === 6);
  const best6x6Time     = memory6x6Games.length > 0 ? Math.min(...memory6x6Games.map(g => g.elapsedSeconds)) : Infinity;

  function minFlipsForGrid(size: number): number {
    if (size === 2) return 4;
    if (size === 4) return 8;
    if (size === 6) return 16;
    return 32;
  }

  const hasMemoryPerfect = completedMemory.some(
    g => (g.flips ?? Infinity) <= minFlipsForGrid(g.gridSize)
  );
  const memoryPerfectCount = completedMemory.filter(
    g => (g.flips ?? Infinity) <= minFlipsForGrid(g.gridSize)
  ).length;

  const memory2x2Games  = completedMemory.filter(g => g.gridSize === 2);
  const hasMemory2x2    = memory2x2Games.length > 0;
  const best2x2Time     = hasMemory2x2 ? Math.min(...memory2x2Games.map(g => g.elapsedSeconds)) : Infinity;
  const memory8x8Games  = completedMemory.filter(g => g.gridSize === 8);
  const best8x8Time     = memory8x8Games.length > 0 ? Math.min(...memory8x8Games.map(g => g.elapsedSeconds)) : Infinity;
  const memoryAllGrids  = hasMemory2x2 && memory4x4Games.length > 0 && hasMemory6x6 && has8x8;

  res.json({
    // ── Sudoku: Milestones ───────────────────────────────────────────────────
    first_win:        { unlocked: totalWins >= 1,   progress: Math.min(totalWins, 1),   total: 1   },
    dedicated:        { unlocked: totalWins >= 10,  progress: Math.min(totalWins, 10),  total: 10  },
    half_century:     { unlocked: totalWins >= 50,  progress: Math.min(totalWins, 50),  total: 50  },
    century:          { unlocked: totalWins >= 100, progress: Math.min(totalWins, 100), total: 100 },
    double_century:   { unlocked: totalWins >= 200, progress: Math.min(totalWins, 200), total: 200 },
    triple_century:   { unlocked: totalWins >= 300, progress: Math.min(totalWins, 300), total: 300 },
    legend:           { unlocked: totalWins >= 500, progress: Math.min(totalWins, 500), total: 500 },

    // ── Sudoku: Grid Explorer ────────────────────────────────────────────────
    baby_steps:       countAchievementProgress(gridCounts.get(3) ?? 0, gridTarget),
    mini_master:      countAchievementProgress(gridCounts.get(4) ?? 0, gridTarget),
    dual_master:      countAchievementProgress(gridCounts.get(6) ?? 0, gridTarget),
    classic_champ:    countAchievementProgress(gridCounts.get(9) ?? 0, gridTarget),
    pro_player:       countAchievementProgress(gridCounts.get(16) ?? 0, gridTarget),
    all_grids:        { unlocked: hasAllGrids, progress: gridProgress, total: gridSizes.length },

    // ── Sudoku: Difficulty ───────────────────────────────────────────────────
    medium_solver:    countAchievementProgress(difficultyCounts.medium, SUDOKU_ACHIEVEMENT_TARGETS.medium),
    hard_solver:      countAchievementProgress(difficultyCounts.hard, SUDOKU_ACHIEVEMENT_TARGETS.hard),
    expert_solver:    countAchievementProgress(expertCount, SUDOKU_ACHIEVEMENT_TARGETS.expert),
    all_difficulties: { unlocked: hasAllDifficulties, progress: difficultyProgress, total: 4 },
    expert_5:         { unlocked: expertCount >= 5,   progress: Math.min(expertCount, 5),   total: 5 },
    flawless_expert:  countAchievementProgress(flawlessExpertCount, SUDOKU_ACHIEVEMENT_TARGETS.flawlessDifficulty),
    flawless_hard:    countAchievementProgress(flawlessHardCount, SUDOKU_ACHIEVEMENT_TARGETS.flawlessDifficulty),

    // ── Sudoku: Skill ────────────────────────────────────────────────────────
    perfectionist:    countAchievementProgress(perfectCount, SUDOKU_ACHIEVEMENT_TARGETS.perfectionist),
    perfectionist_5:  { unlocked: perfectCount >= 5,  progress: Math.min(perfectCount, 5),  total: 5 },
    no_hints:         countAchievementProgress(noHintsCount, SUDOKU_ACHIEVEMENT_TARGETS.noHints),
    no_hints_10:      { unlocked: noHintsCount >= 10, progress: Math.min(noHintsCount, 10), total: 10 },
    hint_free_hard:   countAchievementProgress(hintFreeHardCount, SUDOKU_ACHIEVEMENT_TARGETS.hintFreeDifficulty),
    hint_free_expert: countAchievementProgress(hintFreeExpertCount, SUDOKU_ACHIEVEMENT_TARGETS.hintFreeDifficulty),
    big_brain:        countAchievementProgress(bigBrainCount, SUDOKU_ACHIEVEMENT_TARGETS.bigBrain),
    comeback_kid:     countAchievementProgress(comebackCount, SUDOKU_ACHIEVEMENT_TARGETS.comeback),
    speed_demon:      countAchievementProgress(speedDemonCount, SUDOKU_ACHIEVEMENT_TARGETS.speedDemon),
    lightning:        countAchievementProgress(lightningCount, SUDOKU_ACHIEVEMENT_TARGETS.lightning),
    speed_4x4:        countAchievementProgress(speed4x4Count, SUDOKU_ACHIEVEMENT_TARGETS.speedByGrid),
    speed_expert:     countAchievementProgress(speedExpertCount, SUDOKU_ACHIEVEMENT_TARGETS.speedByGrid),
    speed_16x16:      countAchievementProgress(speed16x16Count, SUDOKU_ACHIEVEMENT_TARGETS.speedByGrid),

    // ── Sudoku: Daily ────────────────────────────────────────────────────────
    daily_devotion:   { unlocked: dailyCount >= 7,   progress: Math.min(dailyCount, 7),   total: 7   },
    daily_faithful:   { unlocked: dailyCount >= 30,  progress: Math.min(dailyCount, 30),  total: 30  },
    daily_century:    { unlocked: dailyCount >= 100, progress: Math.min(dailyCount, 100), total: 100 },

    // ── Sudoku: Streaks ──────────────────────────────────────────────────────
    streak_3:         { unlocked: loginStreak >= 3,  progress: Math.min(loginStreak, 3),  total: 3  },
    streak_7:         { unlocked: loginStreak >= 7,  progress: Math.min(loginStreak, 7),  total: 7  },
    streak_30:        { unlocked: loginStreak >= 30, progress: Math.min(loginStreak, 30), total: 30 },

    // ── Memory Match: Milestones ─────────────────────────────────────────────
    memory_first_win:       { unlocked: totalMemoryWins >= 1,   progress: Math.min(totalMemoryWins, 1),   total: 1   },
    memory_dedicated:       { unlocked: totalMemoryWins >= 10,  progress: Math.min(totalMemoryWins, 10),  total: 10  },
    memory_half_century:    { unlocked: totalMemoryWins >= 50,  progress: Math.min(totalMemoryWins, 50),  total: 50  },
    memory_century:         { unlocked: totalMemoryWins >= 100, progress: Math.min(totalMemoryWins, 100), total: 100 },
    memory_double_century:  { unlocked: totalMemoryWins >= 200, progress: Math.min(totalMemoryWins, 200), total: 200 },
    memory_legend:          { unlocked: totalMemoryWins >= 500, progress: Math.min(totalMemoryWins, 500), total: 500 },

    // ── Memory Match: Grid Size ──────────────────────────────────────────────
    memory_tiny:          { unlocked: hasMemory2x2,   progress: hasMemory2x2   ? 1 : 0, total: 1 },
    memory_challenger:    { unlocked: hasMemory6x6,   progress: hasMemory6x6   ? 1 : 0, total: 1 },
    memory_big_board:     { unlocked: has8x8,         progress: has8x8         ? 1 : 0, total: 1 },
    memory_all_grids:     { unlocked: memoryAllGrids,
      progress: [hasMemory2x2, memory4x4Games.length > 0, hasMemory6x6, has8x8].filter(Boolean).length, total: 4 },
    memory_big_board_10:  { unlocked: memory8x8Games.length >= 10, progress: Math.min(memory8x8Games.length, 10), total: 10 },

    // ── Memory Match: Speed ──────────────────────────────────────────────────
    memory_speed_2x2:     { unlocked: best2x2Time <= 8,   progress: best2x2Time <= 8   ? 1 : 0, total: 1 },
    memory_speed_demon:   { unlocked: best4x4Time <= 45,  progress: best4x4Time <= 45  ? 1 : 0, total: 1 },
    memory_lightning:     { unlocked: best4x4Time <= 25,  progress: best4x4Time <= 25  ? 1 : 0, total: 1 },
    memory_speed_6x6:     { unlocked: best6x6Time <= 60,  progress: best6x6Time <= 60  ? 1 : 0, total: 1 },
    memory_speed_8x8:     { unlocked: best8x8Time <= 90,  progress: best8x8Time <= 90  ? 1 : 0, total: 1 },
    memory_lightning_8x8: { unlocked: best8x8Time <= 60,  progress: best8x8Time <= 60  ? 1 : 0, total: 1 },

    // ── Memory Match: Precision ──────────────────────────────────────────────
    memory_perfectionist: { unlocked: hasMemoryPerfect,          progress: hasMemoryPerfect          ? 1 : 0, total: 1 },
    memory_five_perfect:  { unlocked: memoryPerfectCount >= 5,   progress: Math.min(memoryPerfectCount, 5),   total: 5 },

    // ── Memory Match: Streaks ────────────────────────────────────────────────
    memory_streak_3:      { unlocked: memoryStreak >= 3,  progress: Math.min(memoryStreak, 3),  total: 3  },
    memory_streak_7:      { unlocked: memoryStreak >= 7,  progress: Math.min(memoryStreak, 7),  total: 7  },
    memory_streak_30:     { unlocked: memoryStreak >= 30, progress: Math.min(memoryStreak, 30), total: 30 },
  });
});

export default router;
