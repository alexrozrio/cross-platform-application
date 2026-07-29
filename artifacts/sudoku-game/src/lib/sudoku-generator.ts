// Client-side Sudoku puzzle generator — exact port of the server's sudoku.ts
// Used as a fallback when the API server is unavailable.

import { pickDefaultPuzzle } from '@/lib/default-puzzles';

type Grid = number[];

// ─── Encoding helpers ────────────────────────────────────────────────────────
export function encodeCell(n: number): string {
  if (n === 0) return "0";
  if (n <= 9) return n.toString();
  return String.fromCharCode(87 + n); // 10→'a', ..., 16→'g'
}

function encodeGrid(grid: Grid): string {
  return grid.map(encodeCell).join("");
}

// ─── Clue counts (mirrors server config/puzzle-clues.ts) ─────────────────────
const PUZZLE_CLUES: Record<number, Record<string, number>> = {
  3:  { easy: 8,   medium: 7,   hard: 6,   expert: 5   },
  4:  { easy: 14,  medium: 11,  hard: 8,   expert: 6   },
  6:  { easy: 24,  medium: 18,  hard: 14,  expert: 10  },
  9:  { easy: 50,  medium: 38,  hard: 28,  expert: 22  },
  16: { easy: 196, medium: 160, hard: 128, expert: 100 },
};
function getClueCount(gridSize: number, difficulty: string): number {
  const cfg = PUZZLE_CLUES[gridSize] ?? PUZZLE_CLUES[9];
  return cfg[difficulty] ?? cfg.medium;
}

// ─── 3×3 (rows + columns only) ───────────────────────────────────────────────
function isValid3x3(g: Grid, pos: number, n: number) {
  const r = Math.floor(pos / 3), c = pos % 3;
  for (let i = 0; i < 3; i++) {
    if (g[r * 3 + i] === n || g[i * 3 + c] === n) return false;
  }
  return true;
}
function solve3x3(g: Grid): boolean {
  const e = g.indexOf(0); if (e === -1) return true;
  for (const n of [1,2,3].sort(() => Math.random() - 0.5)) {
    if (isValid3x3(g, e, n)) { g[e] = n; if (solve3x3(g)) return true; g[e] = 0; }
  }
  return false;
}
function countSolutions3x3(g: Grid, limit = 2): number {
  const e = g.indexOf(0); if (e === -1) return 1;
  let count = 0;
  for (let n = 1; n <= 3; n++) {
    if (isValid3x3(g, e, n)) { g[e] = n; count += countSolutions3x3(g, limit); g[e] = 0; if (count >= limit) return count; }
  }
  return count;
}

// ─── 4×4 (2×2 boxes) ─────────────────────────────────────────────────────────
function isValid4x4(g: Grid, pos: number, n: number) {
  const r = Math.floor(pos / 4), c = pos % 4;
  const br = Math.floor(r / 2) * 2, bc = Math.floor(c / 2) * 2;
  for (let i = 0; i < 4; i++) { if (g[r*4+i]===n || g[i*4+c]===n) return false; }
  for (let rr = br; rr < br+2; rr++) for (let cc = bc; cc < bc+2; cc++) if (g[rr*4+cc]===n) return false;
  return true;
}
function solve4x4(g: Grid): boolean {
  const e = g.indexOf(0); if (e === -1) return true;
  for (const n of [1,2,3,4].sort(() => Math.random() - 0.5)) {
    if (isValid4x4(g, e, n)) { g[e] = n; if (solve4x4(g)) return true; g[e] = 0; }
  }
  return false;
}
function countSolutions4x4(g: Grid, limit = 2): number {
  const e = g.indexOf(0); if (e === -1) return 1;
  let count = 0;
  for (let n = 1; n <= 4; n++) {
    if (isValid4x4(g, e, n)) { g[e] = n; count += countSolutions4x4(g, limit); g[e] = 0; if (count >= limit) return count; }
  }
  return count;
}

// ─── 6×6 (2×3 boxes) ─────────────────────────────────────────────────────────
function isValid6x6(g: Grid, pos: number, n: number) {
  const r = Math.floor(pos / 6), c = pos % 6;
  const br = Math.floor(r / 2) * 2, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 6; i++) { if (g[r*6+i]===n || g[i*6+c]===n) return false; }
  for (let rr = br; rr < br+2; rr++) for (let cc = bc; cc < bc+3; cc++) if (g[rr*6+cc]===n) return false;
  return true;
}
function solve6x6(g: Grid): boolean {
  const e = g.indexOf(0); if (e === -1) return true;
  for (const n of [1,2,3,4,5,6].sort(() => Math.random() - 0.5)) {
    if (isValid6x6(g, e, n)) { g[e] = n; if (solve6x6(g)) return true; g[e] = 0; }
  }
  return false;
}
function countSolutions6x6(g: Grid, limit = 2): number {
  const e = g.indexOf(0); if (e === -1) return 1;
  let count = 0;
  for (let n = 1; n <= 6; n++) {
    if (isValid6x6(g, e, n)) { g[e] = n; count += countSolutions6x6(g, limit); g[e] = 0; if (count >= limit) return count; }
  }
  return count;
}

// ─── 9×9 (3×3 boxes) ─────────────────────────────────────────────────────────
function isValid9x9(g: Grid, pos: number, n: number) {
  const r = Math.floor(pos / 9), c = pos % 9;
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (g[r*9+i]===n || g[i*9+c]===n) return false;
    if (g[(br + Math.floor(i/3))*9 + bc + (i%3)]===n) return false;
  }
  return true;
}
function solve9x9(g: Grid): boolean {
  const e = g.indexOf(0); if (e === -1) return true;
  for (const n of [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5)) {
    if (isValid9x9(g, e, n)) { g[e] = n; if (solve9x9(g)) return true; g[e] = 0; }
  }
  return false;
}
function countSolutions9x9(g: Grid, limit = 2): number {
  const e = g.indexOf(0); if (e === -1) return 1;
  let count = 0;
  for (let n = 1; n <= 9; n++) {
    if (isValid9x9(g, e, n)) { g[e] = n; count += countSolutions9x9(g, limit); g[e] = 0; if (count >= limit) return count; }
  }
  return count;
}

