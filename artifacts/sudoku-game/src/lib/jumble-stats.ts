import type { JumbleDifficulty } from "@/lib/jumble-words";

export interface JumbleCompletion {
  difficulty: JumbleDifficulty;
  questions: number;
  correct: number;
  wrongAttempts: number;
  elapsedSeconds: number;
  score: number;
  won: boolean;
  completedAt: string;
}

export interface JumbleStats {
  totalGames: number;
  wins: number;
  totalScore: number;
  bestScore: number;
  bestTimes: Partial<Record<JumbleDifficulty, number>>;
  bestAccuracy: Partial<Record<JumbleDifficulty, number>>;
  currentStreak: number;
  bestStreak: number;
  history: JumbleCompletion[];
}

const STORAGE_PREFIX = "brain-games-jumble-stats";
export const JUMBLE_STATS_UPDATED = "brain-games-jumble-stats-updated";

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

const VALID_DIFFICULTIES = ["easy", "medium", "hard", "expert"];

export function getJumbleHistory(profileId?: number | null): JumbleCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is JumbleCompletion =>
      item && VALID_DIFFICULTIES.includes(item.difficulty) &&
      Number.isFinite(item.elapsedSeconds) && Number.isFinite(item.score) &&
      Number.isFinite(item.correct) && typeof item.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordJumbleCompletion(
  profileId: number | null | undefined,
  difficulty: JumbleDifficulty,
  questions: number,
  correct: number,
  wrongAttempts: number,
  elapsedSeconds: number,
  score: number,
  won: boolean,
): void {
  const history = getJumbleHistory(profileId);
  history.push({
    difficulty, questions,
    correct: Math.max(0, Math.floor(correct)),
    wrongAttempts: Math.max(0, Math.floor(wrongAttempts)),
    elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)),
    score: Math.max(0, Math.floor(score)),
    won,
    completedAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(JUMBLE_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* Local statistics are best-effort when browser storage is disabled. */ }
}

export function summarizeJumbleStats(history: JumbleCompletion[]): JumbleStats {
  const bestTimes: JumbleStats["bestTimes"] = {};
  const bestAccuracy: JumbleStats["bestAccuracy"] = {};
  let bestScore = 0;
  for (const game of history) {
    bestScore = Math.max(bestScore, game.score);
    const accuracy = game.questions > 0 ? game.correct / game.questions : 0;
    bestAccuracy[game.difficulty] = Math.max(bestAccuracy[game.difficulty] ?? 0, accuracy);
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
    bestTimes, bestAccuracy, currentStreak, bestStreak, history,
  };
}
