import { describe, expect, it } from "vitest";
import {
  countAchievementProgress,
  getJigsawAchievementProgress,
  getOddImageAchievementProgress,
  JIGSAW_ACHIEVEMENT_TARGETS,
  ODD_IMAGE_ACHIEVEMENT_TARGETS,
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

describe("Odd Images achievement progression", () => {
  const game = (
    level: string,
    theme = "shapes",
    elapsedSeconds = 120,
    questions = 5,
    correct = questions,
    dailyDate: string | null = null,
  ) => ({ level, theme, elapsedSeconds, questions, correct, dailyDate });

  it("tracks completion milestones from winning games only", () => {
    const games = [
      ...Array.from({ length: 10 }, () => game("easy")),
      game("easy", "shapes", 120, 5, 0),
    ];
    const progress = getOddImageAchievementProgress(games);

    expect(ODD_IMAGE_ACHIEVEMENT_TARGETS.dedicated).toBe(10);
    expect(progress.odd_images_dedicated).toEqual({ unlocked: true, progress: 10, total: 10 });
    expect(progress.odd_images_half_century).toEqual({ unlocked: false, progress: 10, total: 50 });
  });

  it("tracks levels, themes, perfect games, speed, and distinct daily dates", () => {
    const games = [
      game("easy", "shapes", 89, 5, 5, "2026-01-01"),
      game("medium", "jungle", 149, 8, 8, "2026-01-02"),
      game("hard", "ocean", 239, 10, 10, "2026-01-03"),
      game("expert", "space", 359, 12, 12, "2026-01-04"),
      game("easy", "vehicles", 200, 5, 4, "2026-01-01"),
      game("medium", "adventure", 200, 8, 8, "2026-01-05"),
      game("hard", "peppa_pig", 200, 10, 10, "2026-01-06"),
      game("expert", "paw_patrol", 200, 12, 12, "2026-01-07"),
    ];
    const progress = getOddImageAchievementProgress(games);

    expect(progress.odd_images_all_levels.unlocked).toBe(true);
    expect(progress.odd_images_theme_explorer.progress).toBe(5);
    expect(progress.odd_images_perfect_5).toEqual({ unlocked: true, progress: 5, total: 5 });
    expect(progress.odd_images_speed_easy.unlocked).toBe(true);
    expect(progress.odd_images_speed_medium.unlocked).toBe(true);
    expect(progress.odd_images_speed_hard.unlocked).toBe(true);
    expect(progress.odd_images_speed_expert.unlocked).toBe(true);
    expect(progress.odd_images_daily_7.progress).toBe(7);
  });
});