// ─── 16×16 (algebraic, no uniqueness check) ──────────────────────────────────
function generate16x16Solution(): Grid {
  const SIZE = 16, BOX = 4;
  const base: Grid = new Array(256).fill(0);
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      base[r*SIZE+c] = (r*BOX + Math.floor(r/BOX) + c) % SIZE + 1;
  const numPerm = Array.from({ length: SIZE }, (_, i) => i+1).sort(() => Math.random() - 0.5);
  const bandOrder = [0,1,2,3].sort(() => Math.random() - 0.5);
  const rowPerm = bandOrder.flatMap(b => [0,1,2,3].sort(() => Math.random() - 0.5).map(r => b*BOX+r));
  const colBand = [0,1,2,3].sort(() => Math.random() - 0.5);
  const colPerm = colBand.flatMap(b => [0,1,2,3].sort(() => Math.random() - 0.5).map(c => b*BOX+c));
  const sol: Grid = new Array(256).fill(0);
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      sol[r*SIZE+c] = numPerm[base[rowPerm[r]*SIZE+colPerm[c]] - 1];
  return sol;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface OfflinePuzzle {
  grid: string;
  solution: string;
  gridSize: number;
  difficulty: string;
}

export const OFFLINE_PUZZLE_KEY = "sudoku-offline-puzzle";

/** Generate a puzzle entirely client-side. Saves it to localStorage and returns it.
 *  First tries the pre-built default bank (instant), then falls back to live generation. */
export function generateOfflinePuzzle(difficulty: string, gridSize: number): OfflinePuzzle {
  // ── Fast path: use a pre-built puzzle (zero generation time) ──────────────
  const defaults = pickDefaultPuzzle(gridSize, difficulty);
  if (defaults) {
    const result: OfflinePuzzle = {
      grid: defaults.grid,
      solution: defaults.solution,
      gridSize: defaults.gridSize,
      difficulty: defaults.difficulty,
    };
    try { localStorage.setItem(OFFLINE_PUZZLE_KEY, JSON.stringify(result)); } catch { /* ignore */ }
    return result;
  }

  // ── Slow path: generate live (fallback if default bank is missing) ────────
  let grid: string;
  let solution: string;

  if (gridSize === 3) {
    const sol: Grid = new Array(9).fill(0);
    solve3x3(sol);
    solution = sol.join("");
    const puzzle = [...sol];
    const positions = Array.from({ length: 9 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(3, difficulty);
    let removed = 0;
    for (const pos of positions) {
      if (removed >= 9 - clues) break;
      const backup = puzzle[pos]; puzzle[pos] = 0;
      if (countSolutions3x3([...puzzle]) === 1) { removed++; } else { puzzle[pos] = backup; }
    }
    grid = puzzle.join("");
  } else if (gridSize === 4) {
    const sol: Grid = new Array(16).fill(0);
    solve4x4(sol);
    solution = sol.join("");
    const puzzle = [...sol];
    const positions = Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(4, difficulty);
    let removed = 0;
    for (const pos of positions) {
      if (removed >= 16 - clues) break;
      const backup = puzzle[pos]; puzzle[pos] = 0;
      if (countSolutions4x4([...puzzle]) === 1) { removed++; } else { puzzle[pos] = backup; }
    }
    grid = puzzle.join("");
  } else if (gridSize === 6) {
    const sol: Grid = new Array(36).fill(0);
    solve6x6(sol);
    solution = sol.join("");
    const puzzle = [...sol];
    const positions = Array.from({ length: 36 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(6, difficulty);
    let removed = 0;
    for (const pos of positions) {
      if (removed >= 36 - clues) break;
      const backup = puzzle[pos]; puzzle[pos] = 0;
      if (countSolutions6x6([...puzzle]) === 1) { removed++; } else { puzzle[pos] = backup; }
    }
    grid = puzzle.join("");
  } else if (gridSize === 16) {
    const sol = generate16x16Solution();
    solution = encodeGrid(sol);
    const puzzle = [...sol];
    const positions = Array.from({ length: 256 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(16, difficulty);
    let removed = 0;
    for (const pos of positions) {
      if (removed >= 256 - clues) break;
      puzzle[pos] = 0; removed++;
    }
    grid = encodeGrid(puzzle);
  } else {
    // 9×9 default
    const sol: Grid = new Array(81).fill(0);
    solve9x9(sol);
    solution = sol.join("");
    const puzzle = [...sol];
    const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const clues = getClueCount(9, difficulty);
    let removed = 0;
    for (const pos of positions) {
      if (removed >= 81 - clues) break;
      const backup = puzzle[pos]; puzzle[pos] = 0;
      if (countSolutions9x9([...puzzle]) === 1) { removed++; } else { puzzle[pos] = backup; }
    }
    grid = puzzle.join("");
  }

  const result: OfflinePuzzle = { grid, solution, gridSize, difficulty };
  try { localStorage.setItem(OFFLINE_PUZZLE_KEY, JSON.stringify(result)); } catch { /* ignore */ }
  return result;
}

/** Read the offline puzzle previously saved to localStorage, or null if none. */
export function getOfflinePuzzle(): OfflinePuzzle | null {
  try {
    const raw = localStorage.getItem(OFFLINE_PUZZLE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflinePuzzle;
  } catch {
    return null;
  }
}
