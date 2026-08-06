import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearch, Link } from "wouter";
import {
  useGetPlayerStats,
  useGetProfile,
  customFetch,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  TrendingUp,
  Zap,
  Clock,
  Hash,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Brain,
  Layers,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelCard } from "@/components/level-badge";
import { ShareAchievementButton } from "@/components/share-achievement";
import {
  ACHIEVEMENT_META,
  type AchievementsData,
} from "@/lib/achievement-utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─── Sudoku Streak Calendar ───────────────────────────────────────────────────

function StreakCalendar({ profileId }: { profileId: number }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const month = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;

  const { data: streakInfo } = useQuery({
    queryKey: [`/api/daily-challenge/streak/${profileId}`],
    queryFn: () =>
      customFetch<{
        currentStreak: number;
        longestStreak: number;
        completedToday: boolean;
      }>(`/api/daily-challenge/streak/${profileId}`),
    enabled: !!profileId,
  });

  const { data: historyData } = useQuery({
    queryKey: [`/api/daily-challenge/history/${profileId}`, month],
    queryFn: () =>
      customFetch<{ month: string; completedDates: string[] }>(
        `/api/daily-challenge/history/${profileId}?month=${month}`,
      ),
    enabled: !!profileId,
  });

  const completedSet = new Set(historyData?.completedDates ?? []);
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();
  const startWeekday = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  ).getDay();
  const todayStr = today.toISOString().slice(0, 10);
  const isPrevDisabled =
    viewDate <= new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const isNextDisabled =
    viewDate >= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <Card className="shadow-md border-orange-200/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" /> Daily Streak
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="text-xl font-black text-orange-500">
                {streakInfo?.currentStreak ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                streak
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-black text-primary">
                {streakInfo?.longestStreak ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                best
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
            disabled={isPrevDisabled}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </p>
          <button
            onClick={() =>
              setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
            disabled={isNextDisabled}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: startWeekday }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${month}-${String(day).padStart(2, "0")}`;
            const done = completedSet.has(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            return (
              <div
                key={day}
                title={done ? `Completed ${dateStr}` : undefined}
                className={[
                  "aspect-square flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done
                    ? "bg-orange-500 text-white"
                    : isToday
                      ? "ring-2 ring-orange-400 text-foreground"
                      : isFuture
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground",
                ].join(" ")}
              >
                {done ? "🔥" : day}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          {completedSet.size} day{completedSet.size !== 1 ? "s" : ""} completed
          this month
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Memory Match Activity Calendar ──────────────────────────────────────────

function MemoryStreakCalendar({ profileId }: { profileId: number }) {
  const now = new Date();
  // Use UTC throughout so calendar keys match the UTC date strings returned by the API
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth(); // 0-indexed
  const [viewYear, setViewYear] = useState(utcYear);
  const [viewMonth, setViewMonth] = useState(utcMonth); // 0-indexed
  const month = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const { data: streakInfo } = useQuery({
    queryKey: [`/api/memory-games/streak/${profileId}`],
    queryFn: () =>
      customFetch<{
        currentStreak: number;
        longestStreak: number;
        completedToday: boolean;
      }>(`/api/memory-games/streak/${profileId}`),
    enabled: !!profileId,
  });

  const { data: historyData } = useQuery({
    queryKey: [`/api/memory-games/history/${profileId}`, month],
    queryFn: () =>
      customFetch<{ month: string; completedDates: string[] }>(
        `/api/memory-games/history/${profileId}?month=${month}`,
      ),
    enabled: !!profileId,
  });

  const completedSet = new Set(historyData?.completedDates ?? []);
  // Use UTC date arithmetic for grid building so day keys are consistent with API strings
  const daysInMonth = new Date(
    Date.UTC(viewYear, viewMonth + 1, 0),
  ).getUTCDate();
  const startWeekday = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const todayStr = now.toISOString().slice(0, 10);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };
  const isPrevDisabled =
    viewYear < utcYear - 1 ||
    (viewYear === utcYear - 1 && viewMonth <= utcMonth);
  const isNextDisabled = viewYear === utcYear && viewMonth >= utcMonth;

  return (
    <Card className="shadow-md border-purple-200/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-500" /> Daily Streak
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="text-xl font-black text-purple-500">
                {streakInfo?.currentStreak ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                streak
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-black text-primary">
                {streakInfo?.longestStreak ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                best
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={isPrevDisabled}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button
            onClick={goNext}
            disabled={isNextDisabled}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: startWeekday }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${month}-${String(day).padStart(2, "0")}`;
            const done = completedSet.has(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            return (
              <div
                key={day}
                title={done ? `Played on ${dateStr}` : undefined}
                className={[
                  "aspect-square flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done
                    ? "bg-purple-500 text-white"
                    : isToday
                      ? "ring-2 ring-purple-400 text-foreground"
                      : isFuture
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground",
                ].join(" ")}
              >
                {done ? "🃏" : day}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          {completedSet.size} day{completedSet.size !== 1 ? "s" : ""} played
          this month
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Achievements Card ────────────────────────────────────────────────────────

// Derive the ordered group list from ACHIEVEMENT_META so new groups are picked up automatically
const ALL_GROUPS = Array.from(
  ACHIEVEMENT_META.reduce((acc, a) => {
    acc.add(a.group);
    return acc;
  }, new Set<string>()),
);

function AchievementsCard({
  profileId,
  game,
}: {
  profileId: number;
  game: "sudoku" | "memory";
}) {
  const { data } = useQuery({
    queryKey: [`/api/achievements/${profileId}`],
    queryFn: () =>
      customFetch<AchievementsData>(`/api/achievements/${profileId}`),
    enabled: !!profileId,
  });

  const isMemory = game === "memory";

  // Only the achievements that belong to this game
  const gameMeta = ACHIEVEMENT_META.filter((a) => a.game === game);
  const gameGroups = Array.from(
    gameMeta.reduce((acc, a) => {
      acc.add(a.group);
      return acc;
    }, new Set<string>()),
  );

  const unlockedCount = data
    ? gameMeta.filter((a) => data[a.id]?.unlocked).length
    : 0;

  return (
    <Card
      className={`shadow-md ${isMemory ? "border-purple-200/60 dark:border-purple-800/40" : "border-primary/10"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy
              className={`w-5 h-5 ${isMemory ? "text-purple-500" : "text-yellow-500"}`}
            />{" "}
            Achievements
          </CardTitle>
          <span className="text-sm text-muted-foreground font-semibold">
            {unlockedCount} / {gameMeta.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {gameGroups.map((group) => {
          const items = gameMeta.filter((a) => a.group === group);
          return (
            <div key={group}>
              <p
                className={`text-xs font-bold uppercase tracking-widest mb-3 ${isMemory ? "text-purple-500" : "text-muted-foreground"}`}
              >
                {group}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((a) => {
                  const status = data?.[a.id];
                  const unlocked = status?.unlocked ?? false;
                  const progress = status?.progress ?? 0;
                  const total = status?.total ?? 1;
                  const showBar = total > 1 && !unlocked;
                  return (
                    <div
                      key={a.id}
                      title={unlocked ? undefined : a.description}
                      className={[
                        "relative group rounded-xl p-3 flex flex-col gap-1.5 border transition-all",
                        unlocked
                          ? isMemory
                            ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200/60 shadow-sm"
                            : "bg-primary/5 border-primary/20 shadow-sm"
                          : "bg-muted/30 border-transparent opacity-50",
                      ].join(" ")}
                    >
                      {unlocked && (
                        <ShareAchievementButton achievement={a} variant="icon" profileId={profileId} />
                      )}
                      <span
                        className={`text-2xl ${unlocked ? "" : "grayscale"}`}
                      >
                        {a.emoji}
                      </span>
                      <p
                        className={`text-xs font-bold leading-tight ${unlocked ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {a.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        {a.description}
                      </p>
                      {showBar && (
                        <div className="mt-1">
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isMemory ? "bg-purple-400/60" : "bg-primary/50"}`}
                              style={{
                                width: `${Math.round((progress / total) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {progress} / {total}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Main Stats Page ──────────────────────────────────────────────────────────

type GameMode = "sudoku" | "memory";

export default function Stats() {
  const { profileId } = useAuth();
  const search = useSearch();
  const tabParam = new URLSearchParams(search).get("tab");
  const [mode, setMode] = useState<GameMode>(
    tabParam === "memory" ? "memory" : "sudoku",
  );

  // Sync tab if the URL param changes (e.g. from the achievement modal link)
  useEffect(() => {
    if (tabParam === "memory") setMode("memory");
    else if (tabParam === "sudoku") setMode("sudoku");
  }, [tabParam]);
  const { data: stats, isLoading } = useGetPlayerStats(profileId as number, {
    query: { enabled: !!profileId },
  });
  const { data: profile } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });

  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Play some games to see your stats!
      </div>
    );
  }

  const mem = stats.memory;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-3 bg-card rounded-2xl px-5 py-4 border border-border">
        <div className="space-y-0.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight leading-tight">
            Your Statistics
          </h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Track your puzzle-solving journey.
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Link
            href="/sudoku"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Play </span>Sudoku
          </Link>
          <Link
            href="/memory"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Play </span>Memory
          </Link>
        </div>
      </div>

      {profile && <LevelCard xp={profile.xp ?? 0} />}

      {/* Game mode tabs */}
      <div className="flex rounded-xl border bg-muted/40 p-1 gap-1">
        <button
          onClick={() => setMode("sudoku")}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
            mode === "sudoku"
              ? "bg-white dark:bg-card shadow text-orange-600 border border-orange-200/60"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Hash className="w-4 h-4" />
          Sudoku
        </button>
        <button
          onClick={() => setMode("memory")}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
            mode === "memory"
              ? "bg-white dark:bg-card shadow text-purple-600 border border-purple-200/60"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Brain className="w-4 h-4" />
          Memory Match
        </button>
      </div>

      {/* ── SUDOKU SECTION ─────────────────────────────────────────── */}
      {mode === "sudoku" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {profileId && <StreakCalendar profileId={profileId} />}

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-primary/10 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Hash className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-primary/10 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-green-100 text-green-700 rounded-full">
                  <Target className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((stats.winRate || 0) * 100)}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-primary/10 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-orange-100 text-orange-700 rounded-full">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Win Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-primary/10 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Total Wins</p>
                <p className="text-2xl font-bold">{stats.totalWins}</p>
              </CardContent>
            </Card>
          </div>

          {/* Best times by grid size + difficulty */}
          <Card className="shadow-md border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Best Times by Grid &amp; Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {(() => {
                const GRID_SIZES = [9, 4, 6, 16, 3] as const;
                const GRID_LABELS: Record<number, string> = { 3: "3×3", 4: "4×4", 6: "6×6", 9: "9×9", 16: "16×16" };
                const DIFFS = ["easy", "medium", "hard", "expert"] as const;
                const activeGridSizes = GRID_SIZES.filter((size) =>
                  DIFFS.some((diff) => (stats.bestTimes?.[`${size}-${diff}`] ?? null) !== null)
                );
                if (activeGridSizes.length === 0) {
                  return <p className="text-sm text-muted-foreground text-center py-4">No completed games yet.</p>;
                }
                return activeGridSizes.map((size) => (
                  <div key={size} className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {GRID_LABELS[size]}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {DIFFS.map((diff) => (
                        <div key={diff} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/60">
                          <span className="capitalize font-medium text-sm">{diff}</span>
                          <span className="font-mono text-base font-bold text-primary">
                            {formatTime(stats.bestTimes?.[`${size}-${diff}`])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                <span className="shrink-0 mt-px">ℹ️</span>
                <span>
                  Only difficulties available in your current <strong>Game Mode</strong> are unlocked for play.
                  <em> Kids</em> mode shows Easy &amp; Medium; <em>Adult</em> shows Hard &amp; Expert; <em>4 All</em> shows everything.
                </span>
              </p>
              {stats.averageTime != null && (
                <div className="flex justify-between items-center p-4 rounded-lg bg-card border border-border">
                  <span className="font-medium text-sm">Avg. Completion Time</span>
                  <span className="font-mono text-lg font-bold text-primary">
                    {formatTime(stats.averageTime)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <AchievementsCard profileId={profileId!} game="sudoku" />
        </div>
      )}

      {/* ── MEMORY MATCH SECTION ───────────────────────────────────── */}
      {mode === "memory" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {profileId && <MemoryStreakCalendar profileId={profileId} />}

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-purple-100 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <Layers className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{mem?.totalGames ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-purple-100 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-green-100 text-green-700 rounded-full">
                  <Target className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Complete Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((mem?.winRate || 0) * 100)}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-purple-100 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-full">
                  <Flame className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Daily Streak</p>
                <p className="text-2xl font-bold">{mem?.currentStreak ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-purple-100 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold">{mem?.longestStreak ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Best times by grid size */}
          <Card className="shadow-md border-purple-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" /> Best Times by Grid
                Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {([2, 4, 6, 8] as const).map((size) => (
                  <div
                    key={size}
                    className="flex justify-between items-center p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <span className="font-medium">
                        {size}×{size} Grid
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({(size * size) / 2} pairs)
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-purple-600">
                      {formatTime(mem?.bestTimes?.[String(size)])}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 flex items-start gap-1.5 leading-relaxed">
                <span className="shrink-0 mt-px">ℹ️</span>
                <span>
                  Grid sizes available depend on your <strong>Game Mode</strong>.
                  <em> Kids</em> unlocks 4 &amp; 8 pairs; <em>Adult</em> unlocks 16 &amp; 32 pairs; <em>4 All</em> unlocks every size.
                  You can change your mode anytime in Profile.
                </span>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {mem?.averageTime != null && (
                  <div className="flex justify-between items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <span className="font-medium text-sm">Avg. Time</span>
                    <span className="font-mono text-lg font-bold text-purple-600">
                      {formatTime(mem.averageTime)}
                    </span>
                  </div>
                )}
                {mem?.averageFlips != null && (
                  <div className="flex justify-between items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <span className="font-medium text-sm">Avg. Flips</span>
                    <span className="font-mono text-lg font-bold text-purple-600">
                      {mem.averageFlips}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <AchievementsCard profileId={profileId!} game="memory" />
        </div>
      )}
    </div>
  );
}
