// Configuration for how many pre-filled (given) cells a new Sudoku puzzle
// starts with, per grid size and difficulty. Edit these numbers to change
// what players see immediately when they start a new game — no other code
// changes are needed, `generatePuzzle` in `lib/sudoku.ts` reads from here.
//
// Grid sizes: 3 (Baby/3×3), 4 (Mini/4×4), 9 (Classic/9×9), 16 (Pro/16×16).
// Totals: 3×3 = 9 cells, 4×4 = 16 cells, 9×9 = 81 cells, 16×16 = 256 cells.

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const PUZZLE_CLUES: Record<number, Record<Difficulty, number>> = {
  3: {
    easy: 9, // all cells given = tutorial mode
    medium: 8,
    hard: 7,
    expert: 5,
  },
  4: {
    easy: 14, // 2 empty cells — very easy
    medium: 11,
    hard: 8,
    expert: 6,
  },
  9: {
    easy: 50, // ~31 cells to fill — genuinely easy
    medium: 38, // ~43 cells to fill
    hard: 28, // ~53 cells to fill
    expert: 22, // ~59 cells to fill — very challenging
  },
  16: {
    easy: 196, // remove 60 of 256 — very easy
    medium: 160, // remove 96 of 256
    hard: 128, // remove 128 of 256
    expert: 100, // remove 156 of 256 — very challenging
  },
};

/** Number of pre-filled cells for a given grid size + difficulty, with safe fallbacks. */
export function getClueCount(gridSize: number, difficulty: string): number {
  const sizeConfig = PUZZLE_CLUES[gridSize] ?? PUZZLE_CLUES[9];
  return sizeConfig[difficulty as Difficulty] ?? sizeConfig.medium;
}
