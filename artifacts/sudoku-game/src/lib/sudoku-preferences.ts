import type { SudokuDifficulty, SudokuGridSize } from "@/lib/sudoku-routes";

export const LAST_GRID_SIZE_KEY = "sudoku-last-grid-size";
export const LAST_DIFFICULTY_KEY = "sudoku-last-difficulty";

const GRID_SIZES: SudokuGridSize[] = [3, 4, 6, 9, 16];
const DIFFICULTIES: SudokuDifficulty[] = ["easy", "medium", "hard", "expert"];

export function getLastPlayedGridSize(): SudokuGridSize | null {
  try {
    const stored = Number(localStorage.getItem(LAST_GRID_SIZE_KEY));
    return GRID_SIZES.includes(stored as SudokuGridSize)
      ? (stored as SudokuGridSize)
      : null;
  } catch {
    return null;
  }
}

export function getLastPlayedDifficulty(): SudokuDifficulty {
  try {
    const stored = localStorage.getItem(LAST_DIFFICULTY_KEY);
    if (stored && DIFFICULTIES.includes(stored as SudokuDifficulty)) {
      return stored as SudokuDifficulty;
    }
  } catch {
    // Browser storage can be unavailable in private or restricted contexts.
  }
  return "easy";
}

export function rememberSudokuDifficulty(difficulty: SudokuDifficulty): void {
  try {
    localStorage.setItem(LAST_DIFFICULTY_KEY, difficulty);
  } catch {
    // Starting the game should still work when browser storage is unavailable.
  }
}