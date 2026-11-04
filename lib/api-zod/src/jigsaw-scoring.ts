export const JIGSAW_BASE_POINTS: Record<number, number> = {
  2: 100,
  3: 250,
  4: 500,
  5: 1_000,
};

export const JIGSAW_PAR_SECONDS: Record<number, number> = {
  2: 45,
  3: 90,
  4: 150,
  5: 240,
};

export const JIGSAW_XP_BY_LEVEL: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
};

export const JIGSAW_GEMS_BY_GRID_SIZE: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 3,
};

export function calculateJigsawPoints(
  gridSize: number,
  level: number,
  elapsedSeconds: number,
  moves: number,
  tipsUsed: number,
): number {
  const base = JIGSAW_BASE_POINTS[gridSize] ?? 100;
  const par = (JIGSAW_PAR_SECONDS[gridSize] ?? 45) * (1 + (level - 1) * 0.35);
  const levelMultiplier = 1 + (level - 1) * 0.5;
  const timeBonus = Math.max(0, (par - elapsedSeconds) / par) * 0.5;
  const extraMoves = Math.max(0, moves - gridSize * gridSize);
  const movePenalty = Math.max(0.5, 1 - 0.02 * extraMoves);
  const tipPenalty = Math.max(0.5, 1 - 0.1 * tipsUsed);

  return Math.max(10, Math.round(base * levelMultiplier * (1 + timeBonus) * movePenalty * tipPenalty));
}

export function getJigsawXpEarned(level: number): number {
  return JIGSAW_XP_BY_LEVEL[level] ?? 1;
}

export function getJigsawGemsEarned(gridSize: number): number {
  return JIGSAW_GEMS_BY_GRID_SIZE[gridSize] ?? 1;
}
