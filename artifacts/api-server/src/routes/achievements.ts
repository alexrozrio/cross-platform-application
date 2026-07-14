import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, dailyChallengesTable, memoryGamesTable, profilesTable } from "@workspace/db";

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

  const minTime    = totalWins > 0 ? Math.min(...completedSudoku.map(g => g.elapsedSeconds)) : Infinity;
  const hasPerfect = completedSudoku.some(g => g.mistakeCount === 0);
  const hasNoHints = completedSudoku.some(g => g.hintsUsed === 0);
  const hasExpert  = completedSudoku.some(g => g.difficulty === "expert");
  const hasHard    = completedSudoku.some(g => g.difficulty === "hard");
  const hasMedium  = completedSudoku.some(g => g.difficulty === "medium");

  // Grid size completions
  const has3x3  = completedSudoku.some(g => g.gridSize === 3);
  const has4x4  = completedSudoku.some(g => g.gridSize === 4);
  const has9x9  = completedSudoku.some(g => g.gridSize === 9);
  const has16x16 = completedSudoku.some(g => g.gridSize === 16);
  const hasAllGrids = has3x3 && has4x4 && has9x9 && has16x16;

  // Advanced skill
  const hasFlawlessExpert = completedSudoku.some(g => g.difficulty === "expert" && g.mistakeCount === 0);
  const hasHintFreeHard   = completedSudoku.some(g => g.difficulty === "hard" && g.hintsUsed === 0);
  const hasComebackKid    = completedSudoku.some(g => g.mistakeCount === 2);

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
  const has6x6          = completedMemory.some(g => g.gridSize === 6);

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

  res.json({
    // ── Sudoku: Milestones ───────────────────────────────────────────────────
    first_win:        { unlocked: totalWins >= 1,   progress: Math.min(totalWins, 1),   total: 1   },
    dedicated:        { unlocked: totalWins >= 10,  progress: Math.min(totalWins, 10),  total: 10  },
    half_century:     { unlocked: totalWins >= 50,  progress: Math.min(totalWins, 50),  total: 50  },
    century:          { unlocked: totalWins >= 100, progress: Math.min(totalWins, 100), total: 100 },
    double_century:   { unlocked: totalWins >= 200, progress: Math.min(totalWins, 200), total: 200 },
    legend:           { unlocked: totalWins >= 500, progress: Math.min(totalWins, 500), total: 500 },

    // ── Sudoku: Grid Explorer ────────────────────────────────────────────────
    baby_steps:       { unlocked: has3x3,      progress: has3x3      ? 1 : 0, total: 1 },
    mini_master:      { unlocked: has4x4,      progress: has4x4      ? 1 : 0, total: 1 },
    classic_champ:    { unlocked: has9x9,      progress: has9x9      ? 1 : 0, total: 1 },
    pro_player:       { unlocked: has16x16,    progress: has16x16    ? 1 : 0, total: 1 },
    all_grids:        { unlocked: hasAllGrids,
      progress: [has3x3, has4x4, has9x9, has16x16].filter(Boolean).length, total: 4 },

    // ── Sudoku: Difficulty ───────────────────────────────────────────────────
    medium_solver:    { unlocked: hasMedium,        progress: hasMedium        ? 1 : 0, total: 1 },
    hard_solver:      { unlocked: hasHard,          progress: hasHard          ? 1 : 0, total: 1 },
    expert_solver:    { unlocked: hasExpert,        progress: hasExpert        ? 1 : 0, total: 1 },
    flawless_expert:  { unlocked: hasFlawlessExpert, progress: hasFlawlessExpert ? 1 : 0, total: 1 },

    // ── Sudoku: Skill ────────────────────────────────────────────────────────
    perfectionist:    { unlocked: hasPerfect,      progress: hasPerfect      ? 1 : 0, total: 1 },
    no_hints:         { unlocked: hasNoHints,      progress: hasNoHints      ? 1 : 0, total: 1 },
    hint_free_hard:   { unlocked: hasHintFreeHard, progress: hasHintFreeHard ? 1 : 0, total: 1 },
    comeback_kid:     { unlocked: hasComebackKid,  progress: hasComebackKid  ? 1 : 0, total: 1 },
    speed_demon:      { unlocked: minTime <= 300,  progress: minTime <= 300  ? 1 : 0, total: 1 },
    lightning:        { unlocked: minTime <= 120,  progress: minTime <= 120  ? 1 : 0, total: 1 },

    // ── Sudoku: Daily ────────────────────────────────────────────────────────
    daily_devotion:   { unlocked: dailyCount >= 7,   progress: Math.min(dailyCount, 7),   total: 7   },
    daily_faithful:   { unlocked: dailyCount >= 30,  progress: Math.min(dailyCount, 30),  total: 30  },
    daily_century:    { unlocked: dailyCount >= 100, progress: Math.min(dailyCount, 100), total: 100 },

    // ── Sudoku: Streaks ──────────────────────────────────────────────────────
    streak_3:         { unlocked: loginStreak >= 3,  progress: Math.min(loginStreak, 3),  total: 3  },
    streak_7:         { unlocked: loginStreak >= 7,  progress: Math.min(loginStreak, 7),  total: 7  },
    streak_30:        { unlocked: loginStreak >= 30, progress: Math.min(loginStreak, 30), total: 30 },

    // ── Memory Match: Milestones ─────────────────────────────────────────────
    memory_first_win:     { unlocked: totalMemoryWins >= 1,   progress: Math.min(totalMemoryWins, 1),   total: 1   },
    memory_dedicated:     { unlocked: totalMemoryWins >= 10,  progress: Math.min(totalMemoryWins, 10),  total: 10  },
    memory_half_century:  { unlocked: totalMemoryWins >= 50,  progress: Math.min(totalMemoryWins, 50),  total: 50  },
    memory_century:       { unlocked: totalMemoryWins >= 100, progress: Math.min(totalMemoryWins, 100), total: 100 },

    // ── Memory Match: Skill ──────────────────────────────────────────────────
    memory_big_board:     { unlocked: has8x8,             progress: has8x8             ? 1 : 0, total: 1 },
    memory_challenger:    { unlocked: has6x6,             progress: has6x6             ? 1 : 0, total: 1 },
    memory_speed_demon:   { unlocked: best4x4Time <= 45,  progress: best4x4Time <= 45  ? 1 : 0, total: 1 },
    memory_lightning:     { unlocked: best4x4Time <= 25,  progress: best4x4Time <= 25  ? 1 : 0, total: 1 },
    memory_speed_6x6:     { unlocked: best6x6Time <= 60,  progress: best6x6Time <= 60  ? 1 : 0, total: 1 },
    memory_perfectionist: { unlocked: hasMemoryPerfect,   progress: hasMemoryPerfect   ? 1 : 0, total: 1 },

    // ── Memory Match: Daily ──────────────────────────────────────────────────
    memory_streak_7:      { unlocked: memoryStreak >= 7,  progress: Math.min(memoryStreak, 7),  total: 7  },
    memory_streak_30:     { unlocked: memoryStreak >= 30, progress: Math.min(memoryStreak, 30), total: 30 },
  });
});

export default router;
