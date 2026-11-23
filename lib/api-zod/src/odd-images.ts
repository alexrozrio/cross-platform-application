export type OddImageLevel = "easy" | "medium" | "hard" | "expert";

export const ODD_IMAGE_LEVEL_ORDER: OddImageLevel[] = ["easy", "medium", "hard", "expert"];

export const ODD_IMAGE_LEVELS: Record<OddImageLevel, {
  label: string;
  detail: string;
  gridSize: number;
  questions: number;
  mode: "baby" | "adult";
  parSeconds: number;
  basePoints: number;
  xp: number;
  gems: number;
}> = {
  easy: { label: "Easy", detail: "3×3 grid · 5 questions", gridSize: 3, questions: 5, mode: "baby", parSeconds: 120, basePoints: 150, xp: 1, gems: 1 },
  medium: { label: "Medium", detail: "4×4 grid · 8 questions", gridSize: 4, questions: 8, mode: "baby", parSeconds: 180, basePoints: 300, xp: 1, gems: 2 },
  hard: { label: "Hard", detail: "5×5 grid · 10 questions", gridSize: 5, questions: 10, mode: "adult", parSeconds: 300, basePoints: 600, xp: 2, gems: 3 },
  expert: { label: "Expert", detail: "6×6 grid · 12 questions", gridSize: 6, questions: 12, mode: "adult", parSeconds: 420, basePoints: 1200, xp: 3, gems: 4 },
};

export type OddImageVariant = "color" | "flip-horizontal" | "flip-vertical" | "rotate-left" | "rotate-right" | "missing-part";

export interface OddImageQuestion {
  values: number[];
  oddIndex: number;
  /** Same-image mutations to try for the odd cell, in preference order. */
  variants?: OddImageVariant[];
  /** Deterministic seed for mutation details such as where a missing part is erased. */
  mutationSeed?: number;
}

const IMAGE_VALUE_COUNT = 32;
const HARD_VARIANTS: OddImageVariant[] = ["flip-horizontal", "flip-vertical", "rotate-left", "rotate-right", "missing-part"];
const EXPERT_VARIANTS: OddImageVariant[] = ["flip-horizontal", "flip-vertical", "rotate-left", "rotate-right", "missing-part", "missing-part"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function oddImageRound(level: OddImageLevel, seed = 1): OddImageQuestion[] {
  const config = ODD_IMAGE_LEVELS[level];
  const rand = mulberry32(seed);
  const questions: OddImageQuestion[] = [];
  const cellCount = config.gridSize * config.gridSize;

  for (let index = 0; index < config.questions; index++) {
    const majority = 1 + Math.floor(rand() * IMAGE_VALUE_COUNT);
    const oddIndex = Math.floor(rand() * cellCount);

    if (level === "easy") {
      const offset = 1 + Math.floor(rand() * (IMAGE_VALUE_COUNT - 1));
      const odd = ((majority - 1 + offset) % IMAGE_VALUE_COUNT) + 1;
      const values = Array.from({ length: cellCount }, () => majority);
      values[oddIndex] = odd;
      questions.push({ values, oddIndex });
      continue;
    }

    const values = Array.from({ length: cellCount }, () => majority);
    const pool = level === "medium" ? (["color"] as OddImageVariant[]) : level === "hard" ? HARD_VARIANTS : EXPERT_VARIANTS;
    const variantTarget = level === "medium" ? 1 : level === "hard" ? 3 : 4;
    const variants: OddImageVariant[] = [];
    const bag = [...pool];
    while (variants.length < variantTarget && bag.length > 0) {
      const pick = Math.floor(rand() * bag.length);
      const variant = bag.splice(pick, 1)[0];
      if (!variants.includes(variant)) variants.push(variant);
    }
    if (!variants.includes("color")) variants.push("color");
    questions.push({ values, oddIndex, variants, mutationSeed: Math.floor(rand() * 2_147_483_647) + 1 });
  }

  return questions;
}

export function countOddImageCorrect(questions: OddImageQuestion[], answers: number[]): number {
  return questions.reduce((count, question, index) => count + (answers[index] === question.oddIndex ? 1 : 0), 0);
}
