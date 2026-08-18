export type SudokuGridSize = 3 | 4 | 6 | 9 | 16;
export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const GRID_SLUGS: Record<SudokuGridSize, string> = {
  3: 'baby',
  4: 'mini',
  6: 'dual',
  9: 'classic',
  16: 'pro',
};

export type SudokuRouteMode = 'number' | 'alpha' | 'image';

const DIFFICULTIES = new Set<SudokuDifficulty>(['easy', 'medium', 'hard', 'expert']);
const MODES = new Set<SudokuRouteMode>(['number', 'alpha', 'image']);

export function gridSizeFromSlug(slug?: string): SudokuGridSize | null {
  if (!slug) return null;
  const entry = Object.entries(GRID_SLUGS).find(
    ([, value]) => value === slug.toLowerCase(),
  );
  return entry ? Number(entry[0]) as SudokuGridSize : null;
}

export function difficultyFromSlug(slug?: string): SudokuDifficulty | null {
  const normalized = slug?.toLowerCase();
  return normalized && DIFFICULTIES.has(normalized as SudokuDifficulty)
    ? normalized as SudokuDifficulty
    : null;
}

export function modeFromQuery(value?: string | null): SudokuRouteMode | null {
  return value && MODES.has(value as SudokuRouteMode)
    ? value as SudokuRouteMode
    : null;
}

/** Canonical setup URL. It intentionally has no game id, so it is safe to bookmark/share. */
export function sudokuSetupPath(
  gridSize: number,
  difficulty: string,
  mode: SudokuRouteMode = 'number',
): string {
  const slug = GRID_SLUGS[gridSize] ?? GRID_SLUGS[9];
  const params = new URLSearchParams();
  if (mode !== 'number') params.set('mode', mode);
  const query = params.toString();
  return `/sudoku/${slug}/${difficulty.toLowerCase()}${query ? `?${query}` : ''}`;
}

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