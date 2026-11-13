export type SlidePuzzleDifficulty = "2x2" | "3x3" | "4x4" | "5x5";
export type SlidePuzzleTileStyle = "numbers" | "alphabet" | "icons";

export const SLIDE_PUZZLE_LEVELS: Record<SlidePuzzleDifficulty, {
  label: string;
  size: number;
  tiles: number;
  mode: "baby" | "adult";
  parMoves: number;
  parSeconds: number;
  basePoints: number;
  xp: number;
  gems: number;
}> = {
  "2x2": { label: "2×2", size: 2, tiles: 3, mode: "baby", parMoves: 12, parSeconds: 90, basePoints: 120, xp: 1, gems: 1 },
  "3x3": { label: "3×3", size: 3, tiles: 8, mode: "baby", parMoves: 60, parSeconds: 300, basePoints: 300, xp: 1, gems: 2 },
  "4x4": { label: "4×4", size: 4, tiles: 15, mode: "adult", parMoves: 160, parSeconds: 1200, basePoints: 700, xp: 2, gems: 3 },
  "5x5": { label: "5×5", size: 5, tiles: 24, mode: "adult", parMoves: 320, parSeconds: 2700, basePoints: 1500, xp: 3, gems: 4 },
};

export const SLIDE_PUZZLE_DIFFICULTIES = Object.keys(SLIDE_PUZZLE_LEVELS) as SlidePuzzleDifficulty[];
export const SLIDE_PUZZLE_TILE_STYLES: { id: SlidePuzzleTileStyle; label: string }[] = [
  { id: "numbers", label: "Numbers" },
  { id: "alphabet", label: "Alphabet" },
  { id: "icons", label: "Pictures" },
];
export const MAX_HINTS = 3;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Solved board: tiles 1..n²-1 in order, blank (0) in the last slot. */
export function createSolvedTiles(size: number): number[] {
  return Array.from({ length: size * size }, (_, i) => (i === size * size - 1 ? 0 : i + 1));
}

export function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length - 1; i++) if (tiles[i] !== i + 1) return false;
  return tiles[tiles.length - 1] === 0;
}

export function blankIndex(tiles: number[]): number {
  return tiles.indexOf(0);
}

/** Orthogonal neighbour offsets for a flat index. */
function neighbours(index: number, size: number): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const out: number[] = [];
  if (row > 0) out.push(index - size);
  if (row < size - 1) out.push(index + size);
  if (col > 0) out.push(index - 1);
  if (col < size - 1) out.push(index + 1);
  return out;
}

/** Indices of tiles that can slide into the blank right now. */
export function slideableIndexes(tiles: number[], size: number): number[] {
  return neighbours(blankIndex(tiles), size);
}

/** Slide the tile at `index` into the blank. Returns a new array. */
export function slideTile(tiles: number[], index: number): number[] {
  const blank = blankIndex(tiles);
  const next = [...tiles];
  next[blank] = next[index];
  next[index] = 0;
  return next;
}

/**
 * Deterministic solvable scramble: random-walks the blank from the solved
 * state, which guarantees the board can always be solved back. The same seed
 * produces the same board for daily challenges and duels.
 */
export function scrambleTiles(size: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const tiles = createSolvedTiles(size);
  const total = size * size;
  // On 2×2 the blank has only two neighbours, so excluding the previous
  // square leaves one forced move and every seed scrambles identically.
  // Allow backtracking there and randomize the parity so both tile
  // permutations are reachable; larger boards keep the no-reversal walk.
  const steps = total * total * 3 + (size === 2 ? Math.floor(rand() * 2) : 0);
  let blank = blankIndex(tiles);
  let previousBlank = -1;
  for (let i = 0; i < steps; i++) {
    const all = neighbours(blank, size);
    const options = size === 2 ? all : all.filter((n) => n !== previousBlank);
    const pickFrom = options.length ? options : all;
    const next = pickFrom[Math.floor(rand() * pickFrom.length)];
    const tmp = tiles[blank];
    tiles[blank] = tiles[next];
    tiles[next] = tmp;
    previousBlank = blank;
    blank = next;
  }
  if (isSolved(tiles)) {
    const options = neighbours(blank, size);
    const next = size === 2 ? options[Math.floor(rand() * options.length)] : options[0];
    const tmp = tiles[blank];
    tiles[blank] = tiles[next];
    tiles[next] = tmp;
  }
  return tiles;
}

/** Total Manhattan distance of every tile from its home position. */
export function manhattanDistance(tiles: number[], size: number): number {
  let total = 0;
  const last = size * size - 1;
  for (let i = 0; i < tiles.length; i++) {
    const value = tiles[i];
    const home = value === 0 ? last : value - 1;
    const dr = Math.floor(i / size) - Math.floor(home / size);
    const dc = (i % size) - (home % size);
    total += Math.abs(dr) + Math.abs(dc);
  }
  return total;
}

/**
 * Hint: among the tiles that can slide right now, pick the one whose move
 * most reduces the total Manhattan distance. Returns its board index, or -1
 * when no slide improves the board.
 */
export function hintTileIndex(tiles: number[], size: number): number {
  const candidates = slideableIndexes(tiles, size);
  if (!candidates.length) return -1;
  let best = -1;
  let bestScore = Infinity;
  const current = manhattanDistance(tiles, size);
  for (const index of candidates) {
    const score = manhattanDistance(slideTile(tiles, index), size);
    if (score < bestScore) { bestScore = score; best = index; }
  }
  return bestScore < current ? best : candidates[0];
}

/** Display label for a tile value under the chosen style. */
export function tileLabel(value: number, style: SlidePuzzleTileStyle): string {
  if (style === "alphabet") return String.fromCharCode(64 + value);
  return String(value);
}
