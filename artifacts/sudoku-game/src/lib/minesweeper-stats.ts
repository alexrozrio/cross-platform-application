import type { MinesweeperDifficulty } from "@/lib/minesweeper";

export interface MinesweeperCompletion {
  difficulty: MinesweeperDifficulty;
  elapsedSeconds: number;
  mistakes: number;
  completedAt: string;
}

export interface MinesweeperStats {
  totalGames: number;
  totalTime: number;
  averageTime: number;
  bestTimes: Partial<Record<MinesweeperDifficulty, number>>;
  currentStreak: number;
  bestStreak: number;
  history: MinesweeperCompletion[];
}

const STORAGE_PREFIX = "brain-games-minesweeper-stats";
export const MINESWEEPER_STATS_UPDATED = "brain-games-minesweeper-stats-updated";

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

export function getMinesweeperHistory(profileId?: number | null): MinesweeperCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is MinesweeperCompletion =>
      item && ["beginner", "easy", "medium", "hard"].includes(item.difficulty) &&
      Number.isFinite(item.elapsedSeconds) && typeof item.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordMinesweeperCompletion(
  profileId: number | null | undefined,
  difficulty: MinesweeperDifficulty,
  elapsedSeconds: number,
  mistakes: number,
): void {
  const history = getMinesweeperHistory(profileId);
  history.push({ difficulty, elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)), mistakes: Math.max(0, Math.floor(mistakes)), completedAt: new Date().toISOString() });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(MINESWEEPER_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

export function summarizeMinesweeperStats(history: MinesweeperCompletion[]): MinesweeperStats {
  const bestTimes: MinesweeperStats["bestTimes"] = {};
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
