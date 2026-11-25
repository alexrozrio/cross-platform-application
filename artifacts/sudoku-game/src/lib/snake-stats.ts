import type { SnakeDifficulty } from "@/lib/snake";

export interface SnakeCompletion {
  difficulty: SnakeDifficulty;
  foodsEaten: number;
  targetFoods: number;
  moves: number;
  elapsedSeconds: number;
  score: number;
  won: boolean;
  completedAt: string;
}

export interface SnakeStats {
  totalGames: number;
  wins: number;
  totalScore: number;
  bestScore: number;
  bestFoods: Partial<Record<SnakeDifficulty, number>>;
  bestTimes: Partial<Record<SnakeDifficulty, number>>;
  currentStreak: number;
  bestStreak: number;
  history: SnakeCompletion[];
}

const STORAGE_PREFIX = "brain-games-snake-stats";
export const SNAKE_STATS_UPDATED = "brain-games-snake-stats-updated";

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

const VALID_DIFFICULTIES = ["easy", "medium", "hard", "expert"];

export function getSnakeHistory(profileId?: number | null): SnakeCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SnakeCompletion =>
      item && VALID_DIFFICULTIES.includes(item.difficulty) &&
      Number.isFinite(item.elapsedSeconds) && Number.isFinite(item.score) &&
      Number.isFinite(item.foodsEaten) && typeof item.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordSnakeCompletion(
  profileId: number | null | undefined,
  difficulty: SnakeDifficulty,
  targetFoods: number,
  foodsEaten: number,
  moves: number,
  elapsedSeconds: number,
  score: number,
  won: boolean,
): void {
  const history = getSnakeHistory(profileId);
  history.push({
    difficulty,
    foodsEaten: Math.max(0, Math.floor(foodsEaten)),
    targetFoods: Math.max(0, Math.floor(targetFoods)),
    moves: Math.max(0, Math.floor(moves)),
    elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)),
    score: Math.max(0, Math.floor(score)),
    won,
    completedAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(SNAKE_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

export function summarizeSnakeStats(history: SnakeCompletion[]): SnakeStats {
  const bestTimes: SnakeStats["bestTimes"] = {};
  const bestFoods: SnakeStats["bestFoods"] = {};
  let bestScore = 0;
  for (const game of history) {
    bestScore = Math.max(bestScore, game.score);
    bestFoods[game.difficulty] = Math.max(bestFoods[game.difficulty] ?? 0, game.foodsEaten);
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
    bestFoods, bestTimes, currentStreak, bestStreak, history,
  };
}
