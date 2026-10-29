export const JIGSAW_SESSION_STORAGE_KEY = "brain-games-jigsaw-session";
export const JIGSAW_SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export type JigsawGridSize = 2 | 3 | 4 | 5;
export type JigsawLevel = 1 | 2 | 3;

export interface SavedJigsawSession {
  gridSize: JigsawGridSize;
  level: JigsawLevel;
  imageKey: number;
  themeId: string;
  board: (number | null)[];
  tray: number[];
  moves: number;
  elapsed: number;
  showReference: boolean;
  gameId: number | null;
  challengeId: number | null;
  shareToken: string | null;
  dailyDate?: string;
  savedAt: number;
}

export function parseSavedJigsawSession(
  raw: string | null,
  now = Date.now(),
): SavedJigsawSession | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const session = value as Partial<SavedJigsawSession>;
    const validSizes = [2, 3, 4, 5];
    const validLevels = [1, 2, 3];

    if (
      !validSizes.includes(session.gridSize as number) ||
      !validLevels.includes(session.level as number) ||
      !Number.isInteger(session.imageKey) ||
      (session.imageKey ?? 0) < 1 ||
      typeof session.themeId !== "string" ||
      !Array.isArray(session.board) ||
      !Array.isArray(session.tray) ||
      !Number.isInteger(session.moves) ||
      (session.moves ?? -1) < 0 ||
      !Number.isInteger(session.elapsed) ||
      (session.elapsed ?? -1) < 0 ||
      typeof session.showReference !== "boolean" ||
      !Number.isFinite(session.savedAt) ||
      (session.savedAt ?? 0) > now ||
      now - (session.savedAt ?? 0) > JIGSAW_SESSION_MAX_AGE_MS
    ) {
      return null;
    }

    const gridSize = session.gridSize as JigsawGridSize;
    const pieceCount = gridSize * gridSize;
    if (session.board.length !== pieceCount) return null;

    const boardPieces = session.board.filter((piece): piece is number => piece !== null);
    const allPieces = [...boardPieces, ...session.tray];
    if (
      allPieces.length !== pieceCount ||
      allPieces.some((piece) => !Number.isInteger(piece) || piece < 0 || piece >= pieceCount) ||
      new Set(allPieces).size !== pieceCount
    ) {
      return null;
    }

    const optionalIdIsValid = (id: unknown) =>
      id === null || (Number.isInteger(id) && (id as number) > 0);
    if (!optionalIdIsValid(session.gameId) || !optionalIdIsValid(session.challengeId)) {
      return null;
    }
    if (session.shareToken !== null && typeof session.shareToken !== "string") return null;
    if (session.dailyDate !== undefined && typeof session.dailyDate !== "string") return null;

    return session as SavedJigsawSession;
  } catch {
    return null;
  }
}
