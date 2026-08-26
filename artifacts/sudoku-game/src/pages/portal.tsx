import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useImageTheme } from "@/hooks/use-image-theme";
import { ThemeIcon } from "@/components/theme-icons";
import { Badge } from "@/components/ui/badge";
import {
  Grid3x2 as Grid3X3,
  Sparkles,
  Loader as Loader2,
  RotateCcw,
  Flame,
} from "lucide-react";
import { customFetch, useGetProfile } from "@workspace/api-client-react";
import { generateOfflinePuzzle } from "@/lib/sudoku-generator";
import { getLevelFromXp } from "@/lib/levels";
import { getTheme } from "@/lib/themes";
import { sudokuGamePath } from "@/lib/sudoku-routes";

interface ActiveGame {
  id: number;
  puzzle?: { gridSize: number; difficulty: string };
  mistakeCount: number;
}

interface MemorySession {
  gridSize: number;
  flips: number;
  elapsed: number;
  savedAt: number;
  cards: { matched: boolean }[];
}

const COMING_SOON = [
  {
    title: "Word Search",
    description: "Find hidden words in a letter grid",
    icon: "🔤",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-200/60",
  },
  {
    title: "Minesweeper",
    description: "Clear the field without hitting mines",
    icon: "💣",
    color: "from-rose-500/20 to-orange-500/20 border-rose-200/60",
  },
];

const GRID_QUICK_START = [
  { size: 3, label: "3×3", sublabel: "Baby" },
  { size: 4, label: "4×4", sublabel: "Mini" },
  { size: 6, label: "6×6", sublabel: "Dual" },
  { size: 9, label: "9×9", sublabel: "Classic" },
  { size: 16, label: "16×16", sublabel: "Pro" },
];

