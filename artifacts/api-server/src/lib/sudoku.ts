import { getClueCount } from "../config/puzzle-clues";

type Grid = number[];

// ─── Encoding helpers (for 16×16 where values go up to 16) ────────────────────
// '0' = empty, '1'-'9' = values 1-9, 'a'-'g' = values 10-16
export function encodeCell(n: number): string {
  if (n === 0) return "0";
  if (n <= 9) return n.toString();
  return String.fromCharCode(87 + n); // 10→'a', 11→'b', ..., 16→'g'
}

export function decodeCell(c: string): number {
  if (c === "0") return 0;
  const n = parseInt(c, 10);
  if (!isNaN(n)) return n;
  return c.charCodeAt(0) - 87; // 'a'→10, ..., 'g'→16
}

function encodeGrid(grid: Grid): string {
  return grid.map(encodeCell).join("");
}

// ─── 3×3 (child / Latin-square, rows + columns only) ────────────────────────

function isValid3x3(grid: Grid, pos: number, num: number): boolean {
  const row = Math.floor(pos / 3);
  const col = pos % 3;
  for (let i = 0; i < 3; i++) {
    if (grid[row * 3 + i] === num) return false;
    if (grid[i * 3 + col] === num) return false;
  }
  return true;
}

function solve3x3(grid: Grid): boolean {
  const empty = grid.indexOf(0);
  if (empty === -1) return true;
  const nums = [1, 2, 3].sort(() => Math.random() - 0.5);
  for (const num of nums) {
    if (isValid3x3(grid, empty, num)) {
      grid[empty] = num;
      if (solve3x3(grid)) return true;
      grid[empty] = 0;
    }
  }
  return false;
}

function countSolutions3x3(grid: Grid, limit = 2): number {
  const empty = grid.indexOf(0);
  if (empty === -1) return 1;
  let count = 0;
  for (let num = 1; num <= 3; num++) {
    if (isValid3x3(grid, empty, num)) {
      grid[empty] = num;
      count += countSolutions3x3(grid, limit);
      grid[empty] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 6×6 (2×3 boxes) ─────────────────────────────────────────────────────────

function isValid6x6(grid: Grid, pos: number, num: number): boolean {
  const row = Math.floor(pos / 6);
  const col = pos % 6;
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 6; i++) {
    if (grid[row * 6 + i] === num) return false;
    if (grid[i * 6 + col] === num) return false;
  }
  for (let r = boxRow; r < boxRow + 2; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r * 6 + c] === num) return false;
    }
  }
  return true;
}

function solve6x6(grid: Grid): boolean {
  const empty = grid.indexOf(0);
  if (empty === -1) return true;
  const nums = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
  for (const num of nums) {
    if (isValid6x6(grid, empty, num)) {
      grid[empty] = num;
      if (solve6x6(grid)) return true;
      grid[empty] = 0;
    }
  }
  return false;
}

