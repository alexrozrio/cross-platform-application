import { describe, expect, it } from "vitest";
import {
  hasMeaningfulMemoryActivity,
  hasMeaningfulSudokuActivity,
  MIN_MEANINGFUL_GAME_SECONDS,
} from "../utils/game-activity";

describe("meaningful game activity", () => {
  it("ignores an untouched Sudoku row abandoned immediately", () => {
    expect(hasMeaningfulSudokuActivity({
      status: "failed",
      elapsedSeconds: 0,
      currentGrid: "1230",
      initialGrid: "1230",
    })).toBe(false);
  });

  it("counts a Sudoku row after one entered value", () => {
    expect(hasMeaningfulSudokuActivity({
      status: "failed",
      elapsedSeconds: 0,
      currentGrid: "1234",
      initialGrid: "1230",
    })).toBe(true);
  });

  it("counts an unfinished Sudoku row after the minimum time", () => {
    expect(hasMeaningfulSudokuActivity({
      status: "active",
      elapsedSeconds: MIN_MEANINGFUL_GAME_SECONDS,
      currentGrid: "1230",
      initialGrid: "1230",
    })).toBe(true);
  });

  it("uses flips or time for unfinished Memory Match rows", () => {
    expect(hasMeaningfulMemoryActivity({ status: "failed", elapsedSeconds: 0, flips: 0 })).toBe(false);
    expect(hasMeaningfulMemoryActivity({ status: "failed", elapsedSeconds: 0, flips: 1 })).toBe(true);
    expect(hasMeaningfulMemoryActivity({ status: "active", elapsedSeconds: 10, flips: 0 })).toBe(true);
  });

  it("always counts completed games", () => {
    expect(hasMeaningfulSudokuActivity({
      status: "completed",
      elapsedSeconds: 0,
      currentGrid: "1230",
      initialGrid: "1230",
    })).toBe(true);
    expect(hasMeaningfulMemoryActivity({ status: "completed", elapsedSeconds: 0, flips: 0 })).toBe(true);
  });
});