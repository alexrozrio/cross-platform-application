// 2048 engine: flat board of tile values (0 = empty), deterministic seeded
// spawns so daily challenges and duels produce identical tile sequences.

export type Game2048Difficulty = "3x3" | "4x4" | "5x5" | "6x6";
export type Game2048Direction = "up" | "down" | "left" | "right";

export interface Game2048Level {
  id: Game2048Difficulty;
  label: string;
  size: number;
  mode: "baby" | "adult";
  targetTile: number;
  parSeconds: number;
  basePoints: number;
  xp: number;
  gems: number;
}

export const GAME_2048_LEVELS: Record<Game2048Difficulty, Game2048Level> = {
  "3x3": { id: "3x3", label: "Easy", size: 3, mode: "baby", targetTile: 512, parSeconds: 600, basePoints: 150, xp: 1, gems: 1 },
  "4x4": { id: "4x4", label: "Medium", size: 4, mode: "baby", targetTile: 1024, parSeconds: 1500, basePoints: 400, xp: 2, gems: 2 },
  "5x5": { id: "5x5", label: "Hard", size: 5, mode: "adult", targetTile: 2048, parSeconds: 2700, basePoints: 900, xp: 3, gems: 3 },
  "6x6": { id: "6x6", label: "Expert", size: 6, mode: "adult", targetTile: 2048, parSeconds: 4500, basePoints: 1800, xp: 4, gems: 5 },
};

export const GAME_2048_DIFFICULTIES = Object.keys(GAME_2048_LEVELS) as Game2048Difficulty[];
export const GAME_2048_TARGET_TILE = 2048;

export interface Game2048State {
  size: number;
  tiles: number[];      // length size*size, 0 = empty
  score: number;        // classic 2048 merge score
  moves: number;
  spawnCount: number;   // number of tiles spawned (drives deterministic RNG)
  maxTile: number;
  status: "playing" | "won" | "over";
  reachedTarget: boolean;
}

/** Deterministic PRNG value in [0,1) for (seed, index, salt). */
function rand(seed: number, index: number, salt: number): number {
  let a = (seed >>> 0) ^ Math.imul(index + 1, 0x9E3779B1) ^ Math.imul(salt + 1, 0x85EBCA6B);
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function emptyIndexes(tiles: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < tiles.length; i++) if (tiles[i] === 0) out.push(i);
  return out;
}

/** Spawn one tile deterministically from (seed, spawnCount). 90% → 2, 10% → 4. */
export function spawnTile(state: Game2048State, seed: number): Game2048State {
  const empties = emptyIndexes(state.tiles);
  if (!empties.length) return { ...state, status: "over" };
  const pick = Math.floor(rand(seed, state.spawnCount, 0) * empties.length);
  const value = rand(seed, state.spawnCount, 1) < 0.9 ? 2 : 4;
  const tiles = [...state.tiles];
  tiles[empties[pick]] = value;
  return {
    ...state,
    tiles,
    spawnCount: state.spawnCount + 1,
    maxTile: Math.max(state.maxTile, value),
    status: state.status === "over" ? "over" : state.status,
  };
}

export function createGame2048(size: number, seed: number, targetTile = GAME_2048_TARGET_TILE): Game2048State {
  let state: Game2048State = {
    size, tiles: Array(size * size).fill(0), score: 0, moves: 0,
    spawnCount: 0, maxTile: 0, status: "playing", reachedTarget: false,
  };
  state = spawnTile(state, seed);
  state = spawnTile(state, seed);
  return state;
}

/** Slide+merge one line of values toward index 0. Returns merged line + gained score. */
function mergeLine(line: number[]): { out: number[]; gained: number } {
  const vals = line.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      out.push(vals[i] * 2);
      gained += vals[i] * 2;
      i++;
    } else {
      out.push(vals[i]);
    }
  }
  while (out.length < line.length) out.push(0);
  return { out, gained };
}

