export const MIN_MEANINGFUL_GAME_SECONDS = 10;

export function hasMeaningfulSudokuActivity(game: {
  status: string;
  elapsedSeconds: number;
  currentGrid: string;
  initialGrid: string;
}): boolean {
  return (
    game.status === "completed" ||
    game.elapsedSeconds >= MIN_MEANINGFUL_GAME_SECONDS ||
    game.currentGrid !== game.initialGrid
  );
}

export function hasMeaningfulMemoryActivity(game: {
  status: string;
  elapsedSeconds: number | null;
  flips: number | null;
}): boolean {
  return (
    game.status === "completed" ||
    (game.elapsedSeconds ?? 0) >= MIN_MEANINGFUL_GAME_SECONDS ||
    (game.flips ?? 0) >= 1
  );
}