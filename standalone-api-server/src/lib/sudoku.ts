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

// ─── Candidate Set Utilities (Bit Flags) ──────────────────────────────────────
// Each position stores a byte with bits representing possible values
// For size N: bits 0 to N-1 represent values 1 to N

function initCandidates(grid: Grid, size: number): Uint16Array {
  const candidates = new Uint16Array(grid.length);
  const allBits = (1 << size) - 1;
  for (let i = 0; i < grid.length; i++) {
    candidates[i] = grid[i] === 0 ? allBits : 0;
  }
  return candidates;
}

function clearBit(candidates: Uint16Array, pos: number, val: number): void {
  candidates[pos] &= ~(1 << (val - 1));
}

function hasBit(candidates: Uint16Array, pos: number, val: number): boolean {
  return (candidates[pos] & (1 << (val - 1))) !== 0;
}

function countBits(byte: number): number {
  let count = 0;
  while (byte) {
    count += byte & 1;
    byte >>= 1;
  }
  return count;
}

function getFirstBit(byte: number): number {
  for (let i = 1; i <= 16; i++) {
    if ((byte & (1 << (i - 1))) !== 0) return i;
  }
  return 0;
}

// ─── 3×3 (Latin-square: rows + columns only) ──────────────────────────────────

function constrain3x3(grid: Grid, candidates: Uint16Array): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / 3);
      const col = i % 3;
      const oldCand = candidates[i];

      for (let j = 0; j < 3; j++) {
        const rowVal = grid[row * 3 + j];
        const colVal = grid[j * 3 + col];
        if (rowVal !== 0) clearBit(candidates, i, rowVal);
        if (colVal !== 0) clearBit(candidates, i, colVal);
      }

      if (candidates[i] === 0) return false;
      if (candidates[i] !== oldCand) changed = true;

      if (countBits(candidates[i]) === 1) {
        const val = getFirstBit(candidates[i]);
        grid[i] = val;
        candidates[i] = 0;
        changed = true;
      }
    }
  }
  return true;
}

function solve3x3(grid: Grid, candidates: Uint16Array): boolean {
  if (!constrain3x3(grid, candidates)) return false;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true;

  for (let num = 1; num <= 3; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridBak = [...grid];
      const candBak = new Uint16Array(candidates);

      grid[bestPos] = num;
      candidates[bestPos] = 0;

      if (solve3x3(grid, candidates)) return true;

      for (let j = 0; j < grid.length; j++) {
        grid[j] = gridBak[j];
        candidates[j] = candBak[j];
      }
    }
  }
  return false;
}

function countSolutions3x3(grid: Grid, candidates: Uint16Array, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrain3x3(gridCopy, candCopy)) return 0;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
      }
    }
  }

  if (bestPos === -1) return 1;

  let count = 0;
  for (let num = 1; num <= 3; num++) {
    if (hasBit(candCopy, bestPos, num)) {
      const gc = [...gridCopy];
      const cc = new Uint16Array(candCopy);
      gc[bestPos] = num;
      cc[bestPos] = 0;
      count += countSolutions3x3(gc, cc, limit);
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 4×4 (2×2 boxes) ──────────────────────────────────────────────────────────

function constrain4x4(grid: Grid, candidates: Uint16Array): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / 4);
      const col = i % 4;
      const boxRow = Math.floor(row / 2) * 2;
      const boxCol = Math.floor(col / 2) * 2;
      const oldCand = candidates[i];

      for (let j = 0; j < 4; j++) {
        const rowVal = grid[row * 4 + j];
        const colVal = grid[j * 4 + col];
        if (rowVal !== 0) clearBit(candidates, i, rowVal);
        if (colVal !== 0) clearBit(candidates, i, colVal);
      }

      for (let r = boxRow; r < boxRow + 2; r++) {
        for (let c = boxCol; c < boxCol + 2; c++) {
          const val = grid[r * 4 + c];
          if (val !== 0) clearBit(candidates, i, val);
        }
      }

      if (candidates[i] === 0) return false;
      if (candidates[i] !== oldCand) changed = true;

      if (countBits(candidates[i]) === 1) {
        const val = getFirstBit(candidates[i]);
        grid[i] = val;
        candidates[i] = 0;
        changed = true;
      }
    }
  }
  return true;
}

function solve4x4(grid: Grid, candidates: Uint16Array): boolean {
  if (!constrain4x4(grid, candidates)) return false;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true;

  for (let num = 1; num <= 4; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridBak = [...grid];
      const candBak = new Uint16Array(candidates);

      grid[bestPos] = num;
      candidates[bestPos] = 0;

      if (solve4x4(grid, candidates)) return true;

      for (let j = 0; j < grid.length; j++) {
        grid[j] = gridBak[j];
        candidates[j] = candBak[j];
      }
    }
  }
  return false;
}

function countSolutions4x4(grid: Grid, candidates: Uint16Array, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrain4x4(gridCopy, candCopy)) return 0;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
      }
    }
  }

  if (bestPos === -1) return 1;

  let count = 0;
  for (let num = 1; num <= 4; num++) {
    if (hasBit(candCopy, bestPos, num)) {
      const gc = [...gridCopy];
      const cc = new Uint16Array(candCopy);
      gc[bestPos] = num;
      cc[bestPos] = 0;
      count += countSolutions4x4(gc, cc, limit);
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 6×6 (2×3 boxes) ──────────────────────────────────────────────────────────

function constrain6x6(grid: Grid, candidates: Uint16Array): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / 6);
      const col = i % 6;
      const boxRow = Math.floor(row / 2) * 2;
      const boxCol = Math.floor(col / 3) * 3;
      const oldCand = candidates[i];

      for (let j = 0; j < 6; j++) {
        const rowVal = grid[row * 6 + j];
        const colVal = grid[j * 6 + col];
        if (rowVal !== 0) clearBit(candidates, i, rowVal);
        if (colVal !== 0) clearBit(candidates, i, colVal);
      }

      for (let r = boxRow; r < boxRow + 2; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const val = grid[r * 6 + c];
          if (val !== 0) clearBit(candidates, i, val);
        }
      }

      if (candidates[i] === 0) return false;
      if (candidates[i] !== oldCand) changed = true;

      if (countBits(candidates[i]) === 1) {
        const val = getFirstBit(candidates[i]);
        grid[i] = val;
        candidates[i] = 0;
        changed = true;
      }
    }
  }
  return true;
}

