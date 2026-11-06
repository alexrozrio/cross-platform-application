import { WORD_SEARCH_THEMES, type WordSearchDifficulty, type WordSearchTheme } from "@/lib/word-search";

export interface WordSearchCompletion {
  difficulty: WordSearchDifficulty;
  theme: WordSearchTheme;
  elapsedSeconds: number;
  completedAt: string;
}

export interface WordSearchStats {
  totalGames: number;
  totalTime: number;
  averageTime: number;
  bestTimes: Partial<Record<WordSearchDifficulty, number>>;
  currentStreak: number;
  bestStreak: number;
  history: WordSearchCompletion[];
}

const STORAGE_PREFIX = "brain-games-word-search-stats";
export const WORD_SEARCH_STATS_UPDATED = "brain-games-word-search-stats-updated";
const WORD_SEARCH_THEME_IDS = WORD_SEARCH_THEMES.map(({ id }) => id);

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

export function getWordSearchHistory(profileId?: number | null): WordSearchCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is WordSearchCompletion =>
      item && ["beginner", "easy", "medium", "hard"].includes(item.difficulty) &&
      Number.isFinite(item.elapsedSeconds) && typeof item.completedAt === "string",
    ).map((item) => ({ ...item, theme: WORD_SEARCH_THEME_IDS.includes(item.theme) ? item.theme : "animals" }));
  } catch {
    return [];
  }
}

export function recordWordSearchCompletion(
  profileId: number | null | undefined,
  difficulty: WordSearchDifficulty,
  elapsedSeconds: number,
  theme: WordSearchTheme,
): void {
  const history = getWordSearchHistory(profileId);
  history.push({ difficulty, theme, elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)), completedAt: new Date().toISOString() });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(WORD_SEARCH_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

export function summarizeWordSearchStats(history: WordSearchCompletion[]): WordSearchStats {
  const bestTimes: WordSearchStats["bestTimes"] = {};
  for (const game of history) bestTimes[game.difficulty] = Math.min(bestTimes[game.difficulty] ?? Infinity, game.elapsedSeconds);
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
  return { totalGames: history.length, totalTime, averageTime: history.length ? Math.round(totalTime / history.length) : 0, bestTimes, currentStreak, bestStreak, history };
}
