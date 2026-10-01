import { describe, expect, it } from "vitest";
import {
  countAchievementProgress,
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