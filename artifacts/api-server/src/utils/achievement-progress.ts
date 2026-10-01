export const SUDOKU_ACHIEVEMENT_TARGETS = {
  gridPerSize: 3,
  medium: 3,
  hard: 5,
  expert: 10,
  eachDifficulty: 3,
  perfectionist: 3,
  noHints: 5,
  flawlessDifficulty: 3,
  hintFreeDifficulty: 3,
  bigBrain: 3,
  comeback: 3,
  speedDemon: 3,
  lightning: 5,
  speedByGrid: 3,
} as const;

export interface CountAchievementProgress {
  unlocked: boolean;
  progress: number;
  total: number;
}

export function countAchievementProgress(count: number, target: number): CountAchievementProgress {
  const progress = Math.min(Math.max(0, count), target);
  return {
    unlocked: progress >= target,
    progress,
    total: target,
  };
}