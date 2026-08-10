// Configuration for how many pre-filled cells a new Sudoku puzzle starts with.
// Keep this copy in sync with the API artifact because the standalone server
// is intentionally self-contained.

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const PUZZLE_CLUES: Record<number, Record<Difficulty, number>> = {
  3: {
    easy: 8,
    medium: 7,
    hard: 6,
    expert: 5,
  },
  4: {
    easy: 14,
    medium: 11,
    hard: 8,
    expert: 6,
  },
  6: {
    easy: 24,
    medium: 18,
    hard: 14,
    expert: 10,
  },
  9: {
    easy: 50,
    medium: 38,
    hard: 28,
    expert: 22,
  },
  16: {
    easy: 196,
    medium: 160,
    hard: 128,
    expert: 100,
  },
};

/** Number of pre-filled cells for a grid size and difficulty. */
export function getClueCount(gridSize: number, difficulty: string): number {
  const sizeConfig = PUZZLE_CLUES[gridSize] ?? PUZZLE_CLUES[9];
  return sizeConfig[difficulty as Difficulty] ?? sizeConfig.medium;
}