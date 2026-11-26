import { IMAGE_THEMES } from "@/lib/themes";
import { MEMORY_ORDER_LEVEL_ORDER, type MemoryOrderLevel } from "@/lib/memory-order";

export interface MemoryOrderCompletion {
  level: MemoryOrderLevel;
  themeId: string;
  elapsedSeconds: number;
  correct: number;
  questions: number;
  completedAt: string;
}

export interface MemoryOrderStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  totalTime: number;
  averageTime: number;
  bestTimes: Partial<Record<MemoryOrderLevel, number>>;
  bestScores: Partial<Record<MemoryOrderLevel, number>>;
  currentStreak: number;
  bestStreak: number;
  history: MemoryOrderCompletion[];
}

const STORAGE_PREFIX = "brain-games-memory-order-stats";
export const MEMORY_ORDER_STATS_UPDATED = "brain-games-memory-order-stats-updated";
const THEME_IDS = IMAGE_THEMES.map(({ id }) => id);

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

export function getMemoryOrderHistory(profileId?: number | null): MemoryOrderCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is MemoryOrderCompletion =>
      item && MEMORY_ORDER_LEVEL_ORDER.includes(item.level) &&
      Number.isFinite(item.elapsedSeconds) && Number.isFinite(item.correct) &&
      Number.isFinite(item.questions) && item.questions > 0 && typeof item.completedAt === "string",
    ).map((item) => ({ ...item, themeId: THEME_IDS.includes(item.themeId) ? item.themeId : "shapes" }));
  } catch {
    return [];
  }
}

export function recordMemoryOrderCompletion(
  profileId: number | null | undefined,
  level: MemoryOrderLevel,
  elapsedSeconds: number,
  correct: number,
  questions: number,
  themeId: string,
): void {
  const history = getMemoryOrderHistory(profileId);
  history.push({
    level,
    themeId: THEME_IDS.includes(themeId) ? themeId : "shapes",
    elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)),
    correct: Math.max(0, Math.floor(correct)),
    questions: Math.max(1, Math.floor(questions)),
    completedAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(MEMORY_ORDER_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

export function summarizeMemoryOrderStats(history: MemoryOrderCompletion[]): MemoryOrderStats {
  const bestTimes: MemoryOrderStats["bestTimes"] = {};
  const bestScores: MemoryOrderStats["bestScores"] = {};
  let totalCorrect = 0;
  let totalQuestions = 0;
  for (const game of history) {
    totalCorrect += game.correct;
    totalQuestions += game.questions;
    bestTimes[game.level] = Math.min(bestTimes[game.level] ?? Infinity, game.elapsedSeconds);
    bestScores[game.level] = Math.max(bestScores[game.level] ?? -Infinity, game.correct);
  }
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
  const totalTime = history.reduce((sum, game) => sum + game.elapsedSeconds, 0);
  return {
    totalGames: history.length,
    totalCorrect,
    totalQuestions,
    accuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    totalTime,
    averageTime: history.length ? Math.round(totalTime / history.length) : 0,
    bestTimes,
    bestScores,
    currentStreak,
    bestStreak,
    history,
  };
}
