import { GK_BANK } from "./gk";
import { MATHS_BANK } from "./maths";
import { SCIENCE_BANK } from "./science";

export type QuizSubject = "science" | "maths" | "gk";
export type QuizLevel = "easy" | "medium" | "hard" | "expert";

export interface QuizQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  /** Index into `options` of the correct answer. */
  answer: number;
}

export const QUIZ_SUBJECT_IDS: QuizSubject[] = ["science", "maths", "gk"];
export const QUIZ_LEVEL_IDS: QuizLevel[] = ["easy", "medium", "hard", "expert"];

/** Question banks per subject/level. Subjects without a bank return no questions. */
export const QUIZ_BANKS: Partial<Record<QuizSubject, Record<QuizLevel, QuizQuestion[]>>> = {
  science: SCIENCE_BANK,
  maths: MATHS_BANK,
  gk: GK_BANK,
};

export function quizBank(subject: QuizSubject, level: QuizLevel): QuizQuestion[] {
  return QUIZ_BANKS[subject]?.[level] ?? [];
}

export const QUIZ_QUESTIONS_PER_LEVEL: Record<QuizLevel, number> = {
  easy: 5,
  medium: 8,
  hard: 10,
  expert: 12,
};

export const QUIZ_PAR_SECONDS: Record<QuizLevel, number> = {
  easy: 120,
  medium: 180,
  hard: 240,
  expert: 300,
};

export const QUIZ_BASE_POINTS: Record<QuizLevel, number> = {
  easy: 150,
  medium: 300,
  hard: 600,
  expert: 1200,
};

export const QUIZ_XP_REWARDS: Record<QuizLevel, number> = {
  easy: 1,
  medium: 1,
  hard: 2,
  expert: 3,
};

export const QUIZ_GEM_REWARDS: Record<QuizLevel, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic question pick: same seed → same questions, same order. */
export function pickQuestions(questions: QuizQuestion[], count: number, seed: number): QuizQuestion[] {
  const rand = mulberry32(seed);
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/** Today's daily quiz config: fixed level + fixed question set per subject.
 *  Must stay in sync with getDailyConfig in api-server quiz-games.ts. */
export function dailyQuizConfig(subject: QuizSubject, date: string) {
  const digits = Number(date.replaceAll("-", "")) + QUIZ_SUBJECT_IDS.indexOf(subject);
  const level = QUIZ_LEVEL_IDS[digits % QUIZ_LEVEL_IDS.length];
  return { date, subject, level, questions: QUIZ_QUESTIONS_PER_LEVEL[level], seed: digits };
}

/** Count how many submitted answers match the correct option indexes.
 *  Non-integer / out-of-range / -1 (skipped) entries count as wrong. */
export function countQuizCorrect(questions: QuizQuestion[], answers: unknown[]): number {
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    const answer = answers[i];
    if (Number.isInteger(answer) && (answer as number) >= 0 && (answer as number) < questions[i].options.length && answer === questions[i].answer) {
      correct++;
    }
  }
  return correct;
}
