// ─── Points configuration ─────────────────────────────────────────────────────
// Designed for future expansion: add new gameTypes and gridSizes here without
// changing the core formula. Each game type has its own base-point scale so
// wildly different games don't share the same currency pool accidentally.

export type GameType = "sudoku";

const SUDOKU_BASE: Record<number, number> = {
  3: 100,
  4: 250,
  6: 500,
  9: 1000,
  16: 2500,
};

const DIFF_MULT: Record<string, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  expert: 3.0,
};

// Par time (seconds) — beating this earns the max 50% time bonus
const SUDOKU_PAR: Record<number, number> = {
  3: 120,
  4: 300,
  6: 600,
  9: 900,
  16: 2700,
};

// Gems earned per 5000 points (rounded down per game)
const GEMS_PER_POINTS = 5000;

export function calcPoints(
  gridSize: number,
  difficulty: string,
  elapsedSeconds: number,
  mistakeCount: number,
  hintsUsed: number,
  gameType: GameType = "sudoku",
): number {
  // Future game types can supply their own tables
  const baseTable = gameType === "sudoku" ? SUDOKU_BASE : SUDOKU_BASE;
  const parTable = gameType === "sudoku" ? SUDOKU_PAR : SUDOKU_PAR;

  const base = (baseTable[gridSize] ?? 1000) * (DIFF_MULT[difficulty] ?? 1.0);
  const par = parTable[gridSize] ?? 900;
  const timeBonus = Math.max(0, (par - elapsedSeconds) / par) * 0.5;
  const mistakePenalty = Math.max(0.5, 1 - 0.05 * mistakeCount);
  const hintPenalty = Math.max(0.7, 1 - 0.1 * hintsUsed);
  return Math.max(10, Math.round(base * (1 + timeBonus) * mistakePenalty * hintPenalty));
}

/** How many gems a game completion is worth */
export function calcGems(points: number): number {
  return Math.max(1, Math.floor(points / GEMS_PER_POINTS));
}