function solve6x6(grid: Grid, candidates: Uint16Array): boolean {
  if (!constrain6x6(grid, candidates)) return false;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true;

  for (let num = 1; num <= 6; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridBak = [...grid];
      const candBak = new Uint16Array(candidates);

      grid[bestPos] = num;
      candidates[bestPos] = 0;

      if (solve6x6(grid, candidates)) return true;

      for (let j = 0; j < grid.length; j++) {
        grid[j] = gridBak[j];
        candidates[j] = candBak[j];
      }
    }
  }
  return false;
}

function countSolutions6x6(grid: Grid, candidates: Uint16Array, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrain6x6(gridCopy, candCopy)) return 0;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
      }
    }
  }

  if (bestPos === -1) return 1;

  let count = 0;
  for (let num = 1; num <= 6; num++) {
    if (hasBit(candCopy, bestPos, num)) {
      const gc = [...gridCopy];
      const cc = new Uint16Array(candCopy);
      gc[bestPos] = num;
      cc[bestPos] = 0;
      count += countSolutions6x6(gc, cc, limit);
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 9×9 (3×3 boxes) ──────────────────────────────────────────────────────────

function constrain9x9(grid: Grid, candidates: Uint16Array): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / 9);
      const col = i % 9;
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      const oldCand = candidates[i];

      for (let j = 0; j < 9; j++) {
        const rowVal = grid[row * 9 + j];
        const colVal = grid[j * 9 + col];
        if (rowVal !== 0) clearBit(candidates, i, rowVal);
        if (colVal !== 0) clearBit(candidates, i, colVal);

        const br = boxRow + Math.floor(j / 3);
        const bc = boxCol + (j % 3);
        const boxVal = grid[br * 9 + bc];
        if (boxVal !== 0) clearBit(candidates, i, boxVal);
      }

      if (candidates[i] === 0) return false;
      if (candidates[i] !== oldCand) changed = true;

      if (countBits(candidates[i]) === 1) {
        const val = getFirstBit(candidates[i]);
        grid[i] = val;
        candidates[i] = 0;
        changed = true;
      }
    }
  }
  return true;
}

function solve9x9(grid: Grid, candidates: Uint16Array): boolean {
  if (!constrain9x9(grid, candidates)) return false;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true;

  for (let num = 1; num <= 9; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridBak = [...grid];
      const candBak = new Uint16Array(candidates);

      grid[bestPos] = num;
      candidates[bestPos] = 0;

      if (solve9x9(grid, candidates)) return true;

      for (let j = 0; j < grid.length; j++) {
        grid[j] = gridBak[j];
        candidates[j] = candBak[j];
      }
    }
  }
  return false;
}

function countSolutions9x9(grid: Grid, candidates: Uint16Array, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrain9x9(gridCopy, candCopy)) return 0;

  let minCand = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCand) {
        minCand = count;
        bestPos = i;
      }
    }
  }

  if (bestPos === -1) return 1;

  let count = 0;
  for (let num = 1; num <= 9; num++) {
    if (hasBit(candCopy, bestPos, num)) {
      const gc = [...gridCopy];
      const cc = new Uint16Array(candCopy);
      gc[bestPos] = num;
      cc[bestPos] = 0;
      count += countSolutions9x9(gc, cc, limit);
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 16×16 (4×4 boxes, values 1-16) ──────────────────────────────────────────
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

// ─── Public API ─────────────────────────────────────────────────────────────────

export function generatePuzzle(
  difficulty: string,
  gridSize: number = 9
): { grid: string; solution: string } {
  if (gridSize === 3) {
    const solution: Grid = new Array(9).fill(0);
    const candidates = initCandidates(solution, 3);
    solve3x3(solution, candidates);
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
      const candCopy = initCandidates(copy, 3);
      if (countSolutions3x3(copy, candCopy) === 1) {
        removed++;
      } else {
        puzzle[pos] = backup;
      }
    }

    return { grid: puzzle.join(""), solution: solutionStr };
  }

  if (gridSize === 4) {
    const solution: Grid = new Array(16).fill(0);
    const candidates = initCandidates(solution, 4);
    solve4x4(solution, candidates);
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
      const candCopy = initCandidates(copy, 4);
      if (countSolutions4x4(copy, candCopy) === 1) {
        removed++;
      } else {
        puzzle[pos] = backup;
      }
    }

    return { grid: puzzle.join(""), solution: solutionStr };
  }

  if (gridSize === 6) {
    const solution: Grid = new Array(36).fill(0);
    const candidates = initCandidates(solution, 6);
    solve6x6(solution, candidates);
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
      const candCopy = initCandidates(copy, 6);
      if (countSolutions6x6(copy, candCopy) === 1) {
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
  const candidates = initCandidates(solution, 9);
  solve9x9(solution, candidates);
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
    const candCopy = initCandidates(copy, 9);
    if (countSolutions9x9(copy, candCopy) === 1) {
      removed++;
    } else {
      puzzle[pos] = backup;
    }
  }

  return { grid: puzzle.join(""), solution: solutionStr };
}
