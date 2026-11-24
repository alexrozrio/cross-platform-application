// Jumble Words engine: each round is a fixed set of scrambled English words.
// Word selection and letter scrambling are deterministic given (seed,
// difficulty) so daily challenges and duels produce identical puzzles.

import { WORD_BANKS, type WordSearchDifficulty } from "@/lib/word-search";

export type JumbleDifficulty = "easy" | "medium" | "hard" | "expert";

export interface JumbleLevel {
  id: JumbleDifficulty;
  label: string;
  questions: number;
  wordTier: WordSearchDifficulty;
  mode: "baby" | "adult";
  parSeconds: number;
  basePoints: number;
  xp: number;
  gems: number;
}

export const JUMBLE_LEVELS: Record<JumbleDifficulty, JumbleLevel> = {
  easy: { id: "easy", label: "Easy", questions: 5, wordTier: "beginner", mode: "baby", parSeconds: 180, basePoints: 300, xp: 1, gems: 1 },
  medium: { id: "medium", label: "Medium", questions: 8, wordTier: "easy", mode: "baby", parSeconds: 300, basePoints: 650, xp: 2, gems: 2 },
  hard: { id: "hard", label: "Hard", questions: 10, wordTier: "medium", mode: "adult", parSeconds: 420, basePoints: 1300, xp: 3, gems: 3 },
  expert: { id: "expert", label: "Expert", questions: 12, wordTier: "hard", mode: "adult", parSeconds: 600, basePoints: 2400, xp: 4, gems: 5 },
};

export const JUMBLE_DIFFICULTIES = Object.keys(JUMBLE_LEVELS) as JumbleDifficulty[];

export interface JumbleQuestion {
  word: string;
  jumble: string;
}

/** Deterministic PRNG value in [0,1) for (seed, index, salt). */
function rand(seed: number, index: number, salt: number): number {
  let a = (seed >>> 0) ^ Math.imul(index + 1, 0x9E3779B1) ^ Math.imul(salt + 1, 0x85EBCA6B);
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

let poolCache: Partial<Record<WordSearchDifficulty, string[]>> = {};

/** All words across the base themes for a word tier, deduped and sorted. */
export function jumbleWordPool(tier: WordSearchDifficulty): string[] {
  if (poolCache[tier]) return poolCache[tier]!;
  const seen = new Set<string>();
  const pool: string[] = [];
  for (const bank of Object.values(WORD_BANKS)) {
    for (const raw of bank[tier] ?? []) {
      const word = raw.toUpperCase().replace(/[^A-Z]/g, "");
      if (word.length >= 3 && !seen.has(word)) { seen.add(word); pool.push(word); }
    }
  }
  pool.sort();
  poolCache[tier] = pool;
  return pool;
}

function shuffleIndexes(count: number, seed: number, salt: number): number[] {
  const idx = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand(seed, i, salt) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/** Scramble a word's letters deterministically; retries until it differs. */
export function scrambleWord(word: string, seed: number, index: number): string {
  const letters = word.split("");
  for (let attempt = 0; attempt < 30; attempt++) {
    const order = shuffleIndexes(letters.length, seed, index * 131 + attempt);
    const out = order.map((i) => letters[i]).join("");
    if (out !== word) return out;
  }
  // Fallback: rotate by one — always differs for words longer than 1 letter.
  return letters.slice(1).concat(letters[0]).join("");
}

/** Build the deterministic question list for a round. */
export function createJumbleRound(difficulty: JumbleDifficulty, seed: number): JumbleQuestion[] {
  const level = JUMBLE_LEVELS[difficulty];
  const pool = jumbleWordPool(level.wordTier);
  const count = Math.min(level.questions, pool.length);
  // Deterministic partial Fisher-Yates over the pool.
  const order = shuffleIndexes(pool.length, seed, 999);
  const questions: JumbleQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const word = pool[order[i]];
    questions.push({ word, jumble: scrambleWord(word, seed, i) });
  }
  return questions;
}

/** Normalize a player's answer: uppercase A-Z only. */
export function normalizeJumbleAnswer(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, "");
}

export function isJumbleAnswerCorrect(input: string, word: string): boolean {
  return normalizeJumbleAnswer(input) === word.toUpperCase();
}