function linesFor(state: Game2048State, dir: Game2048Direction): { indexes: number[]; lines: number[][] } {
  const { size, tiles } = state;
  const lines: number[][] = [];
  const indexes: number[] = [];
  if (dir === "left" || dir === "right") {
    for (let r = 0; r < size; r++) {
      const idx = Array.from({ length: size }, (_, c) => r * size + c);
      const vals = idx.map((i) => tiles[i]);
      lines.push(dir === "left" ? vals : [...vals].reverse());
      indexes.push(...idx);
    }
  } else {
    for (let c = 0; c < size; c++) {
      const idx = Array.from({ length: size }, (_, r) => r * size + c);
      const vals = idx.map((i) => tiles[i]);
      lines.push(dir === "up" ? vals : [...vals].reverse());
      indexes.push(...idx);
    }
  }
  return { indexes, lines };
}

/**
 * Apply a move. Returns a new state, or null when the board cannot move in
 * that direction. A successful move merges tiles, adds score, increments
 * moves, then spawns the next deterministic tile.
 */
export function move2048(state: Game2048State, dir: Game2048Direction, seed: number, targetTile = GAME_2048_TARGET_TILE): Game2048State | null {
  if (state.status !== "playing") return null;
  const { size, tiles } = state;
  const { indexes, lines } = linesFor(state, dir);
  const next = [...tiles];
  let gained = 0;
  let moved = false;
  const perLineSize = dir === "left" || dir === "right" ? size : size;
  void perLineSize;
  for (let l = 0; l < lines.length; l++) {
    const { out, gained: g } = mergeLine(lines[l]);
    gained += g;
    const idx = indexes.slice(l * size, (l + 1) * size);
    const ordered = dir === "left" || dir === "up" ? out : [...out].reverse();
    for (let i = 0; i < size; i++) {
      if (next[idx[i]] !== ordered[i]) moved = true;
      next[idx[i]] = ordered[i];
    }
  }
  if (!moved) return null;
  let nextState: Game2048State = {
    ...state,
    tiles: next,
    score: state.score + gained,
    moves: state.moves + 1,
    maxTile: Math.max(state.maxTile, ...next.filter((v) => v > 0)),
    status: "playing",
    reachedTarget: state.reachedTarget || next.some((v) => v >= targetTile),
  };
  nextState = spawnTile(nextState, seed);
  if (!canMove2048(nextState.tiles, size)) nextState = { ...nextState, status: "over" };
  return nextState;
}

export function canMove2048(tiles: number[], size: number): boolean {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === 0) return true;
    const r = Math.floor(i / size), c = i % size;
    if (c + 1 < size && tiles[i] === tiles[i + 1]) return true;
    if (r + 1 < size && tiles[i] === tiles[i + size]) return true;
  }
  return false;
}

export function isGameOver2048(state: Game2048State): boolean {
  return state.status === "over" || !canMove2048(state.tiles, state.size);
}

/** Serialize for localStorage persistence. */
export function serialize2048(state: Game2048State) {
  return { size: state.size, tiles: state.tiles, score: state.score, moves: state.moves, spawnCount: state.spawnCount, maxTile: state.maxTile, status: state.status, reachedTarget: state.reachedTarget };
}

export function deserialize2048(value: unknown, size: number, seed: number, targetTile = GAME_2048_TARGET_TILE): Game2048State | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<Game2048State>;
  if (!Array.isArray(v.tiles) || v.tiles.length !== size * size || !v.tiles.every((t) => Number.isInteger(t) && t >= 0)) return null;
  const state: Game2048State = {
    size,
    tiles: v.tiles as number[],
    score: Number.isFinite(v.score) ? Math.max(0, Math.floor(v.score as number)) : 0,
    moves: Number.isFinite(v.moves) ? Math.max(0, Math.floor(v.moves as number)) : 0,
    spawnCount: Number.isFinite(v.spawnCount) ? Math.max(0, Math.floor(v.spawnCount as number)) : 0,
    maxTile: Number.isFinite(v.maxTile) ? Math.max(0, Math.floor(v.maxTile as number)) : 0,
    status: v.status === "won" || v.status === "over" ? v.status : "playing",
    reachedTarget: v.reachedTarget === true || (Array.isArray(v.tiles) && (v.tiles as number[]).some((t) => t >= targetTile)),
  };
  if (state.status === "playing" && !canMove2048(state.tiles, size)) state.status = "over";
  return state;
}
