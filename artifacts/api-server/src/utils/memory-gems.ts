const GEMS_BY_GRID_SIZE: Record<number, number> = {
  2: 1,
  4: 2,
  6: 3,
  8: 3,
};

export function calcMemoryGems(gridSize: number): number {
  return GEMS_BY_GRID_SIZE[gridSize] ?? (gridSize <= 4 ? 1 : 3);
}
