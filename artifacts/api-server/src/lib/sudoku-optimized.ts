import { getClueCount } from "../config/puzzle-clues";

type Grid = number[];
type CandidateSet = Uint16Array; // Bit flags for candidates (values 1-16)

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
// Each bit represents a possible value (0 = value 1, 1 = value 2, etc.)

function createCandidateSets(size: number): CandidateSet {
  const maxVal = Math.pow(size, 2);
  return new Uint16Array(maxVal);
}

function initializeCandidates(grid: Grid, size: number): CandidateSet {
  const candidates = new Uint16Array(grid.length);
  const allBits = (1 << size) - 1; // All bits set for the grid size
  
  for (let i = 0; i < grid.length; i++) {
    candidates[i] = grid[i] === 0 ? allBits : 0;
  }
  
  return candidates;
}

function setBit(candidates: CandidateSet, pos: number, val: number): void {
  candidates[pos] |= (1 << (val - 1));
}

function clearBit(candidates: CandidateSet, pos: number, val: number): void {
  candidates[pos] &= ~(1 << (val - 1));
}

function hasBit(candidates: CandidateSet, pos: number, val: number): boolean {
  return (candidates[pos] & (1 << (val - 1))) !== 0;
}

function countBits(val: number): number {
  let count = 0;
  while (val) {
    count += val & 1;
    val >>= 1;
  }
  return count;
}

function getFirstBit(val: number): number {
  for (let i = 1; i <= 9; i++) {
    if ((val & (1 << (i - 1))) !== 0) return i;
  }
  return 0;
}

// ─── 3×3 (child / Latin-square, rows + columns only) ────────────────────────────

function isValid3x3(grid: Grid, pos: number, num: number): boolean {
  const row = Math.floor(pos / 3);
  const col = pos % 3;
  for (let i = 0; i < 3; i++) {
    if (grid[row * 3 + i] === num) return false;
    if (grid[i * 3 + col] === num) return false;
  }
  return true;
}

function constrainCandidates3x3(grid: Grid, candidates: CandidateSet, size: number = 3): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / size);
      const col = i % size;
      const oldCandidates = candidates[i];

      // Remove candidates that exist in the row or column
      for (let j = 0; j < size; j++) {
        const rowVal = grid[row * size + j];
        const colVal = grid[j * size + col];
        if (rowVal !== 0) clearBit(candidates, i, rowVal);
        if (colVal !== 0) clearBit(candidates, i, colVal);
      }

      if (candidates[i] === 0) return false; // Contradiction
      if (candidates[i] !== oldCandidates) changed = true;

      // Naked singles: if only one candidate, set it
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

function solve3x3(grid: Grid, candidates: CandidateSet): boolean {
  if (!constrainCandidates3x3(grid, candidates)) return false;

  // Find empty cell with minimum candidates
  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCandidates) {
        minCandidates = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true; // Solved

  const row = Math.floor(bestPos / 3);
  const col = bestPos % 3;

  for (let num = 1; num <= 3; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridCopy = [...grid];
      const candCopy = new Uint16Array(candidates);

      grid[bestPos] = num;
      clearBit(candidates, bestPos, num);
      candidates[bestPos] = 0;

      if (solve3x3(grid, candidates)) return true;

      for (let i = 0; i < grid.length; i++) {
        grid[i] = gridCopy[i];
        candidates[i] = candCopy[i];
      }
    }
  }
  return false;
}

function countSolutions3x3(grid: Grid, candidates: CandidateSet, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrainCandidates3x3(gridCopy, candCopy)) return 0;

  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCandidates) {
        minCandidates = count;
        bestPos = i;
      }
    }
  }

  if (bestPos === -1) return 1;

  let count = 0;
  for (let num = 1; num <= 3; num++) {
    if (hasBit(candCopy, bestPos, num)) {
      const nextGrid = [...gridCopy];
      const nextCandidates = new Uint16Array(candCopy);
      nextGrid[bestPos] = num;
      nextCandidates[bestPos] = 0;
      count += countSolutions3x3(nextGrid, nextCandidates, limit);
      if (count >= limit) return count;
    }
  }
  return count;
}

// ─── 4×4 (2×2 boxes) ──────────────────────────────────────────────────────────

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

function constrainCandidates4x4(grid: Grid, candidates: CandidateSet): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / 4);
      const col = i % 4;
      const boxRow = Math.floor(row / 2) * 2;
      const boxCol = Math.floor(col / 2) * 2;
      const oldCandidates = candidates[i];

      // Remove candidates in row, column, box
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
      if (candidates[i] !== oldCandidates) changed = true;

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

function solve4x4Fast(grid: Grid, candidates: CandidateSet): boolean {
  if (!constrainCandidates4x4(grid, candidates)) return false;

  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCandidates) {
        minCandidates = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true;

  for (let num = 1; num <= 4; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridCopy = [...grid];
      const candCopy = new Uint16Array(candidates);

      grid[bestPos] = num;
      candidates[bestPos] = 0;

      if (solve4x4Fast(grid, candidates)) return true;

      for (let j = 0; j < grid.length; j++) {
        grid[j] = gridCopy[j];
        candidates[j] = candCopy[j];
      }
    }
  }
  return false;
}

