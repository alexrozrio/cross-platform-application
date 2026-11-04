import { describe, expect, it } from "vitest";
import {
  JIGSAW_MAX_REFERENCE_PEEKS,
  JIGSAW_MAX_PIECE_NUMBER_HINTS,
  JIGSAW_SESSION_MAX_AGE_MS,
  parseSavedJigsawSession,
  type SavedJigsawSession,
} from "../lib/jigsaw-session";

const now = 1_800_000_000_000;
const validSession: SavedJigsawSession = {
  gridSize: 2,
  level: 1,
  imageKey: 1,
  themeId: "nature",
  board: [0, null, 2, null],
  tray: [1, 3],
  moves: 2,
  elapsed: 30,
  showReference: true,
  referencePeeksUsed: 0,
  revealedPieceNumbers: [],
  gameId: 12,
  challengeId: null,
  shareToken: null,
  savedAt: now,
};

describe("parseSavedJigsawSession", () => {
  it("accepts a fresh session with each piece represented exactly once", () => {
    expect(parseSavedJigsawSession(JSON.stringify(validSession), now)).toEqual(validSession);
  });

  it("rejects expired or future-dated sessions", () => {
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      savedAt: now - JIGSAW_SESSION_MAX_AGE_MS - 1,
    }), now)).toBeNull();
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      savedAt: now + 1,
    }), now)).toBeNull();
  });

  it("rejects malformed boards and invalid tile partitions", () => {
    expect(parseSavedJigsawSession("{bad json", now)).toBeNull();
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      tray: [1, 1],
    }), now)).toBeNull();
  });

  it("defaults older sessions to an unused preview budget", () => {
    const { referencePeeksUsed, revealedPieceNumbers, ...legacySession } = validSession;
    expect(parseSavedJigsawSession(JSON.stringify(legacySession), now)?.referencePeeksUsed).toBe(0);
    expect(parseSavedJigsawSession(JSON.stringify(legacySession), now)?.revealedPieceNumbers).toEqual([]);
    expect(referencePeeksUsed).toBe(0);
    expect(revealedPieceNumbers).toEqual([]);
  });

  it("accepts up to three used previews and rejects invalid counts", () => {
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      referencePeeksUsed: JIGSAW_MAX_REFERENCE_PEEKS,
    }), now)?.referencePeeksUsed).toBe(JIGSAW_MAX_REFERENCE_PEEKS);
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      referencePeeksUsed: JIGSAW_MAX_REFERENCE_PEEKS + 1,
    }), now)).toBeNull();
  });

  it("persists at most three unique piece-number hints", () => {
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      revealedPieceNumbers: [0, 1, 2],
    }), now)?.revealedPieceNumbers).toEqual([0, 1, 2]);
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      revealedPieceNumbers: Array.from({ length: JIGSAW_MAX_PIECE_NUMBER_HINTS + 1 }, (_, index) => index),
    }), now)).toBeNull();
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      revealedPieceNumbers: [0, 0],
    }), now)).toBeNull();
    expect(parseSavedJigsawSession(JSON.stringify({
      ...validSession,
      revealedPieceNumbers: [4],
    }), now)).toBeNull();
  });
});
