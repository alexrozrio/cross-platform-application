import {
  dailyQuizConfig as sharedDailyQuizConfig,
  pickQuestions as sharedPickQuestions,
  QUIZ_BANKS,
  type QuizLevel,
  type QuizQuestion,
  type QuizSubject,
} from "@workspace/api-zod/quiz";

export type { QuizLevel, QuizQuestion, QuizSubject };

export interface QuizLevelConfig {
  label: string;
  detail: string;
  /** Number of questions in a round at this level. */
  questions: number;
  mode: "baby" | "adult";
  parSeconds: number;
  basePoints: number;
  xp: number;
  gems: number;
}

/** Per-subject accent classes so each quiz game has its own visual identity. */
export interface QuizTheme {
  /** Primary button classes (bg + hover + text). */
  btn: string;
  /** Accent text color. */
  text: string;
  /** Accent border (light + dark). */
  border: string;
  /** Soft tinted chip/icon background. */
  soft: string;
  /** Progress bar / highlight fill. */
  fill: string;
  /** Stronger accent text with dark variant (scores, headings). */
  strong: string;
  /** Interactive hover border + background. */
  hover: string;
  /** Hex accent for share cards. */
  hex: string;
  /** Tinted row background for "me" highlight on leaderboards. */
  row: string;
  /** Unlocked achievement card background + border + shadow. */
  tint: string;
  /** Progress bar fill at 60% opacity. */
  fillSoft: string;
}

export interface QuizSubjectConfig {
  id: QuizSubject;
  name: string;
  /** Short display name without the "Quiz" suffix. */
  shortName: string;
  /** Emoji shown on cards and in-game. */
  emoji: string;
  /** One-line description shown on portal cards. */
  tagline: string;
  /** Tailwind gradient classes for the card/accent (light mode). */
  gradient: string;
  /** Dark-mode gradient overrides (dark: prefixed classes). */
  gradientDark: string;
  accent: string;
  theme: QuizTheme;
  levels: Record<QuizLevel, QuizLevelConfig>;
  bank: Record<QuizLevel, QuizQuestion[]>;
}

const EMPTY_BANK: Record<QuizLevel, QuizQuestion[]> = { easy: [], medium: [], hard: [], expert: [] };
const bankFor = (id: QuizSubject) => QUIZ_BANKS[id] ?? EMPTY_BANK;

export const QUIZ_LEVELS: QuizLevel[] = ["easy", "medium", "hard", "expert"];