function countSolutions6x6(grid: Grid, limit = 2): number {
  const empty = grid.indexOf(0);
  if (empty === -1) return 1;
  let count = 0;
  for (let num = 1; num <= 6; num++) {
    if (isValid6x6(grid, empty, num)) {
      grid[empty] = num;
      count += countSolutions6x6(grid, limit);
      grid[empty] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 4×4 (2×2 boxes) ─────────────────────────────────────────────────────────

function isValid4x4(grid: Grid, pos: number, num: number): boolean {
  const row = Math.floor(pos / 4);
  const col = pos % 4;
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 2) * 2;

  for (let i = 0; i < 4; i++) {
    if (grid[row * 4 + i] === num) return false;
    if (grid[i * 4 + col] === num) return false;
  }
  for (let r = boxRow; r < boxRow + 2; r++) {
    for (let c = boxCol; c < boxCol + 2; c++) {
      if (grid[r * 4 + c] === num) return false;
    }
  }
  return true;
}

function solve4x4(grid: Grid): boolean {
  const empty = grid.indexOf(0);
  if (empty === -1) return true;
  const nums = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
  for (const num of nums) {
    if (isValid4x4(grid, empty, num)) {
      grid[empty] = num;
      if (solve4x4(grid)) return true;
      grid[empty] = 0;
    }
  }
  return false;
}

function countSolutions4x4(grid: Grid, limit = 2): number {
  const empty = grid.indexOf(0);
  if (empty === -1) return 1;
  let count = 0;
  for (let num = 1; num <= 4; num++) {
    if (isValid4x4(grid, empty, num)) {
      grid[empty] = num;
      count += countSolutions4x4(grid, limit);
      grid[empty] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 9×9 (3×3 boxes) ─────────────────────────────────────────────────────────

function isValid9x9(grid: Grid, pos: number, num: number): boolean {
  const row = Math.floor(pos / 9);
  const col = pos % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (grid[row * 9 + i] === num) return false;
    if (grid[i * 9 + col] === num) return false;
    const br = boxRow + Math.floor(i / 3);
    const bc = boxCol + (i % 3);
    if (grid[br * 9 + bc] === num) return false;
  }
  return true;
}

function solve9x9(grid: Grid): boolean {
  const empty = grid.indexOf(0);
  if (empty === -1) return true;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  for (const num of nums) {
    if (isValid9x9(grid, empty, num)) {
      grid[empty] = num;
      if (solve9x9(grid)) return true;
      grid[empty] = 0;
    }
  }
  return false;
}

function countSolutions9x9(grid: Grid, limit = 2): number {
  const empty = grid.indexOf(0);
  if (empty === -1) return 1;
  let count = 0;
  for (let num = 1; num <= 9; num++) {
    if (isValid9x9(grid, empty, num)) {
      grid[empty] = num;
      count += countSolutions9x9(grid, limit);
      grid[empty] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 16×16 (4×4 boxes, values 1-16) ──────────────────────────────────────────
// Values encoded: '1'-'9' for 1-9, 'a'-'g' for 10-16, '0' for empty
// Uniqueness check is skipped for performance (256 cells × 16 values is too slow)

function isValid16x16(grid: Grid, pos: number, num: number): boolean {
  const row = Math.floor(pos / 16);
  const col = pos % 16;
  const boxRow = Math.floor(row / 4) * 4;
  const boxCol = Math.floor(col / 4) * 4;

  for (let i = 0; i < 16; i++) {
    if (grid[row * 16 + i] === num) return false;
    if (grid[i * 16 + col] === num) return false;
  }
  for (let r = boxRow; r < boxRow + 4; r++) {
    for (let c = boxCol; c < boxCol + 4; c++) {
      if (grid[r * 16 + c] === num) return false;
    }
  }
  return true;
}

// Algebraic base solution: value = (row*4 + floor(row/4) + col) % 16 + 1
// This satisfies all row, column, and 4×4 box constraints.
// Randomised by permuting: values, row-bands (each 4 rows), rows within bands,
// col-bands, and cols within bands — producing a huge variety without backtracking.
function generate16x16Solution(): Grid {
  const SIZE = 16;
  const BOX = 4;

  // Build base grid
  const base: Grid = new Array(256).fill(0);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      base[r * SIZE + c] = (r * BOX + Math.floor(r / BOX) + c) % SIZE + 1;
    }
  }

  // Random number permutation
  const numPerm = Array.from({ length: SIZE }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

  // Random band + row-within-band permutations
  const bandOrder = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const rowPerm = bandOrder.flatMap(b =>
    [0, 1, 2, 3].sort(() => Math.random() - 0.5).map(r => b * BOX + r)
  );
  const colBandOrder = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const colPerm = colBandOrder.flatMap(b =>
    [0, 1, 2, 3].sort(() => Math.random() - 0.5).map(c => b * BOX + c)
  );

  const solution: Grid = new Array(256).fill(0);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      solution[r * SIZE + c] = numPerm[base[rowPerm[r] * SIZE + colPerm[c]] - 1];
    }
  }
  return solution;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generatePuzzle(
  difficulty: string,
  gridSize: number = 9
): { grid: string; solution: string } {

  if (gridSize === 3) {
    const solution: Grid = new Array(9).fill(0);
    solve3x3(solution);
    const solutionStr = solution.join("");

    const puzzle = [...solution];
    const positions = Array.from({ length: 9 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(3, difficulty);
    let removed = 0;
    const target = 9 - clues;

    for (const pos of positions) {
      if (removed >= target) break;
      const backup = puzzle[pos];
      puzzle[pos] = 0;
      const copy = [...puzzle];
      if (countSolutions3x3(copy) === 1) {
        removed++;
      } else {
        puzzle[pos] = backup;
      }
    }

    return { grid: puzzle.join(""), solution: solutionStr };
  }

  if (gridSize === 4) {
    const solution: Grid = new Array(16).fill(0);
    solve4x4(solution);
    const solutionStr = solution.join("");

    const puzzle = [...solution];
    const positions = Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(4, difficulty);
    let removed = 0;
    const target = 16 - clues;

    for (const pos of positions) {
      if (removed >= target) break;
      const backup = puzzle[pos];
      puzzle[pos] = 0;
      const copy = [...puzzle];
      if (countSolutions4x4(copy) === 1) {
        removed++;
      } else {
        puzzle[pos] = backup;
      }
    }

    return { grid: puzzle.join(""), solution: solutionStr };
  }

  if (gridSize === 6) {
    const solution: Grid = new Array(36).fill(0);
    solve6x6(solution);
    const solutionStr = solution.join("");

    const puzzle = [...solution];
    const positions = Array.from({ length: 36 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(6, difficulty);
    let removed = 0;
    const target = 36 - clues;

    for (const pos of positions) {
      if (removed >= target) break;
      const backup = puzzle[pos];
      puzzle[pos] = 0;
      const copy = [...puzzle];
      if (countSolutions6x6(copy) === 1) {
        removed++;
      } else {
        puzzle[pos] = backup;
      }
    }

    return { grid: puzzle.join(""), solution: solutionStr };
  }

  if (gridSize === 16) {
    const solution = generate16x16Solution();
    const solutionStr = encodeGrid(solution);

    const puzzle = [...solution];
    const positions = Array.from({ length: 256 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(16, difficulty);
    let removed = 0;
    const target = 256 - clues;

    // Skip uniqueness check for 16×16 (too slow); remove cells directly
    for (const pos of positions) {
      if (removed >= target) break;
      puzzle[pos] = 0;
      removed++;
    }

    return { grid: encodeGrid(puzzle), solution: solutionStr };
  }

  // Default 9×9
  const solution: Grid = new Array(81).fill(0);
  solve9x9(solution);
  const solutionStr = solution.join("");

  const puzzle = [...solution];
  const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  const clues = getClueCount(9, difficulty);
  let removed = 0;
  const target = 81 - clues;

  for (const pos of positions) {
    if (removed >= target) break;
    const backup = puzzle[pos];
    puzzle[pos] = 0;
    const copy = [...puzzle];
    if (countSolutions9x9(copy) === 1) {
      removed++;
    } else {
      puzzle[pos] = backup;
    }
  }

  return { grid: puzzle.join(""), solution: solutionStr };
}
