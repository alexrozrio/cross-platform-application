export interface JigsawPieceEdges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type Point = [number, number];
type Axis = "horizontal" | "vertical";

function sharedEdgeDirection(row: number, column: number, axis: Axis): number {
  const seed = row * 37 + column * 61 + (axis === "horizontal" ? 17 : 29);
  return seed % 2 === 0 ? 1 : -1;
}

export function getJigsawPieceEdges(gridSize: number, piece: number): JigsawPieceEdges {
  const row = Math.floor(piece / gridSize);
  const column = piece % gridSize;

  return {
    top: row === 0 ? 0 : -sharedEdgeDirection(row - 1, column, "horizontal"),
    right: column === gridSize - 1 ? 0 : sharedEdgeDirection(row, column, "vertical"),
    bottom: row === gridSize - 1 ? 0 : sharedEdgeDirection(row, column, "horizontal"),
    left: column === 0 ? 0 : -sharedEdgeDirection(row, column - 1, "vertical"),
  };
}

function edgePath(start: Point, end: Point, normal: Point, tab: number): string {
  if (tab === 0) return `L${end[0]} ${end[1]}`;

  const depth = tab * 9;
  const at = (position: number, offset = 0) => {
    const x = start[0] + (end[0] - start[0]) * position + normal[0] * offset;
    const y = start[1] + (end[1] - start[1]) * position + normal[1] * offset;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };

  return [
    `L${at(0.34)}`,
    `C${at(0.38, depth * 0.15)} ${at(0.39, depth * 0.85)} ${at(0.44, depth * 0.85)}`,
    `C${at(0.44, depth * 1.35)} ${at(0.56, depth * 1.35)} ${at(0.56, depth * 0.85)}`,
    `C${at(0.61, depth * 0.85)} ${at(0.62, depth * 0.15)} ${at(0.66)}`,
    `L${end[0]} ${end[1]}`,
  ].join(" ");
}

export function getJigsawPiecePath(gridSize: number, piece: number): string {
  const edges = getJigsawPieceEdges(gridSize, piece);
  return [
    "M0 0",
    edgePath([0, 0], [100, 0], [0, -1], edges.top),
    edgePath([100, 0], [100, 100], [1, 0], edges.right),
    edgePath([100, 100], [0, 100], [0, 1], edges.bottom),
    edgePath([0, 100], [0, 0], [-1, 0], edges.left),
    "Z",
  ].join(" ");
}