export default function Portal() {
  const [, setLocation] = useLocation();
  const { profileId, isReady } = useAuth();
  const { themeId } = useImageTheme();
  const [loadingSize, setLoadingSize] = useState<number | null>(null);

  const { data: profile } = useGetProfile(profileId as number);

  const gameMode = (profile?.gameMode ?? "4all") as
    | "children"
    | "adult"
    | "4all";

  const visibleSudokuSizes = GRID_QUICK_START.filter((opt) =>
    gameMode === "children"
      ? [3, 4, 6].includes(opt.size)
      : gameMode === "adult"
        ? [9, 16].includes(opt.size)
        : true,
  );

  const ALL_MEMORY_OPTIONS = [
    { size: 2, label: "2×4", sub: "4 pairs" },
    { size: 4, label: "4×4", sub: "8 pairs" },
    { size: 6, label: "4×8", sub: "16 pairs" },
    { size: 8, label: "8×8", sub: "32 pairs" },
  ];
  const visibleMemoryOptions = ALL_MEMORY_OPTIONS.filter((opt) =>
    gameMode === "children"
      ? [2, 4].includes(opt.size)
      : gameMode === "adult"
        ? [6, 8].includes(opt.size)
        : true,
  );

  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [memorySession, setMemorySession] = useState<MemorySession | null>(
    null,
  );

  useEffect(() => {
    if (!profileId || !isReady) return;
    customFetch<ActiveGame>(`/api/games/active/${profileId}`)
      .then((g) => setActiveGame(g))
      .catch(() => setActiveGame(null));
  }, [profileId, isReady]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brain-games-memory-session");
      if (!raw) {
        setMemorySession(null);
        return;
      }
      const s: MemorySession = JSON.parse(raw);
      if (!s.savedAt || Date.now() - s.savedAt > 12 * 60 * 60 * 1000) {
        localStorage.removeItem("brain-games-memory-session");
        setMemorySession(null);
        return;
      }
      setMemorySession(s);
    } catch {
      setMemorySession(null);
    }
  }, []);

  const handleQuickStart = async (size: number) => {
    // Only block if another start is already in flight — do NOT block on !isReady.
    // Auth resolving is not a reason to prevent the user from playing.
    if (loadingSize !== null) return;
    setLoadingSize(size);

    const difficulty = (() => {
      try {
        const stored = localStorage.getItem("sudoku-last-difficulty");
        return stored && ["easy", "medium", "hard", "expert"].includes(stored)
          ? stored
          : "easy";
      } catch {
        return "easy";
      }
    })();

    // Always pre-generate an offline puzzle immediately — this is instant (bank lookup).
    // Whatever happens with the API, the user can play right away.
    try {
      generateOfflinePuzzle(difficulty, size);
      localStorage.setItem("sudoku-last-grid-size", String(size));
      localStorage.setItem("sudoku-last-difficulty", difficulty);
    } catch {
      /* ignore */
    }

    // No profile → play offline straight away, no API needed.
    if (!profileId) {
      // Offline games are identified by gameId=0. Remove the legacy shared
      // key so older sessions cannot be restored into the new puzzle.
      localStorage.removeItem("sudoku-grid-0");
      localStorage.removeItem("sudoku-notes-0");
      localStorage.removeItem("sudoku-elapsed-0");
      setLoadingSize(null);
      setLocation(sudokuGamePath(size, difficulty, 0, "number", Date.now()));
      return;
    }

    let settled = false;

    const goOffline = () => {
      if (settled) return;
      settled = true;
      localStorage.removeItem("sudoku-grid-0");
      localStorage.removeItem("sudoku-notes-0");
      localStorage.removeItem("sudoku-elapsed-0");
      setLoadingSize(null);
      setLocation(sudokuGamePath(size, difficulty, 0, "number", Date.now()));
    };

    // Give the API 1.5 s — same budget as the home page.
    // If it hasn't responded by then, start the offline game immediately.
    const timer = setTimeout(goOffline, 1500);

    try {
      const puzzle = await customFetch<{ id: number; difficulty: string }>(
        `/api/puzzles/new?difficulty=${difficulty}&gridSize=${size}`,
      );
      const game = await customFetch<{ id: number }>("/api/games", {
        method: "POST",
        body: JSON.stringify({ profileId, puzzleId: puzzle.id, difficulty }),
      });
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        setLoadingSize(null);
        setLocation(sudokuGamePath(size, difficulty, game.id));
      }
    } catch {
      clearTimeout(timer);
      goOffline();
    }
  };

  const sudokuGridCols =
    visibleSudokuSizes.length <= 2
      ? "grid-cols-2"
      : visibleSudokuSizes.length === 3
        ? "grid-cols-3"
        : visibleSudokuSizes.length === 4
          ? "grid-cols-4"
          : "grid-cols-5";
  const memoryGridCols =
    visibleMemoryOptions.length <= 2
      ? "grid-cols-2"
      : visibleMemoryOptions.length === 3
        ? "grid-cols-3"
        : "grid-cols-4";

  return (
    <div className="animate-in fade-in duration-500 pb-8">
      {/* ═══════════════════════════════════════════════════════════
          MOBILE QUICK LAUNCH — shown only on mobile (top of screen)
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3 mb-6">
        {/* Resume strips */}
        {activeGame &&
          (() => {
            const gs = activeGame.puzzle?.gridSize;
            const validForMode =
              gameMode === "children"
                ? [3, 4, 6].includes(gs!)
                : gameMode === "adult"
                  ? [9, 16].includes(gs!)
                  : true;
            return validForMode ? (
              <button
                onClick={() => setLocation(sudokuGamePath(
                  activeGame.puzzle?.gridSize ?? 9,
                  activeGame.puzzle?.difficulty ?? "easy",
                  activeGame.id,
                ))}
                className="w-full flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-card px-4 py-2.5 text-left hover:bg-muted transition-all"
              >
                <RotateCcw className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-primary">
                    Resume Sudoku
                  </span>
                  {activeGame.puzzle && (
                    <span className="text-xs text-muted-foreground capitalize ml-2">
                      {activeGame.puzzle.gridSize}×{activeGame.puzzle.gridSize}{" "}
                      · {activeGame.puzzle.difficulty}
                    </span>
                  )}
                </div>
                <span className="text-primary text-sm shrink-0">→</span>
              </button>
            ) : null;
          })()}

        {memorySession &&
          (() => {
            const gs = memorySession.gridSize;
            const validForMode =
              gameMode === "children"
                ? [2, 4].includes(gs)
                : gameMode === "adult"
                  ? [6, 8].includes(gs)
                  : true;
            if (!validForMode) return null;
            const matched = memorySession.cards.filter((c) => c.matched).length;
            const total = memorySession.cards.length / 2;
            const sizeLabel =
              gs === 2 ? "2×4" : gs === 4 ? "4×4" : gs === 6 ? "4×8" : "8×8";
            return (
              <button
                onClick={() => setLocation("/memory")}
                className="w-full flex items-center gap-3 rounded-xl border-2 border-violet-400/30 bg-card px-4 py-2.5 text-left hover:bg-muted transition-all"
              >
                <RotateCcw className="w-4 h-4 text-violet-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-violet-700 dark:text-violet-400">
                    Resume Memory Match
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {sizeLabel} · {matched}/{total} pairs
                  </span>
                </div>
                <span className="text-violet-500 text-sm shrink-0">→</span>
              </button>
            );
          })()}

        {/* Sudoku quick launch */}
        <div className="rounded-2xl border-2 border-primary/20 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm">Sudoku</span>
            </div>
            <button
              onClick={() => setLocation("/sudoku")}
              className="text-xs text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
            >
              More options →
            </button>
          </div>
          <div className={`grid gap-2 ${sudokuGridCols}`}>
            {visibleSudokuSizes.map((opt) => (
              <button
                key={opt.size}
                onClick={() => handleQuickStart(opt.size)}
                disabled={loadingSize !== null}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/25 bg-background hover:bg-primary/10 hover:border-primary/50 transition-all py-3 px-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px]"
              >
                {loadingSize === opt.size ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <>
                    <span className="font-black text-sm leading-none text-primary">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-1 leading-none">
                      {opt.sublabel}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Match quick launch */}
        <div className="rounded-2xl border-2 border-violet-400/25 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🃏</span>
              <span className="font-bold text-sm">Memory Match</span>
            </div>
            <button
              onClick={() => setLocation("/memory")}
              className="text-xs text-violet-500/70 hover:text-violet-600 transition-colors underline underline-offset-2"
            >
              More options →
            </button>
          </div>
          <div className={`grid gap-2 ${memoryGridCols}`}>
            {visibleMemoryOptions.map((opt) => (
              <button
                key={opt.size}
                onClick={() => setLocation(`/memory?size=${opt.size}`)}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-violet-400/20 bg-background hover:bg-violet-500/10 hover:border-violet-400/50 transition-all py-3 px-2 min-h-[60px]"
              >
                <span className="font-black text-sm leading-none text-violet-600">
                  {opt.label}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1 leading-none">
                  {opt.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="rounded-2xl border-2 border-orange-200/70 bg-card dark:border-orange-800/30 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="font-bold text-sm">Daily Challenges</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Resets at midnight
            </span>
          </div>
          <button
            onClick={() => setLocation("/daily-challenge")}
            className="w-full flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 dark:bg-orange-950/30 px-3 py-2.5 text-left hover:bg-white/90 dark:hover:bg-orange-950/50 transition-all"
          >
            <span className="text-lg leading-none shrink-0">🔢</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Sudoku</p>
              <p className="text-xs text-muted-foreground">
                One shared puzzle per day
              </p>
            </div>
            <span className="text-orange-400 text-sm shrink-0">→</span>
          </button>
          <button
            onClick={() => setLocation("/memory-challenge")}
            className="w-full flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 dark:bg-orange-950/30 px-3 py-2.5 text-left hover:bg-white/90 dark:hover:bg-orange-950/50 transition-all"
          >
            <span className="text-lg leading-none shrink-0">🃏</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Memory Match</p>
              <p className="text-xs text-muted-foreground">
                Daily + weekly challenge
              </p>
            </div>
            <span className="text-orange-400 text-sm shrink-0">→</span>
          </button>
        </div>

        {/* Level banner (mobile) */}
        {profile &&
          (() => {
            const xp = profile.xp ?? 0;
            const level = getLevelFromXp(xp);
            return (
              <button
                onClick={() => setLocation("/profile")}
                className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all hover:opacity-90 active:scale-[0.99] bg-card"
                style={{
                  border: `1.5px solid ${level.ring}55`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                  style={{
                    backgroundColor: level.color,
                    color: level.textColor,
                    boxShadow: `0 0 0 2.5px ${level.ring}`,
                  }}
                >
                  {level.index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-sm font-black"
                      style={{ color: level.color }}
                    >
                      {level.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {xp.toLocaleString()} XP
                    </span>
                  </div>
                  {level.nextTier && (
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: `${level.color}22` }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${level.progress}%`,
                          backgroundColor: level.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })()}

      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP LAYOUT — full cards with embedded quick-start
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-10">
        {/* Title */}
        <div className="text-center space-y-2 pt-4 bg-card rounded-2xl px-6 py-5 border border-border">
          <h1 className="text-4xl font-serif font-bold tracking-tight">
            Brain Games 4 All
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your game and play
          </p>
          {!profileId && isReady && (
            <p className="text-sm text-muted-foreground">
              <button
                className="underline underline-offset-2 hover:text-foreground transition-colors"
                onClick={() => setLocation("/sign-in")}
              >
                Sign in
              </button>{" "}
              to sync progress across devices
            </p>
          )}
        </div>

        {/* Level banner */}
        {profile &&
          (() => {
            const xp = profile.xp ?? 0;
            const level = getLevelFromXp(xp);
            return (
              <button
                onClick={() => setLocation("/profile")}
                className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-4 transition-all hover:opacity-90 active:scale-[0.99] bg-card"
                style={{ border: `1.5px solid ${level.ring}55` }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                  style={{
                    backgroundColor: level.color,
                    color: level.textColor,
                    boxShadow: `0 0 0 2.5px ${level.ring}`,
                  }}
                >
                  {level.index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-sm font-black"
                      style={{ color: level.color }}
                    >
                      {level.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {xp.toLocaleString()} XP
                    </span>
                  </div>
                  {level.nextTier ? (
                    <>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: `${level.color}22` }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${level.progress}%`,
                            backgroundColor: level.color,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {(level.nextTier.minXp - xp).toLocaleString()} XP to{" "}
                        <span
                          style={{
                            color: level.nextTier.color,
                            fontWeight: 700,
                          }}
                        >
                          {level.nextTier.name}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p
                      className="text-xs font-semibold"
                      style={{ color: level.color }}
                    >
                      🏆 Max Rank
                    </p>
                  )}
                </div>
              </button>
            );
          })()}

        {/* Game cards */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Available Games
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sudoku Card */}
            <div className="group relative rounded-2xl border-2 border-primary/20 bg-card overflow-hidden">
              <button
                onClick={() => setLocation("/sudoku")}
                className="w-full text-left p-6 space-y-4 hover:from-primary/15 hover:to-primary/10 hover:border-primary/40 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Grid3X3 className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif">Sudoku</h2>
                    <p className="text-xs text-muted-foreground">
                      Number puzzle
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fill the grid so every row, column, and box contains each
                  symbol exactly once.
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <ThemeIcon themeId={themeId} value={n} size={22} />
                    </div>
                  ))}
                  <span className="text-muted-foreground/60 text-xs self-end pb-0.5">
                    …
                  </span>
                </div>
              </button>

              {activeGame &&
                (() => {
                  const gs = activeGame.puzzle?.gridSize;
                  const validForMode =
                    gameMode === "children"
                      ? [3, 4, 6].includes(gs!)
                      : gameMode === "adult"
                        ? [9, 16].includes(gs!)
                        : true;
                  return validForMode ? (
                    <button
                      onClick={() => setLocation(sudokuGamePath(
                        activeGame.puzzle?.gridSize ?? 9,
                        activeGame.puzzle?.difficulty ?? "easy",
                        activeGame.id,
                      ))}
                      className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/25 px-3 py-2 text-left hover:bg-primary/20 transition-colors w-[calc(100%-3rem)]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary">
                        Resume in progress
                      </span>
                      {activeGame.puzzle && (
                        <span className="text-[10px] text-muted-foreground capitalize ml-auto">
                          {activeGame.puzzle.gridSize}×
                          {activeGame.puzzle.gridSize} ·{" "}
                          {activeGame.puzzle.difficulty}
                        </span>
                      )}
                    </button>
                  ) : null;
                })()}

              <div className="px-6 pb-2">
                <p className="text-[10px] text-muted-foreground mb-2">
                  Tap a size to jump right in
                </p>
                <div
                  className={`grid gap-1.5 ${visibleSudokuSizes.length === 2 ? "grid-cols-2" : "grid-cols-4"}`}
                >
                  {visibleSudokuSizes.map((opt) => (
                    <button
                      key={opt.size}
                      onClick={() => handleQuickStart(opt.size)}
                      disabled={loadingSize !== null}
                      className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 transition-all py-2 px-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
                    >
                      {loadingSize === opt.size ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <>
                          <span className="font-bold text-xs leading-none text-primary">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                            {opt.sublabel}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-5 pt-1">
                <button
                  onClick={() => setLocation("/sudoku")}
                  className="text-[10px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
                >
                  More options (difficulty, play style) →
                </button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </div>

            {/* Memory Match Card */}
            {(() => {
              return (
                <div className="group relative rounded-2xl border-2 border-violet-400/25 bg-card overflow-hidden">
                  <button
                    onClick={() => setLocation("/memory")}
                    className="w-full text-left p-6 space-y-4 hover:from-violet-500/15 hover:to-purple-500/10 hover:border-violet-400/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-400/20">
                        <ThemeIcon themeId={themeId} value={1} size={34} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-serif">
                          Memory Match
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Card matching game
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Flip cards to find matching pairs. Beat the clock and
                      minimise your flips to maximise your score.
                    </p>
                    <div className="flex gap-1 items-center">
                      {[1, 2, 3, 4].map((value) => (
                        <span
                          key={value}
                          className="inline-flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <ThemeIcon themeId={themeId} value={value} size={22} />
                        </span>
                      ))}
                      <span className="text-muted-foreground/60 text-xs self-end pb-0.5 ml-1">
                        …
                      </span>
                    </div>
                  </button>
                  {memorySession &&
                    (() => {
                      const gs = memorySession.gridSize;
                      const validForMode =
                        gameMode === "children"
                          ? [2, 4].includes(gs)
                          : gameMode === "adult"
                            ? [6, 8].includes(gs)
                            : true;
                      if (!validForMode) return null;
                      const matched = memorySession.cards.filter(
                        (c) => c.matched,
                      ).length;
                      const total = memorySession.cards.length / 2;
                      const sizeLabel =
                        gs === 2
                          ? "2×4"
                          : gs === 4
                            ? "4×4"
                            : gs === 6
                              ? "4×8"
                              : "8×8";
                      return (
                        <button
                          onClick={() => setLocation("/memory")}
                          className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-violet-500/10 border border-violet-400/25 px-3 py-2 text-left hover:bg-violet-500/20 transition-colors w-[calc(100%-3rem)]"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                          <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                            Resume in progress
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {sizeLabel} · {matched}/{total} pairs
                          </span>
                        </button>
                      );
                    })()}
                  <div className="px-6 pb-5 pt-1">
                    <div
                      className={`grid gap-1.5 ${visibleMemoryOptions.length === 2 ? "grid-cols-2" : "grid-cols-4"}`}
                    >
                      {visibleMemoryOptions.map((opt) => (
                        <button
                          key={opt.size}
                          onClick={() =>
                            setLocation(`/memory?size=${opt.size}`)
                          }
                          className="flex flex-col items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-400/40 transition-all py-2 px-1 cursor-pointer min-h-[52px]"
                        >
                          <span className="font-bold text-xs leading-none text-violet-600">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                            {opt.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                    title="Available"
                  />
                </div>
              );
            })()}
          </div>
        </div>

        {/* Daily Challenges (desktop) */}
        <div className="rounded-2xl border-2 border-orange-200/70 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 dark:border-orange-800/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold">Daily Challenges</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Same puzzle for everyone · Resets at midnight
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLocation("/daily-challenge")}
              className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 dark:bg-orange-950/30 px-4 py-3 text-left hover:bg-white/90 dark:hover:bg-orange-950/50 transition-all"
            >
              <span className="text-2xl leading-none shrink-0">🔢</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Sudoku</p>
                <p className="text-xs text-muted-foreground">
                  One shared puzzle per day
                </p>
              </div>
              <span className="text-orange-400 shrink-0">→</span>
            </button>
            <button
              onClick={() => setLocation("/memory-challenge")}
              className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 dark:bg-orange-950/30 px-4 py-3 text-left hover:bg-white/90 dark:hover:bg-orange-950/50 transition-all"
            >
              <span className="text-2xl leading-none shrink-0">🃏</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Memory Match</p>
                <p className="text-xs text-muted-foreground">
                  Daily + weekly challenge
                </p>
              </div>
              <span className="text-orange-400 shrink-0">→</span>
            </button>
          </div>
        </div>

        {/* Coming soon (desktop) */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Coming Soon
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMING_SOON.map((game) => (
              <div
                key={game.title}
                className="rounded-2xl border border-border bg-muted p-6 space-y-3 opacity-60 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white/40 flex items-center justify-center text-3xl">
                    {game.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif">
                      {game.title}
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-xs mt-0.5 border-current/30"
                    >
                      Soon
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {game.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          GAME INFO CARDS — mobile only (descriptions / discovery)
          shown below the quick launch section
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-6 mt-2">
        {/* Coming soon (mobile) — first */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Coming Soon
          </p>
          <div className="grid grid-cols-2 gap-3">
            {COMING_SOON.map((game) => (
              <div
                key={game.title}
                className="rounded-2xl border border-border bg-muted p-4 space-y-1.5 opacity-60 cursor-not-allowed select-none"
              >
                <span className="text-2xl">{game.icon}</span>
                <div>
                  <p className="font-bold text-sm">{game.title}</p>
                  <Badge
                    variant="outline"
                    className="text-xs mt-0.5 border-current/30"
                  >
                    Soon
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Title / sign-in note — after coming soon */}
        <div className="bg-card border border-border rounded-2xl px-4 py-3 space-y-1">
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Brain Games 4 All
          </h1>
          <p className="text-sm text-muted-foreground">
            Two classic brain games, endlessly replayable
          </p>
          {!profileId && isReady && (
            <p className="text-xs text-muted-foreground">
              <button
                className="underline underline-offset-2 hover:text-foreground transition-colors"
                onClick={() => setLocation("/sign-in")}
              >
                Sign in
              </button>{" "}
              to sync progress across devices
            </p>
          )}
        </div>

        {/* About the games — last */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            About the games
          </p>
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start">
              <Grid3X3 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Sudoku</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Fill the grid so every row, column, and box contains each
                  symbol exactly once. 5 grid sizes, 4 difficulty levels.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start">
              <span className="text-lg mt-0.5 shrink-0">🃏</span>
              <div>
                <p className="font-semibold text-sm">Memory Match</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Flip cards to find matching pairs. Beat the clock and minimise
                  your flips to maximise your score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
