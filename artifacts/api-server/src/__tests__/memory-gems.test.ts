import { describe, expect, it } from "vitest";
import { calcMemoryGems } from "../utils/memory-gems";

describe("calcMemoryGems", () => {
  it.each([
    [2, 1],
    [4, 2],
    [6, 3],
    [8, 3],
  ])("Memory Match grid size %i awards %i gems", (gridSize, gems) => {
    expect(calcMemoryGems(gridSize)).toBe(gems);
  });
});