function countSolutions4x4(grid: Grid, candidates: CandidateSet, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrainCandidates4x4(gridCopy, candCopy)) return 0;

  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCandidates) {
        minCandidates = count;
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

function constrainCandidates6x6(grid: Grid, candidates: CandidateSet): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / 6);
      const col = i % 6;
      const boxRow = Math.floor(row / 2) * 2;
      const boxCol = Math.floor(col / 3) * 3;
      const oldCandidates = candidates[i];

      // Remove candidates in row, column, box
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
      if (candidates[i] !== oldCandidates) changed = true;

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

function solve6x6Fast(grid: Grid, candidates: CandidateSet): boolean {
  if (!constrainCandidates6x6(grid, candidates)) return false;

  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCandidates) {
        minCandidates = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true;

  for (let num = 1; num <= 6; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridCopy = [...grid];
      const candCopy = new Uint16Array(candidates);

      grid[bestPos] = num;
      candidates[bestPos] = 0;

      if (solve6x6Fast(grid, candidates)) return true;

      for (let j = 0; j < grid.length; j++) {
        grid[j] = gridCopy[j];
        candidates[j] = candCopy[j];
      }
    }
  }
  return false;
}

function countSolutions6x6(grid: Grid, candidates: CandidateSet, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrainCandidates6x6(gridCopy, candCopy)) return 0;

  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCandidates) {
        minCandidates = count;
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

function constrainCandidates9x9(grid: Grid, candidates: CandidateSet): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0 || candidates[i] === 0) continue;

      const row = Math.floor(i / 9);
      const col = i % 9;
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      const oldCandidates = candidates[i];

      // Remove candidates in row, column, box
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
      if (candidates[i] !== oldCandidates) changed = true;

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

function solve9x9Fast(grid: Grid, candidates: CandidateSet): boolean {
  if (!constrainCandidates9x9(grid, candidates)) return false;

  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0 && candidates[i] !== 0) {
      const count = countBits(candidates[i]);
      if (count < minCandidates) {
        minCandidates = count;
        bestPos = i;
        if (count === 1) break;
      }
    }
  }

  if (bestPos === -1) return true;

  for (let num = 1; num <= 9; num++) {
    if (hasBit(candidates, bestPos, num)) {
      const gridCopy = [...grid];
      const candCopy = new Uint16Array(candidates);

      grid[bestPos] = num;
      candidates[bestPos] = 0;

      if (solve9x9Fast(grid, candidates)) return true;

      for (let j = 0; j < grid.length; j++) {
        grid[j] = gridCopy[j];
        candidates[j] = candCopy[j];
      }
    }
  }
  return false;
}

function countSolutions9x9(grid: Grid, candidates: CandidateSet, limit = 2): number {
  const gridCopy = [...grid];
  const candCopy = new Uint16Array(candidates);

  if (!constrainCandidates9x9(gridCopy, candCopy)) return 0;

  let minCandidates = 10;
  let bestPos = -1;
  for (let i = 0; i < gridCopy.length; i++) {
    if (gridCopy[i] === 0 && candCopy[i] !== 0) {
      const count = countBits(candCopy[i]);
      if (count < minCandidates) {
        minCandidates = count;
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
// Algebraic base solution with random permutation (no backtracking)

function generate16x16Solution(): Grid {
  const SIZE = 16;
  const BOX = 4;

  const base: Grid = new Array(256).fill(0);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      base[r * SIZE + c] = (r * BOX + Math.floor(r / BOX) + c) % SIZE + 1;
    }
  }

  const numPerm = Array.from({ length: SIZE }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
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
    const candidates = initializeCandidates(solution, 3);
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
      const candCopy = initializeCandidates(copy, 3);
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
    const candidates = initializeCandidates(solution, 4);
    solve4x4Fast(solution, candidates);
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
      const candCopy = initializeCandidates(copy, 4);
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
    const candidates = initializeCandidates(solution, 6);
    solve6x6Fast(solution, candidates);
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
      const candCopy = initializeCandidates(copy, 6);
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

    for (const pos of positions) {
      if (removed >= target) break;
      puzzle[pos] = 0;
      removed++;
    }

    return { grid: encodeGrid(puzzle), solution: solutionStr };
  }

  // Default 9×9
  const solution: Grid = new Array(81).fill(0);
  const candidates = initializeCandidates(solution, 9);
  solve9x9Fast(solution, candidates);
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
    const candCopy = initializeCandidates(copy, 9);
    if (countSolutions9x9(copy, candCopy) === 1) {
      removed++;
    } else {
      puzzle[pos] = backup;
    }
  }

  return { grid: puzzle.join(""), solution: solutionStr };
}
