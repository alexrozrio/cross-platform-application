import type { Game2048Difficulty } from "@/lib/game-2048";

export interface Game2048Completion {
  difficulty: Game2048Difficulty;
  size: number;
  elapsedSeconds: number;
  moves: number;
  score: number;
  maxTile: number;
  won: boolean;
  completedAt: string;
}

export interface Game2048Stats {
  totalGames: number;
  wins: number;
  totalScore: number;
  bestScore: number;
  bestTimes: Partial<Record<Game2048Difficulty, number>>;
  bestTiles: Partial<Record<Game2048Difficulty, number>>;
  currentStreak: number;
  bestStreak: number;
  history: Game2048Completion[];
}

const STORAGE_PREFIX = "brain-games-2048-stats";
export const GAME_2048_STATS_UPDATED = "brain-games-2048-stats-updated";

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

const VALID_SIZES = [3, 4, 5, 6];

export function getGame2048History(profileId?: number | null): Game2048Completion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Game2048Completion =>
      item && VALID_SIZES.includes(item.size) &&
      Number.isFinite(item.elapsedSeconds) && Number.isFinite(item.score) &&
      Number.isFinite(item.maxTile) && typeof item.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordGame2048Completion(
  profileId: number | null | undefined,
  difficulty: Game2048Difficulty,
  size: number,
  elapsedSeconds: number,
  moves: number,
  score: number,
  maxTile: number,
  won: boolean,
): void {
  const history = getGame2048History(profileId);
  history.push({
    difficulty, size,
    elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)),
    moves: Math.max(0, Math.floor(moves)),
    score: Math.max(0, Math.floor(score)),
    maxTile: Math.max(0, Math.floor(maxTile)),
    won,
    completedAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(GAME_2048_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

export function summarizeGame2048Stats(history: Game2048Completion[]): Game2048Stats {
  const bestTimes: Game2048Stats["bestTimes"] = {};
  const bestTiles: Game2048Stats["bestTiles"] = {};
  let bestScore = 0;
  for (const game of history) {
    bestScore = Math.max(bestScore, game.score);
    bestTiles[game.difficulty] = Math.max(bestTiles[game.difficulty] ?? 0, game.maxTile);
    if (game.won) bestTimes[game.difficulty] = Math.min(bestTimes[game.difficulty] ?? Infinity, game.elapsedSeconds);
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
  return {
    totalGames: history.length,
    wins: history.filter((g) => g.won).length,
    totalScore: history.reduce((sum, g) => sum + g.score, 0),
    bestScore,
    bestTimes, bestTiles, currentStreak, bestStreak, history,
  };
}