export const QUIZ_SUBJECTS: Record<QuizSubject, QuizSubjectConfig> = {
  science: {
    id: "science",
    name: "Science Quiz",
    shortName: "Science",
    emoji: "🔬",
    tagline: "Planets, elements & living things",
    gradient: "from-violet-100 via-purple-50 to-fuchsia-100",
    gradientDark: "dark:from-violet-950/40 dark:to-fuchsia-950/30",
    accent: "violet",
    theme: {
      btn: "bg-violet-600 text-white hover:bg-violet-700",
      text: "text-violet-600",
      border: "border-violet-200 dark:border-violet-800",
      soft: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
      fill: "bg-violet-500",
      strong: "text-violet-700 dark:text-violet-300",
      hover: "hover:border-violet-400 hover:bg-violet-500/5",
      hex: "#7c3aed",
      row: "bg-violet-50/70 hover:bg-violet-50 dark:bg-violet-950/20",
      tint: "bg-violet-50 dark:bg-violet-950/20 border-violet-200/60 shadow-sm",
      fillSoft: "bg-violet-500/60",
    },
    levels: {
      easy:   { label: "Easy",   detail: "5 questions",  questions: 5,  mode: "baby",  parSeconds: 120, basePoints: 150,  xp: 1, gems: 1 },
      medium: { label: "Medium", detail: "8 questions",  questions: 8,  mode: "baby",  parSeconds: 180, basePoints: 300,  xp: 1, gems: 2 },
      hard:   { label: "Hard",   detail: "10 questions", questions: 10, mode: "adult", parSeconds: 240, basePoints: 600,  xp: 2, gems: 3 },
      expert: { label: "Expert", detail: "12 questions", questions: 12, mode: "adult", parSeconds: 300, basePoints: 1200, xp: 3, gems: 4 },
    },
    bank: bankFor("science"),
  },
  // maths and gk slots are added with their question banks.
  maths: {
    id: "maths",
    name: "Maths Quiz",
    shortName: "Maths",
    emoji: "🔢",
    tagline: "Numbers, shapes & logic puzzles",
    gradient: "from-sky-100 via-cyan-50 to-blue-100",
    gradientDark: "dark:from-sky-950/40 dark:to-blue-950/30",
    accent: "sky",
    theme: {
      btn: "bg-sky-600 text-white hover:bg-sky-700",
      text: "text-sky-600",
      border: "border-sky-200 dark:border-sky-800",
      soft: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
      fill: "bg-sky-500",
      strong: "text-sky-700 dark:text-sky-300",
      hover: "hover:border-sky-400 hover:bg-sky-500/5",
      hex: "#0284c7",
      row: "bg-sky-50/70 hover:bg-sky-50 dark:bg-sky-950/20",
      tint: "bg-sky-50 dark:bg-sky-950/20 border-sky-200/60 shadow-sm",
      fillSoft: "bg-sky-500/60",
    },
    levels: {
      easy:   { label: "Easy",   detail: "5 questions",  questions: 5,  mode: "baby",  parSeconds: 120, basePoints: 150,  xp: 1, gems: 1 },
      medium: { label: "Medium", detail: "8 questions",  questions: 8,  mode: "baby",  parSeconds: 180, basePoints: 300,  xp: 1, gems: 2 },
      hard:   { label: "Hard",   detail: "10 questions", questions: 10, mode: "adult", parSeconds: 240, basePoints: 600,  xp: 2, gems: 3 },
      expert: { label: "Expert", detail: "12 questions", questions: 12, mode: "adult", parSeconds: 300, basePoints: 1200, xp: 3, gems: 4 },
    },
    bank: bankFor("maths"),
  },
  gk: {
    id: "gk",
    name: "GK Quiz",
    shortName: "GK",
    emoji: "🌍",
    tagline: "Countries, history & world facts",
    gradient: "from-amber-100 via-orange-50 to-yellow-100",
    gradientDark: "dark:from-amber-950/40 dark:to-yellow-950/30",
    accent: "amber",
    theme: {
      btn: "bg-amber-500 text-white hover:bg-amber-600",
      text: "text-amber-600",
      border: "border-amber-200 dark:border-amber-800",
      soft: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
      fill: "bg-amber-500",
      strong: "text-amber-700 dark:text-amber-300",
      hover: "hover:border-amber-400 hover:bg-amber-500/5",
      hex: "#d97706",
      row: "bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-950/20",
      tint: "bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 shadow-sm",
      fillSoft: "bg-amber-500/60",
    },
    levels: {
      easy:   { label: "Easy",   detail: "5 questions",  questions: 5,  mode: "baby",  parSeconds: 120, basePoints: 150,  xp: 1, gems: 1 },
      medium: { label: "Medium", detail: "8 questions",  questions: 8,  mode: "baby",  parSeconds: 180, basePoints: 300,  xp: 1, gems: 2 },
      hard:   { label: "Hard",   detail: "10 questions", questions: 10, mode: "adult", parSeconds: 240, basePoints: 600,  xp: 2, gems: 3 },
      expert: { label: "Expert", detail: "12 questions", questions: 12, mode: "adult", parSeconds: 300, basePoints: 1200, xp: 3, gems: 4 },
    },
    bank: bankFor("gk"),
  },
};

export function quizSubject(id: string | null | undefined): QuizSubjectConfig {
  return QUIZ_SUBJECTS[(id as QuizSubject) in QUIZ_SUBJECTS ? (id as QuizSubject) : "science"];
}

export function isQuizSubject(id: string | null | undefined): id is QuizSubject {
  return typeof id === "string" && id in QUIZ_SUBJECTS;
}

export function isQuizLevel(id: string | null | undefined): id is QuizLevel {
  return typeof id === "string" && (QUIZ_LEVELS as string[]).includes(id);
}

/** Each quiz subject is surfaced as its own game across profile, challenges,
 *  leaderboards, and achievements ("science-quiz" | "maths-quiz" | "gk-quiz"). */
export type QuizGameId = "science-quiz" | "maths-quiz" | "gk-quiz";

export function quizGameId(subject: QuizSubject): QuizGameId {
  return `${subject}-quiz` as QuizGameId;
}

export function quizSubjectForGameId(id: string | null | undefined): QuizSubject | null {
  if (typeof id !== "string" || !id.endsWith("-quiz")) return null;
  const subject = id.slice(0, -"-quiz".length);
  return subject in QUIZ_SUBJECTS ? (subject as QuizSubject) : null;
}

/** Deterministic question pick: same seed → same questions, same order.
 *  Shared with the API server (@workspace/api-zod/quiz) for answer validation. */
export const pickQuestions = sharedPickQuestions;

/** Today's daily quiz config: fixed level + fixed question set per subject. */
export function dailyQuizConfig(subject: QuizSubjectConfig, date: string) {
  const shared = sharedDailyQuizConfig(subject.id, date);
  return { ...shared, questions: subject.levels[shared.level].questions };
}

/** Resolve the actual questions for a daily config. */
export function dailyQuizQuestions(subject: QuizSubjectConfig, config: { level: QuizLevel; questions: number; seed: number }): QuizQuestion[] {
  return pickQuestions(subject.bank[config.level], config.questions, config.seed);
}

export const QUIZ_SAVE_KEY = "brain-games-quiz-session";
