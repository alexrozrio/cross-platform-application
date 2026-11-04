import { describe, expect, it } from "vitest";
import {
  countAchievementProgress,
  getJigsawAchievementProgress,
  JIGSAW_ACHIEVEMENT_TARGETS,
  SUDOKU_ACHIEVEMENT_TARGETS,
} from "../utils/achievement-progress";

describe("Sudoku achievement progression", () => {
  it("keeps repeated-play targets above a single-game unlock", () => {
    expect(SUDOKU_ACHIEVEMENT_TARGETS.gridPerSize).toBe(3);
    expect(SUDOKU_ACHIEVEMENT_TARGETS.perfectionist).toBe(3);
    expect(SUDOKU_ACHIEVEMENT_TARGETS.noHints).toBe(5);
    expect(SUDOKU_ACHIEVEMENT_TARGETS.lightning).toBe(5);
  });

  it("shows incremental progress and unlocks only at the target", () => {
    expect(countAchievementProgress(1, 3)).toEqual({
      unlocked: false,
      progress: 1,
      total: 3,
    });
    expect(countAchievementProgress(2, 3).unlocked).toBe(false);
    expect(countAchievementProgress(3, 3)).toEqual({
      unlocked: true,
      progress: 3,
      total: 3,
    });
  });

  it("clamps progress to its target and zero", () => {
    expect(countAchievementProgress(9, 3).progress).toBe(3);
    expect(countAchievementProgress(-2, 3).progress).toBe(0);
  });
});

describe("Jigsaw achievement progression", () => {
  const game = (
    gridSize: number,
    level = 1,
    elapsedSeconds = 120,
    dailyDate: string | null = null,
  ) => ({ gridSize, level, elapsedSeconds, dailyDate });

  it("tracks completion milestones from finished games", () => {
    const games = Array.from({ length: 25 }, (_, index) => game(2 + (index % 4)));
    const progress = getJigsawAchievementProgress(games);

    expect(JIGSAW_ACHIEVEMENT_TARGETS.quarterCentury).toBe(25);
    expect(progress.jigsaw_quarter_century).toEqual({ unlocked: true, progress: 25, total: 25 });
    expect(progress.jigsaw_half_century).toEqual({ unlocked: false, progress: 25, total: 50 });
  });

  it("tracks board-size, speed, advanced, and distinct daily completions", () => {
    const games = [
      game(2, 3, 30, "2026-01-01"),
      game(3, 3, 60, "2026-01-02"),
      game(4, 3, 120, "2026-01-03"),
      game(5, 3, 180, "2026-01-04"),
      game(2, 1, 200, "2026-01-01"),
    ];
    const progress = getJigsawAchievementProgress(games);

    expect(progress.jigsaw_all_sizes.unlocked).toBe(true);
    expect(progress.jigsaw_grid_veteran.progress).toBe(0);
    expect(progress.jigsaw_speed_3x3.unlocked).toBe(true);
    expect(progress.jigsaw_speed_4x4.unlocked).toBe(true);
    expect(progress.jigsaw_speed_5x5.unlocked).toBe(true);
    expect(progress.jigsaw_advanced_10.progress).toBe(4);
    expect(progress.jigsaw_daily_7.progress).toBe(4);
  });
});