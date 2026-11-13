export type MinesweeperDifficulty = "beginner" | "easy" | "medium" | "hard";

export const MINESWEEPER_LEVELS: Record<MinesweeperDifficulty, { label: string; size: number; mines: number; mode: "baby" | "adult" }> = {
  beginner: { label: "Beginner", size: 6, mines: 5, mode: "baby" },
  easy: { label: "Easy", size: 8, mines: 12, mode: "baby" },
  medium: { label: "Medium", size: 12, mines: 24, mode: "adult" },
  hard: { label: "Hard", size: 14, mines: 34, mode: "adult" },
};

export const MINESWEEPER_DIFFICULTIES = Object.keys(MINESWEEPER_LEVELS) as MinesweeperDifficulty[];
export const MAX_MISTAKES = 3;
export const MAX_HINTS = 2;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Indices of the 8 neighbours of a cell (fewer on edges). */
export function neighborIndices(index: number, size: number): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size) out.push(r * size + c);
    }
  }
  return out;
}

/**
 * Deterministic minefield for a seed. Mines never appear in the central 3×3
 * safe zone so the first clicks there are always safe — and identical for
 * every player sharing the same seed (daily challenge / duels).
 */
export function createMinefield(size: number, mineCount: number, seed: number): boolean[] {
  const total = size * size;
  const safe = new Set<number>();
  const center = Math.floor(size / 2) * size + Math.floor(size / 2);
  safe.add(center);
  for (const n of neighborIndices(center, size)) safe.add(n);

  const rand = mulberry32(seed);
  const candidates = Array.from({ length: total }, (_, i) => i).filter((i) => !safe.has(i));
  const mines = new Set<number>();
  const count = Math.min(mineCount, candidates.length);
  while (mines.size < count) {
    mines.add(candidates[Math.floor(rand() * candidates.length)]);
  }
  const field = new Array<boolean>(total).fill(false);
  for (const i of mines) field[i] = true;
  return field;
}

/** Adjacent-mine count for every cell. */
export function computeCounts(mines: boolean[], size: number): number[] {
  const counts = new Array<number>(mines.length).fill(0);
  for (let i = 0; i < mines.length; i++) {
    if (mines[i]) continue;
    let n = 0;
    for (const j of neighborIndices(i, size)) if (mines[j]) n++;
    counts[i] = n;
  }
  return counts;
}

export interface RevealResult {
  /** Indices that became revealed by this action. */
  revealed: number[];
  /** True when the action hit at least one mine. */
  hitMine: boolean;
}

/**
 * Reveal `start` plus its zero-count flood region. `revealed`/`flagged` are
 * mutated in place; flagged cells are never revealed.
 */
export function revealFrom(
  start: number,
  mines: boolean[],
  counts: number[],
  size: number,
  revealed: boolean[],
  flagged: boolean[],
): RevealResult {
  const out: number[] = [];
  if (revealed[start] || flagged[start]) return { revealed: out, hitMine: false };
  if (mines[start]) {
    revealed[start] = true;
    out.push(start);
    return { revealed: out, hitMine: true };
  }
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    if (revealed[i] || flagged[i]) continue;
    revealed[i] = true;
    out.push(i);
    if (counts[i] === 0) {
      for (const j of neighborIndices(i, size)) {
        if (!revealed[j] && !flagged[j]) stack.push(j);
      }
    }
  }
  return { revealed: out, hitMine: false };
}

/** Reveal every unflagged covered neighbour of a revealed numbered cell. classic chord. */
export function chordFrom(
  start: number,
  mines: boolean[],
  counts: number[],
  size: number,
  revealed: boolean[],
  flagged: boolean[],
): RevealResult {
  const out: number[] = [];
  let hitMine = false;
  const neighbors = neighborIndices(start, size);
  const flagCount = neighbors.filter((i) => flagged[i]).length;
  if (!revealed[start] || counts[start] !== flagCount) return { revealed: out, hitMine };
  for (const i of neighbors) {
    if (revealed[i] || flagged[i]) continue;
    const result = revealFrom(i, mines, counts, size, revealed, flagged);
    out.push(...result.revealed);
    hitMine = hitMine || result.hitMine;
  }
  return { revealed: out, hitMine };
}
