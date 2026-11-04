import { describe, expect, it } from "vitest";
import { getJigsawPieceEdges, getJigsawPiecePath } from "../lib/jigsaw-piece-shapes";

describe("Jigsaw interlocking piece shapes", () => {
  it.each([4, 5])("gives every neighboring piece complementary edges at size %i", (gridSize) => {
    for (let row = 0; row < gridSize; row += 1) {
      for (let column = 0; column < gridSize; column += 1) {
        const piece = row * gridSize + column;
        const edges = getJigsawPieceEdges(gridSize, piece);

        if (column < gridSize - 1) {
          const rightNeighbor = getJigsawPieceEdges(gridSize, piece + 1);
          expect(edges.right).toBe(-rightNeighbor.left);
        }
        if (row < gridSize - 1) {
          const lowerNeighbor = getJigsawPieceEdges(gridSize, piece + gridSize);
          expect(edges.bottom).toBe(-lowerNeighbor.top);
        }
      }
    }
  });

  it("creates closed curved paths for larger pieces", () => {
    for (const gridSize of [4, 5]) {
      for (let piece = 0; piece < gridSize * gridSize; piece += 1) {
        const path = getJigsawPiecePath(gridSize, piece);
        expect(path.startsWith("M0 0")).toBe(true);
        expect(path.endsWith(" Z")).toBe(true);
        expect(path).toContain("C");
      }
    }
  });
});