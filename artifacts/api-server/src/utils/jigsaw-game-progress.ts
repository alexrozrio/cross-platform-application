export interface JigsawGameProgress {
  status: string;
  elapsedSeconds: number;
  moves: number;
}

export function isJigsawGamePlayed(game: JigsawGameProgress): boolean {
  return game.status === "completed" || game.elapsedSeconds > 0 || game.moves > 0;
}