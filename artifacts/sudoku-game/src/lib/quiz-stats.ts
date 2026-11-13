import type { QuizLevel, QuizSubject } from "@/lib/quiz";

export interface QuizCompletion {
  subject: QuizSubject;
  level: QuizLevel;
  correct: number;
  questions: number;
  points: number;
  elapsedSeconds: number;
  completedAt: string;
}

export interface QuizStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  bestPoints: number;
  bestAccuracy: number;
  currentStreak: number;
  bestStreak: number;
  history: QuizCompletion[];
}

const STORAGE_PREFIX = "brain-games-quiz-stats";
export const QUIZ_STATS_UPDATED = "brain-games-quiz-stats-updated";

function key(profileId?: number | null, subject?: QuizSubject) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}:${subject ?? "all"}`;
}

export function getQuizHistory(profileId: number | null | undefined, subject?: QuizSubject): QuizCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId, subject)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is QuizCompletion =>
      item && typeof item.subject === "string" && typeof item.level === "string" &&
      Number.isFinite(item.correct) && Number.isFinite(item.questions) &&
      Number.isFinite(item.points) && typeof item.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordQuizCompletion(
  profileId: number | null | undefined,
  subject: QuizSubject,
  level: QuizLevel,
  correct: number,
  questions: number,
  points: number,
  elapsedSeconds: number,
): void {
  const history = getQuizHistory(profileId, subject);
  history.push({ subject, level, correct, questions, points, elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)), completedAt: new Date().toISOString() });
  try {
    localStorage.setItem(key(profileId, subject), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(QUIZ_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

/** Fill in the server-computed points on the most recent completion. */
export function patchLastQuizPoints(
  profileId: number | null | undefined,
  subject: QuizSubject,
  points: number,
): void {
  try {
    const history = getQuizHistory(profileId, subject);
    if (!history.length) return;
    history[history.length - 1] = { ...history[history.length - 1], points };
    localStorage.setItem(key(profileId, subject), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(QUIZ_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* best-effort */ }
}

export function summarizeQuizStats(history: QuizCompletion[]): QuizStats {
  const totalCorrect = history.reduce((sum, game) => sum + game.correct, 0);
  const totalQuestions = history.reduce((sum, game) => sum + game.questions, 0);
  const days = [...new Set(history.map((game) => game.completedAt.slice(0, 10)))].sort();
  let bestStreak = 0, streak = 0, previous: Date | null = null;
  for (const day of days) {
    const date = new Date(`${day}T00:00:00Z`);
    streak = previous && (date.getTime() - previous.getTime()) / 86400000 === 1 ? streak + 1 : 1;
    bestStreak = Math.max(bestStreak, streak);
    previous = date;
  }
  let currentStreak = 0;
  if (days.length) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastDay = days[days.length - 1];
    if (lastDay === today || lastDay === yesterday) {
      currentStreak = 1;
      for (let i = days.length - 1; i > 0; i--) {
        if ((new Date(`${days[i]}T00:00:00Z`).getTime() - new Date(`${days[i - 1]}T00:00:00Z`).getTime()) / 86400000 !== 1) break;
        currentStreak++;
      }
    }
  }
  return {
    totalGames: history.length,
    totalCorrect,
    totalQuestions,
    bestPoints: history.reduce((best, game) => Math.max(best, game.points), 0),
    bestAccuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    currentStreak,
    bestStreak,
    history,
  };
}
