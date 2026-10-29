import { describe, expect, it } from "vitest";
import {
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
});
