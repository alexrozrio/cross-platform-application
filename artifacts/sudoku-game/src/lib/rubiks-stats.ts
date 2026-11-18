import type { RubiksPuzzle } from "@/lib/rubiks";

export interface RubiksCompletion {
  puzzle: RubiksPuzzle;
  elapsedSeconds: number;
  moves: number;
  points: number;
  completedAt: string;
}

export interface RubiksStats {
  totalGames: number;
  bestTimes: Partial<Record<RubiksPuzzle, number>>;
  bestPoints: Partial<Record<RubiksPuzzle, number>>;
  currentStreak: number;
  bestStreak: number;
  history: RubiksCompletion[];
}

const STORAGE_PREFIX = "brain-games-rubiks-stats";
export const RUBIKS_STATS_UPDATED = "brain-games-rubiks-stats-updated";

function key(profileId?: number | null) {
  return `${STORAGE_PREFIX}:${profileId ?? "guest"}`;
}

export function getRubiksHistory(profileId?: number | null): RubiksCompletion[] {
  try {
    const value = JSON.parse(localStorage.getItem(key(profileId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is RubiksCompletion =>
      item && ["2x2", "3x3", "pyraminx", "4x4"].includes(item.puzzle) &&
      Number.isFinite(item.elapsedSeconds) && typeof item.completedAt === "string",
    );
  } catch {
    return [];
  }
}

export function recordRubiksCompletion(
  profileId: number | null | undefined,
  puzzle: RubiksPuzzle,
  elapsedSeconds: number,
  moves: number,
  points: number,
): void {
  const history = getRubiksHistory(profileId);
  history.push({ puzzle, elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)), moves: Math.max(0, Math.floor(moves)), points: Math.max(0, Math.floor(points)), completedAt: new Date().toISOString() });
  try {
    localStorage.setItem(key(profileId), JSON.stringify(history.slice(-500)));
    window.dispatchEvent(new CustomEvent(RUBIKS_STATS_UPDATED, { detail: profileId ?? null }));
  } catch { /* best-effort */ }
}

export function summarizeRubiksStats(history: RubiksCompletion[]): RubiksStats {
  const bestTimes: RubiksStats["bestTimes"] = {};
  const bestPoints: RubiksStats["bestPoints"] = {};
  for (const g of history) {
    bestTimes[g.puzzle] = Math.min(bestTimes[g.puzzle] ?? Infinity, g.elapsedSeconds);
    bestPoints[g.puzzle] = Math.max(bestPoints[g.puzzle] ?? 0, g.points);
  }
  const days = [...new Set(history.map((g) => g.completedAt.slice(0, 10)))].sort();
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
  return { totalGames: history.length, bestTimes, bestPoints, currentStreak, bestStreak, history };
}

// In-progress game persisted for "Resume" — local only (server game stays active).
const ACTIVE_KEY = "brain-games-rubiks-active";
export interface ActiveRubiksGame { gameId: number; puzzle: RubiksPuzzle; scrambleSeed: number; startedAt: number }
export function saveActiveRubiksGame(g: ActiveRubiksGame | null, profileId?: number | null) {
  try {
    if (!g) localStorage.removeItem(`${ACTIVE_KEY}:${profileId ?? "guest"}`);
    else localStorage.setItem(`${ACTIVE_KEY}:${profileId ?? "guest"}`, JSON.stringify(g));
  } catch { /* ignore */ }
}
export function getActiveRubiksGame(profileId?: number | null): ActiveRubiksGame | null {
  try {
    const v = JSON.parse(localStorage.getItem(`${ACTIVE_KEY}:${profileId ?? "guest"}`) ?? "null");
    return v && typeof v.gameId === "number" ? v : null;
  } catch { return null; }
}
