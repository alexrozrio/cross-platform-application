import type { SlidePuzzleDifficulty, SlidePuzzleTileStyle } from "@/lib/slide-puzzle";

export interface SlidePuzzleCompletion {
  difficulty: SlidePuzzleDifficulty;
  tileStyle: SlidePuzzleTileStyle;
  elapsedSeconds: number;
  moves: number;
  completedAt: string;
}

export interface SlidePuzzleStats {
  totalGames: number;
  totalTime: number;
  averageTime: number;
  bestTimes: Partial<Record<SlidePuzzleDifficulty, number>>;
  currentStreak: number;
  bestStreak: number;
  history: SlidePuzzleCompletion[];
}

const STORAGE_PREFIX = "brain-games-slide-puzzle-stats";
export const SLIDE_PUZZLE_STATS_UPDATED = "brain-games-slide-puzzle-stats-updated";

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

export function getSlidePuzzleHistory(profileId?: number | null): SlidePuzzleCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SlidePuzzleCompletion =>
      item && ["2x2", "3x3", "4x4", "5x5"].includes(item.difficulty) &&
      Number.isFinite(item.elapsedSeconds) && typeof item.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordSlidePuzzleCompletion(
  profileId: number | null | undefined,
  difficulty: SlidePuzzleDifficulty,
  tileStyle: SlidePuzzleTileStyle,
  elapsedSeconds: number,
  moves: number,
): void {
  const history = getSlidePuzzleHistory(profileId);
  history.push({ difficulty, tileStyle, elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)), moves: Math.max(0, Math.floor(moves)), completedAt: new Date().toISOString() });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(SLIDE_PUZZLE_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

export function summarizeSlidePuzzleStats(history: SlidePuzzleCompletion[]): SlidePuzzleStats {
  const bestTimes: SlidePuzzleStats["bestTimes"] = {};
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
