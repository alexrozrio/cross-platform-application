const GRID_SLUGS: Record<number, string> = {
  3: 'baby',
  4: 'mini',
  6: 'dual',
  9: 'classic',
  16: 'pro',
};

export type SudokuRouteMode = 'number' | 'alpha' | 'image';

/**
 * Keep the playable Sudoku URL human-readable while carrying the game id
 * needed to load the server-side game or the local offline game.
 */
export function sudokuGamePath(
  gridSize: number,
  difficulty: string,
  gameId: number,
  mode: SudokuRouteMode = 'number',
  offlineGame?: number | string,
): string {
  const slug = GRID_SLUGS[gridSize] ?? GRID_SLUGS[9];
  const params = new URLSearchParams({ gameId: String(gameId) });
  if (mode !== 'number') params.set('mode', mode);
  if (offlineGame !== undefined) params.set('offlineGame', String(offlineGame));
  return `/sudoku/${slug}/${difficulty.toLowerCase()}?${params.toString()}`;
}