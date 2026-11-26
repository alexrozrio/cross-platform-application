export type MemoryOrderLevel = "easy" | "medium" | "hard" | "expert";

export const MEMORY_ORDER_LEVEL_ORDER: MemoryOrderLevel[] = ["easy", "medium", "hard", "expert"];

export const MEMORY_ORDER_LEVELS: Record<MemoryOrderLevel, {
  label: string;
  detail: string;
  sequenceLength: number;
  viewSeconds: number;
  questions: number;
  mode: "baby" | "adult";
  parSeconds: number;
  basePoints: number;
  xp: number;
  gems: number;
}> = {
  easy: { label: "Easy", detail: "4 images · 12s view · 3 rounds", sequenceLength: 4, viewSeconds: 12, questions: 3, mode: "baby", parSeconds: 120, basePoints: 150, xp: 1, gems: 1 },
  medium: { label: "Medium", detail: "5 images · 10s view · 4 rounds", sequenceLength: 5, viewSeconds: 10, questions: 4, mode: "baby", parSeconds: 180, basePoints: 300, xp: 1, gems: 2 },
  hard: { label: "Hard", detail: "6 images · 9s view · 5 rounds", sequenceLength: 6, viewSeconds: 9, questions: 5, mode: "adult", parSeconds: 300, basePoints: 600, xp: 2, gems: 3 },
  expert: { label: "Expert", detail: "8 images · 8s view · 6 rounds", sequenceLength: 8, viewSeconds: 8, questions: 6, mode: "adult", parSeconds: 420, basePoints: 1600, xp: 4, gems: 5 },
};

export interface MemoryOrderQuestion {
  /** Symbol values (1-based) in the order the player must reproduce. */
  sequence: number[];
  /** Same values, shuffled — the order tiles are displayed in. */
  tiles: number[];
}

const IMAGE_VALUE_COUNT = 32;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function memoryOrderRound(level: MemoryOrderLevel, seed = 1): MemoryOrderQuestion[] {
  const config = MEMORY_ORDER_LEVELS[level];
  const rand = mulberry32(seed);
  const questions: MemoryOrderQuestion[] = [];
  const poolSize = Math.min(IMAGE_VALUE_COUNT, config.sequenceLength + 4);

  for (let index = 0; index < config.questions; index++) {
    const pool = shuffled(
      Array.from({ length: poolSize }, (_, i) => i + 1),
      rand,
    );
    const sequence = pool.slice(0, config.sequenceLength);
    // Keep retrying until the display shuffle differs from the answer order —
    // a solved-order grid would give the answer away.
    let tiles = shuffled(sequence, rand);
    let guard = 0;
    while (tiles.every((v, i) => v === sequence[i]) && guard++ < 8) {
      tiles = shuffled(sequence, rand);
    }
    questions.push({ sequence, tiles });
  }

  return questions;
}

export function countMemoryOrderCorrect(questions: MemoryOrderQuestion[], answers: number[][]): number {
  return questions.reduce((count, question, index) => {
    const answer = answers[index];
    if (!Array.isArray(answer) || answer.length !== question.sequence.length) return count;
    return count + (answer.every((value, i) => value === question.sequence[i]) ? 1 : 0);
  }, 0);
}
