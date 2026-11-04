import { describe, expect, it } from "vitest";
import { isJigsawGamePlayed } from "../utils/jigsaw-game-progress";

describe("Jigsaw played-game tracking", () => {
  it("does not count an untouched active game", () => {
    expect(isJigsawGamePlayed({ status: "active", elapsedSeconds: 0, moves: 0 })).toBe(false);
  });

  it("counts active games after time or a move has been recorded", () => {
    expect(isJigsawGamePlayed({ status: "active", elapsedSeconds: 1, moves: 0 })).toBe(true);
    expect(isJigsawGamePlayed({ status: "active", elapsedSeconds: 0, moves: 1 })).toBe(true);
  });

  it("counts completed games even if their recorded progress is zero", () => {
    expect(isJigsawGamePlayed({ status: "completed", elapsedSeconds: 0, moves: 0 })).toBe(true);
  });
});