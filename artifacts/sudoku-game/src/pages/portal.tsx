import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useImageTheme } from "@/hooks/use-image-theme";
import { usePageMeta } from "@/components/page-meta";
import { ThemeIcon } from "@/components/theme-icons";
import { MobileContentDisclosure } from "@/components/mobile-content-disclosure";
import {
  Grid3x2 as Grid3X3,
  Loader as Loader2,
  RotateCcw,
  Flame,
  ChevronDown,
  Puzzle,
  Search,
  Bomb,
  Grid3x3,
  Copy,
} from "lucide-react";
import { customFetch, useGetProfile } from "@workspace/api-client-react";
import { generateOfflinePuzzle } from "@/lib/sudoku-generator";
import { getLevelFromXp } from "@/lib/levels";
import { getTheme } from "@/lib/themes";
import { sudokuGamePath } from "@/lib/sudoku-routes";
import { WORD_SEARCH_LEVELS, type WordSearchDifficulty } from "@/lib/word-search";
import { MINESWEEPER_LEVELS, type MinesweeperDifficulty } from "@/lib/minesweeper";
import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty } from "@/lib/slide-puzzle";
import { QUIZ_LEVELS, QUIZ_SUBJECTS, type QuizLevel, type QuizSubject } from "@/lib/quiz";
import {
  getLastPlayedDifficulty,
  LAST_GRID_SIZE_KEY,
  rememberSudokuDifficulty,
} from "@/lib/sudoku-preferences";
import {
  JIGSAW_SESSION_STORAGE_KEY,
  parseSavedJigsawSession,
  type SavedJigsawSession,
} from "@/lib/jigsaw-session";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

function IconSetPreview({ themeId, className = "" }: { themeId: string; className?: string }) {
  return (
    <div aria-label="Sample icons from the selected icon set" className={`relative z-10 flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4].map((value) => (
        <span key={value} className="inline-flex items-center justify-center opacity-80">
          <ThemeIcon themeId={themeId} value={value} size={22} />
        </span>
      ))}
      <span aria-hidden="true" className="ml-1 self-end pb-0.5 text-xs text-muted-foreground/60">…</span>
    </div>
  );
}

const GRID_QUICK_START = [
  { size: 3, label: "3×3", sublabel: "Baby" },
  { size: 4, label: "4×4", sublabel: "Mini" },
  { size: 6, label: "6×6", sublabel: "Dual" },
  { size: 9, label: "9×9", sublabel: "Classic" },
  { size: 16, label: "16×16", sublabel: "Pro" },
];

export default function Portal() {
  const [, setLocation] = useLocation();
  const landingPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Play Brain Games . Online",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description:
      "Play Sudoku, Memory Match, and Jigsaw puzzles with flexible board sizes, daily challenges, guest play, and optional synced progress.",
    url: new URL("/", window.location.origin).toString(),
  };
  usePageMeta({
    title: "Free Sudoku, Memory Match & Jigsaw Games Online",
    description:
      "Play free browser-based Sudoku, Memory Match, and Jigsaw puzzles. Choose a board, join daily challenges, and play as a guest or sync progress.",
    path: "/",
    structuredData: landingPageSchema,
  });
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
    { size: 6, label: "8×4", sub: "16 pairs" },
    { size: 8, label: "8×8", sub: "32 pairs" },
  ];
  const visibleMemoryOptions = ALL_MEMORY_OPTIONS.filter((opt) =>
    gameMode === "children"
      ? [2, 4].includes(opt.size)
      : gameMode === "adult"
        ? [6, 8].includes(opt.size)
        : true,
  );
  const visibleJigsawSizes = ([2, 3, 4, 5] as const).filter((size) =>
    gameMode === "children" ? size <= 3 : gameMode === "adult" ? size >= 4 : true,
  );
  const visibleWordSearchLevels: WordSearchDifficulty[] = (["beginner", "easy", "medium", "hard"] as WordSearchDifficulty[]).filter((level) =>
    gameMode === "children" ? WORD_SEARCH_LEVELS[level].mode === "baby" : gameMode === "adult" ? WORD_SEARCH_LEVELS[level].mode === "adult" : true,
  );
  const launchWordSearch = (difficulty: WordSearchDifficulty) =>
    setLocation(`/word-search?start=1&difficulty=${difficulty}&theme=${encodeURIComponent(`icon-${themeId}`)}`);
  const visibleMinesweeperLevels: MinesweeperDifficulty[] = (["beginner", "easy", "medium", "hard"] as MinesweeperDifficulty[]).filter((level) =>
    gameMode === "children" ? MINESWEEPER_LEVELS[level].mode === "baby" : gameMode === "adult" ? MINESWEEPER_LEVELS[level].mode === "adult" : true,
  );
  const launchMinesweeper = (difficulty: MinesweeperDifficulty) =>
    setLocation(`/minesweeper?start=1&difficulty=${difficulty}`);
  const visibleSlidePuzzleLevels: SlidePuzzleDifficulty[] = (["2x2", "3x3", "4x4", "5x5"] as SlidePuzzleDifficulty[]).filter((level) =>
    gameMode === "children" ? SLIDE_PUZZLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SLIDE_PUZZLE_LEVELS[level].mode === "adult" : true,
  );
  const launchSlidePuzzle = (difficulty: SlidePuzzleDifficulty) =>
    setLocation(`/slide-puzzle?start=1&difficulty=${difficulty}`);
  const visibleQuizLevelsFor = (id: QuizSubject) =>
    QUIZ_LEVELS.filter((level) =>
      gameMode === "children" ? QUIZ_SUBJECTS[id].levels[level].mode === "baby" : gameMode === "adult" ? QUIZ_SUBJECTS[id].levels[level].mode === "adult" : true,
    );
  const launchQuiz = (subject: QuizSubject, level: QuizLevel) =>
    setLocation(`/quiz/${subject}?start=1&level=${level}`);

  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [memorySession, setMemorySession] = useState<MemorySession | null>(
    null,
  );
  const [jigsawSession, setJigsawSession] = useState<SavedJigsawSession | null>(null);
  const [dailyChallengesOpen, setDailyChallengesOpen] = useState(false);
  const [aboutGamesOpen, setAboutGamesOpen] = useState(false);
  const canResumeJigsaw = Boolean(
    jigsawSession &&
      (gameMode === "children"
        ? jigsawSession.gridSize <= 3
        : gameMode === "adult"
          ? jigsawSession.gridSize >= 4
          : true),
  );
  const jigsawSessionTime = jigsawSession
    ? `${Math.floor(jigsawSession.elapsed / 60).toString().padStart(2, "0")}:${(jigsawSession.elapsed % 60).toString().padStart(2, "0")}`
    : "";

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

  useEffect(() => {
    try {
      const session = parseSavedJigsawSession(localStorage.getItem(JIGSAW_SESSION_STORAGE_KEY));
      if (!session) localStorage.removeItem(JIGSAW_SESSION_STORAGE_KEY);
      setJigsawSession(session);
    } catch {
      setJigsawSession(null);
    }
  }, []);

  const handleQuickStart = async (size: number) => {
    // Only block if another start is already in flight — do NOT block on !isReady.
    // Auth resolving is not a reason to prevent the user from playing.
    if (loadingSize !== null) return;
    setLoadingSize(size);

    const difficulty = getLastPlayedDifficulty();

    // Always pre-generate an offline puzzle immediately — this is instant (bank lookup).
    // Whatever happens with the API, the user can play right away.
    try {
      generateOfflinePuzzle(difficulty, size);
      localStorage.setItem(LAST_GRID_SIZE_KEY, String(size));
      rememberSudokuDifficulty(difficulty);
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
  const jigsawGridCols = visibleJigsawSizes.length <= 2 ? "grid-cols-2" : "grid-cols-4";

  return (
    <div className="animate-in fade-in duration-500 pb-8">
      {/* ═══════════════════════════════════════════════════════════
          MOBILE QUICK LAUNCH — shown only on mobile (top of screen)
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3 mb-6">
        {/* Sudoku quick launch — featured game */}
        <div className="relative isolate overflow-hidden rounded-2xl border-2 border-primary/55 bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100 p-4 space-y-3 shadow-xl shadow-primary/20 ring-1 ring-inset ring-white/70 dark:from-cyan-950/80 dark:via-sky-950/75 dark:to-indigo-950/80 dark:ring-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-primary to-indigo-500"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15"
          />
          {/* Puzzle-grid backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-3 grid h-32 w-32 rotate-6 grid-cols-3 overflow-hidden rounded-2xl border-2 border-primary/20 bg-white/20 opacity-70 dark:bg-white/5"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                className="flex items-center justify-center border border-primary/10 text-lg font-black text-primary/20"
              >
                {[5, 2, 8, 1, 7, 3, 9, 4, 6][i]}
              </span>
            ))}
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">
                  Sudoku
                </span>
                <span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-sm dark:bg-slate-950/30">
                  Numbers · letters · icons
                </span>
              </div>
            </div>
            <button
              onClick={() => setLocation("/sudoku")}
              className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              All options
            </button>
          </div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">
            Choose a grid and start solving.
          </p>
          <div className={`grid gap-1.5 ${sudokuGridCols}`}>
            {visibleSudokuSizes.map((opt) => (
              <button
                key={opt.size}
                onClick={() => handleQuickStart(opt.size)}
                disabled={loadingSize !== null}
                className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-primary/30 bg-white/75 px-2 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"
              >
                {loadingSize === opt.size ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <>
                    <span className="font-black text-base leading-none text-primary">
                      {opt.label}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground leading-none">
                      {opt.sublabel}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

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
                onClick={() =>
                  setLocation(
                    sudokuGamePath(
                      activeGame.puzzle?.gridSize ?? 9,
                      activeGame.puzzle?.difficulty ?? "easy",
                      activeGame.id,
                    ),
                  )
                }
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

        {/* Memory Match quick launch — featured game */}
        <div className="relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-fuchsia-100 via-violet-50 to-amber-100 p-4 space-y-3 shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 dark:from-fuchsia-950/75 dark:via-violet-950/80 dark:to-amber-950/60 dark:ring-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-fuchsia-300/35 blur-2xl dark:bg-fuchsia-400/15"
          />
          {/* Stacked card backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-2 h-28 w-20 rotate-12 rounded-xl border-2 border-violet-300/20 bg-violet-100/30 opacity-55 shadow-sm dark:border-violet-300/10 dark:bg-violet-300/5"
          >
            <div className="flex h-full items-center justify-center text-3xl opacity-40">
              ?
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-14 top-5 h-28 w-20 -rotate-6 rounded-xl border-2 border-violet-300/25 bg-violet-50/45 opacity-60 shadow-sm dark:border-violet-300/10 dark:bg-violet-200/5"
          >
            <div className="flex h-full items-center justify-center">
              <Copy className="h-8 w-8 text-violet-700/30 dark:text-violet-200/20" />
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-md">
                <Copy className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">
                  Memory Match
                </span>
                <span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700 shadow-sm dark:bg-slate-950/30 dark:text-violet-300">
                  Card matching
                </span>
              </div>
            </div>
            <button
              onClick={() => setLocation("/memory/")}
              className="rounded-full bg-violet-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-violet-600"
            >
              All options
            </button>
          </div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">
            Find matching pairs and beat your score.
          </p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`grid gap-1.5 ${memoryGridCols}`}>
            {visibleMemoryOptions.map((opt) => (
              <button
                key={opt.size}
                onClick={() => setLocation(`/memory?size=${opt.size}`)}
                className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-violet-400/35 bg-white/75 px-2 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"
              >
                <span className="font-black text-base leading-none text-violet-600">
                  {opt.label}
                </span>
                <span className="mt-1 text-xs text-muted-foreground leading-none">
                  {opt.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

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
              gs === 2 ? "2×4" : gs === 4 ? "4×4" : gs === 6 ? "8×4" : "8×8";
            return (
              <button
                onClick={() => setLocation("/memory/")}
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

        {canResumeJigsaw && jigsawSession && (
          <button
            type="button"
            onClick={() => setLocation("/jigsaw?resume=1")}
            data-testid="button-resume-jigsaw-from-portal"
            className="w-full flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-card px-4 py-2.5 text-left transition-all hover:border-primary/60 hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-foreground">Resume Jigsaw</span>
              <span className="text-xs text-muted-foreground">
                {jigsawSession.gridSize}×{jigsawSession.gridSize} · {jigsawSession.moves} moves · {jigsawSessionTime}
              </span>
            </span>
            <span className="shrink-0 text-sm text-primary">→</span>
          </button>
        )}

        {/* Jigsaw Puzzle quick launch */}
        <div className="relative isolate overflow-hidden rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 space-y-3 shadow-xl shadow-amber-500/15 ring-1 ring-inset ring-white/70 dark:from-amber-950/70 dark:via-orange-950/65 dark:to-yellow-950/70 dark:ring-white/10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-400/15" />
          {/* Puzzle piece backdrop */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rotate-12 rounded-xl border-2 border-amber-400/30 bg-amber-200/40 opacity-60 shadow-sm dark:bg-amber-400/10">
            <div className="flex h-full items-center justify-center"><Puzzle className="h-16 w-16 text-amber-700/30 dark:text-amber-300/25" /></div>
          </div>
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md"><Puzzle className="h-6 w-6" /></div>
              <div><span className="block text-xl font-bold leading-tight text-foreground">Jigsaw Puzzle</span><span className="mt-1 inline-flex rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 shadow-sm dark:bg-slate-950/30 dark:text-amber-300">Picture puzzle</span></div>
            </div>
            <button onClick={() => setLocation("/jigsaw")} className="rounded-full bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-amber-700">All options</button>
          </div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Rebuild a picture, one piece at a time.</p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`relative z-10 grid gap-1.5 ${jigsawGridCols}`}>
                {visibleJigsawSizes.map((size) => (
              <button key={size} onClick={() => setLocation(`/jigsaw?gridSize=${size}&level=1&imageKey=1&play=1`)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-amber-400/35 bg-white/75 px-2 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55">
                <span className="font-bold text-base leading-none text-amber-700">{size}×{size}</span>
                <span className="mt-1 text-xs leading-none text-muted-foreground">{size * size} pieces</span>
              </button>
            ))}
          </div>
        </div>

        {/* Word Search quick launch */}
        <section className="relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-pink-100 p-4 shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 dark:from-violet-950/75 dark:via-fuchsia-950/70 dark:to-pink-950/60 dark:ring-white/10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-fuchsia-300/35 blur-2xl dark:bg-fuchsia-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-violet-400/15 bg-white/15 opacity-60 dark:bg-white/5">{"WORDSEARCH".slice(0, 9).split("").map((letter, index) => <span key={index} className="flex items-center justify-center border border-violet-400/10 text-xs font-black text-violet-700/25 dark:text-violet-200/20">{letter}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md"><Search className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Word Search</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700 shadow-sm dark:bg-slate-950/30 dark:text-violet-300">Hidden words</span></div></div><button onClick={() => setLocation("/word-search")} className="rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-violet-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Find hidden words in the letter grid.</p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleWordSearchLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleWordSearchLevels.map((level) => <button key={level} onClick={() => launchWordSearch(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-violet-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-violet-700 dark:text-violet-300">{WORD_SEARCH_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{WORD_SEARCH_LEVELS[level].size}×{WORD_SEARCH_LEVELS[level].size} · {WORD_SEARCH_LEVELS[level].wordCount} words</span></button>)}
          </div>
        </section>

        {/* Minesweeper quick launch */}
        <section className="relative isolate overflow-hidden rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 p-4 shadow-xl shadow-emerald-500/20 ring-1 ring-inset ring-white/70 dark:from-emerald-950/75 dark:via-teal-950/70 dark:to-cyan-950/60 dark:ring-white/10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-teal-300/35 blur-2xl dark:bg-teal-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-emerald-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["1", "💣", "1", "", "2", "1", "🚩", "", "3"].map((cell, index) => <span key={index} className="flex items-center justify-center border border-emerald-400/10 text-xs font-black text-emerald-700/25 dark:text-emerald-200/20">{cell}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md"><Bomb className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Minesweeper</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 shadow-sm dark:bg-slate-950/30 dark:text-emerald-300">Clear the field</span></div></div><button onClick={() => setLocation("/minesweeper")} className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-emerald-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Reveal every safe cell — dodge the mines.</p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleMinesweeperLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleMinesweeperLevels.map((level) => <button key={level} onClick={() => launchMinesweeper(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-emerald-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-emerald-700 dark:text-emerald-300">{MINESWEEPER_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{MINESWEEPER_LEVELS[level].size}×{MINESWEEPER_LEVELS[level].size} · {MINESWEEPER_LEVELS[level].mines} mines</span></button>)}
          </div>
        </section>

        {/* Slide Puzzle quick launch */}
        <section className="relative isolate overflow-hidden rounded-2xl border-2 border-sky-400/60 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 p-4 shadow-xl shadow-sky-500/20 ring-1 ring-inset ring-white/70 dark:from-sky-950/75 dark:via-cyan-950/70 dark:to-blue-950/60 dark:ring-white/10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-sky-400/15 bg-white/15 opacity-60 dark:bg-white/5">{[1, 2, 3, 4, 0, 5, 7, 8, 6].map((tile, index) => <span key={index} className="flex items-center justify-center border border-sky-400/10 text-xs font-black text-sky-700/25 dark:text-sky-200/20">{tile === 0 ? "·" : tile}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md"><Grid3x3 className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Slide Puzzle</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700 shadow-sm dark:bg-slate-950/30 dark:text-sky-300">Slide to order</span></div></div><button onClick={() => setLocation("/slide-puzzle")} className="rounded-full bg-sky-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-sky-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Slide the tiles back into order.</p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleSlidePuzzleLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleSlidePuzzleLevels.map((level) => <button key={level} onClick={() => launchSlidePuzzle(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-sky-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-sky-700 dark:text-sky-300">{SLIDE_PUZZLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SLIDE_PUZZLE_LEVELS[level].size}×{SLIDE_PUZZLE_LEVELS[level].size} · {SLIDE_PUZZLE_LEVELS[level].tiles} tiles</span></button>)}
          </div>
        </section>

        {/* Quiz quick launches — one card per subject */}
        {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
          const subject = QUIZ_SUBJECTS[id];
          const levels = visibleQuizLevelsFor(id);
          return (
            <section key={id} className={`relative isolate overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} p-4 shadow-xl ring-1 ring-inset ring-white/70 dark:ring-white/10`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: subject.theme.hex }} />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full blur-2xl dark:blur-3xl" style={{ backgroundColor: `${subject.theme.hex}59` }} />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border bg-white/15 p-1.5 opacity-60 dark:bg-white/5" style={{ borderColor: `${subject.theme.hex}26` }}>{["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => <span key={letter} className="flex items-center justify-center rounded-md border text-xs font-black" style={{ borderColor: `${subject.theme.hex}1a`, color: `${subject.theme.hex}40` }}>{letter}</span>)}</div>
              <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl shadow-md ${subject.theme.soft}`}>{subject.emoji}</div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">{subject.shortName} Quiz</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm dark:bg-slate-950/30" style={{ color: subject.theme.hex }}>{subject.tagline}</span></div></div><button onClick={() => setLocation(`/quiz/${id}`)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors ${subject.theme.btn}`}>All options</button></div>
              <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Timed multiple-choice questions across four levels.</p>
              <div className={`relative z-10 mt-2 grid gap-1.5 ${levels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
                {levels.map((level) => <button key={level} onClick={() => launchQuiz(id, level)} className={`relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55 ${subject.theme.border} ${subject.theme.hover}`}><span className={`font-black text-sm leading-tight ${subject.theme.strong}`}>{subject.levels[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{subject.levels[level].detail}</span></button>)}
              </div>
            </section>
          );
        })}

        {/* Daily Challenges */}
        <Collapsible
          open={dailyChallengesOpen}
          onOpenChange={setDailyChallengesOpen}
          className="rounded-2xl border-2 border-orange-200/70 bg-card p-4 dark:border-orange-800/30"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-expanded={dailyChallengesOpen}
              className="flex w-full items-center gap-2 text-left"
            >
              <Flame className="h-4 w-4 shrink-0 text-orange-500" />
              <span className="font-bold text-sm">Daily Challenges</span>
              <span className="ml-auto text-xs text-muted-foreground">
                Refreshes at 00:00 UTC
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-orange-400 transition-transform duration-200 ${
                  dailyChallengesOpen ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">
                {dailyChallengesOpen ? "Collapse" : "Expand"} daily challenges
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-3">
            <button
              onClick={() => setLocation("/daily-challenge")}
              className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-orange-950/30 dark:hover:bg-orange-950/50"
            >
              <span className="shrink-0 text-lg leading-none">🔢</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Sudoku</p>
                <p className="text-xs text-muted-foreground">
                  One shared puzzle per day
                </p>
              </div>
              <span className="shrink-0 text-sm text-orange-400">→</span>
            </button>
            <button
              onClick={() => setLocation("/memory-challenge/")}
              className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-orange-950/30 dark:hover:bg-orange-950/50"
            >
              <span className="shrink-0 text-lg leading-none">🃏</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Memory Match</p>
                <p className="text-xs text-muted-foreground">
                  Daily + weekly challenge
                </p>
              </div>
              <span className="shrink-0 text-sm text-orange-400">→</span>
            </button>
            <button
              onClick={() => setLocation("/jigsaw-challenge")}
              className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-orange-950/30 dark:hover:bg-orange-950/50"
            >
              <Puzzle className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Jigsaw Puzzle</p>
                <p className="text-xs text-muted-foreground">Daily picture challenge</p>
              </div>
              <span className="shrink-0 text-sm text-orange-400">→</span>
            </button>
            <button onClick={() => setLocation("/word-search-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-violet-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-violet-950/20 dark:hover:bg-violet-950/40">
              <span className="shrink-0 text-lg leading-none">🔎</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Word Search</p><p className="text-xs text-muted-foreground">One shared word puzzle each day</p></div><span className="shrink-0 text-sm text-violet-500">→</span>
            </button>
            <button onClick={() => setLocation("/minesweeper-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40">
              <Bomb className="h-5 w-5 shrink-0 text-emerald-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Minesweeper</p><p className="text-xs text-muted-foreground">One shared minefield each day</p></div><span className="shrink-0 text-sm text-emerald-500">→</span>
            </button>
            <button onClick={() => setLocation("/slide-puzzle-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-sky-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-sky-950/20 dark:hover:bg-sky-950/40">
              <Grid3x3 className="h-5 w-5 shrink-0 text-sky-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Slide Puzzle</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-sky-500">→</span>
            </button>
            {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
              const subject = QUIZ_SUBJECTS[id];
              return (
                <button key={id} onClick={() => setLocation(`/quiz-challenge?subject=${id}`)} className={`flex w-full items-center gap-3 rounded-xl border bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:hover:brightness-110 ${subject.theme.border}`}>
                  <span className="shrink-0 text-lg leading-none">{subject.emoji}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{subject.shortName} Quiz</p><p className="text-xs text-muted-foreground">One shared {subject.shortName.toLowerCase()} quiz each day</p></div><span className={`shrink-0 text-sm ${subject.theme.text}`}>→</span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

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
            Play Brain Games . Online
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
            <div className="group relative isolate overflow-hidden rounded-2xl border-2 border-primary/55 bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100 shadow-xl shadow-primary/20 ring-1 ring-inset ring-white/70 dark:from-cyan-950/80 dark:via-sky-950/75 dark:to-indigo-950/80 dark:ring-white/10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-primary to-indigo-500"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15"
              />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-3 grid h-32 w-32 rotate-6 grid-cols-3 overflow-hidden rounded-2xl border-2 border-primary/15 bg-white/20 opacity-60 dark:bg-white/5"
            >
              {[5, 2, 8, 1, 7, 3, 9, 4, 6].map((digit, index) => (
                <span
                  key={index}
                  className="flex items-center justify-center border border-primary/10 text-lg font-black text-primary/20"
                >
                  {digit}
                </span>
              ))}
            </div>
              <button
                onClick={() => setLocation("/sudoku")}
                className="relative z-10 w-full text-left p-6 space-y-4 transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Grid3X3 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif">Sudoku</h2>
                    <p className="text-xs text-muted-foreground">
                      Numbers · letters · image icons
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fill the grid so every row, column, and box contains each
                  symbol exactly once.
                </p>
                <div className="flex gap-1">
                  <span className="mr-1 inline-flex h-[22px] w-[22px] items-center justify-center rounded bg-primary/10 text-xs font-black text-primary">1</span>
                  <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded bg-primary/10 text-xs font-black text-primary">A</span>
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
                      onClick={() =>
                        setLocation(
                          sudokuGamePath(
                            activeGame.puzzle?.gridSize ?? 9,
                            activeGame.puzzle?.difficulty ?? "easy",
                            activeGame.id,
                          ),
                        )
                      }
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
                <div className="group relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-fuchsia-100 via-violet-50 to-amber-100 shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 dark:from-fuchsia-950/75 dark:via-violet-950/80 dark:to-amber-950/60 dark:ring-white/10">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-fuchsia-300/35 blur-2xl dark:bg-fuchsia-400/15"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-3 h-28 w-20 rotate-12 rounded-xl border-2 border-violet-300/20 bg-violet-100/30 opacity-50 shadow-sm dark:border-violet-300/10 dark:bg-violet-300/5"
                  >
                    <div className="flex h-full items-center justify-center text-4xl font-black text-violet-700/15 dark:text-violet-200/10">
                      ?
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-14 top-6 h-28 w-20 -rotate-6 rounded-xl border-2 border-violet-300/25 bg-violet-50/45 opacity-55 shadow-sm dark:border-violet-300/10 dark:bg-violet-200/5"
                  >
                    <div className="flex h-full items-center justify-center">
                      <Copy className="h-10 w-10 text-violet-700/25 dark:text-violet-200/15" />
                    </div>
                  </div>
                  <button
                    onClick={() => setLocation("/memory/")}
                    className="relative z-10 w-full text-left p-6 space-y-4 transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-400/20">
                        <Copy className="h-8 w-8 text-violet-600 dark:text-violet-400" />
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
                    <IconSetPreview themeId={themeId} />
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
                              ? "8×4"
                              : "8×8";
                      return (
                        <button
                          onClick={() => setLocation("/memory/")}
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
                          <span className="mt-0.5 text-[10px] text-muted-foreground leading-none">
                            {opt.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setLocation("/memory/")} className="mt-3 text-[10px] font-semibold text-violet-600/75 underline underline-offset-2 transition-colors hover:text-violet-600 dark:text-violet-400/75 dark:hover:text-violet-300">More options →</button>
                  </div>
                  <div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                    title="Available"
                  />
                </div>
              );
            })()}

            {/* Jigsaw Puzzle Card */}
            <div className="group relative isolate overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 shadow-xl shadow-amber-500/20 ring-1 ring-inset ring-white/70 dark:from-orange-950/75 dark:via-amber-950/80 dark:to-yellow-950/60 dark:ring-white/10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-orange-300/35 blur-2xl dark:bg-orange-400/15"
              />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 flex h-24 w-24 rotate-12 items-center justify-center rounded-2xl border-2 border-amber-500/15 bg-amber-300/10 opacity-70 dark:bg-amber-300/5">
                <Puzzle className="h-16 w-16 text-amber-700/15 dark:text-amber-200/15" />
              </div>
              <button
                onClick={() => setLocation("/jigsaw")}
                className="relative z-10 w-full text-left p-6 space-y-4 transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20">
                    <Puzzle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif">Jigsaw Puzzle</h2>
                    <p className="text-xs text-muted-foreground">
                      Picture puzzle
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose a picture and board size, then assemble the pieces at
                  your own pace.
                </p>
                <IconSetPreview themeId={themeId} />
              </button>
              <div className="px-6 pb-5 pt-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {visibleJigsawSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setLocation(`/jigsaw?gridSize=${size}&level=1&imageKey=1&play=1`)}
                      className="flex flex-col items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all py-2 px-1 cursor-pointer min-h-[52px]"
                    >
                      <span className="font-bold text-xs leading-none text-amber-600 dark:text-amber-400">
                        {size}×{size}
                      </span>
                      <span className="mt-1 text-[10px] leading-none text-muted-foreground">
                        {size * size} pieces
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setLocation("/jigsaw")}
                  className="text-[10px] text-amber-600/70 hover:text-amber-600 dark:text-amber-400/70 dark:hover:text-amber-400 underline underline-offset-2 transition-colors"
                >
                  More options (level, image) →
                </button>
              </div>
              {canResumeJigsaw && jigsawSession && (
                <button
                  onClick={() => setLocation("/jigsaw?resume=1")}
                  className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-400/25 px-3 py-2 text-left hover:bg-amber-500/20 transition-colors w-[calc(100%-3rem)]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Resume in progress
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {jigsawSession.gridSize}×{jigsawSession.gridSize} · {jigsawSession.moves} moves
                  </span>
                </button>
              )}
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </div>
            <section className="group relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-pink-100 text-left shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 transition hover:border-violet-500/80 dark:from-violet-950/75 dark:via-fuchsia-950/70 dark:to-pink-950/60 dark:ring-white/10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-fuchsia-300/35 blur-2xl dark:bg-fuchsia-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-violet-400/15 bg-white/15 opacity-60 dark:bg-white/5">{"WORDSEARCH".slice(0, 9).split("").map((letter, index) => <span key={index} className="flex items-center justify-center border border-violet-400/10 text-sm font-black text-violet-700/25 dark:text-violet-200/20">{letter}</span>)}</div>
              <button onClick={() => setLocation("/word-search")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-400/20 dark:text-violet-300"><Search className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Word Search</h2><p className="text-xs text-muted-foreground">Hidden word puzzle</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Find themed words hidden across, down, and diagonally. Pick a level to start.</p>
                <IconSetPreview themeId={themeId} />
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {visibleWordSearchLevels.map((level) => <button key={level} onClick={() => launchWordSearch(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/5 px-1 py-2 text-center transition-all hover:border-violet-400/40 hover:bg-violet-500/15"><span className="text-xs font-bold leading-none text-violet-600 dark:text-violet-400">{WORD_SEARCH_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{WORD_SEARCH_LEVELS[level].size}×{WORD_SEARCH_LEVELS[level].size} · {WORD_SEARCH_LEVELS[level].wordCount} words</span></button>)}
                </div>
                <button onClick={() => setLocation("/word-search")} className="mt-3 text-xs font-semibold text-violet-800 underline underline-offset-2 dark:text-violet-200">More options and themes</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className="group relative isolate overflow-hidden rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 text-left shadow-xl shadow-emerald-500/20 ring-1 ring-inset ring-white/70 transition hover:border-emerald-500/80 dark:from-emerald-950/75 dark:via-teal-950/70 dark:to-cyan-950/60 dark:ring-white/10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-teal-300/35 blur-2xl dark:bg-teal-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-emerald-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["1", "💣", "1", "", "2", "1", "🚩", "", "3"].map((cell, index) => <span key={index} className="flex items-center justify-center border border-emerald-400/10 text-sm font-black text-emerald-700/25 dark:text-emerald-200/20">{cell}</span>)}</div>
              <button onClick={() => setLocation("/minesweeper")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-400/20 dark:text-emerald-300"><Bomb className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Minesweeper</h2><p className="text-xs text-muted-foreground">Clear the minefield</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Reveal every safe cell and dodge the mines. Pick a board size and mine count to start.</p>
                <IconSetPreview themeId={themeId} />
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {visibleMinesweeperLevels.map((level) => <button key={level} onClick={() => launchMinesweeper(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-1 py-2 text-center transition-all hover:border-emerald-400/40 hover:bg-emerald-500/15"><span className="text-xs font-bold leading-none text-emerald-700 dark:text-emerald-300">{MINESWEEPER_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{MINESWEEPER_LEVELS[level].size}×{MINESWEEPER_LEVELS[level].size} · {MINESWEEPER_LEVELS[level].mines} mines</span></button>)}
                </div>
                <button onClick={() => setLocation("/minesweeper")} className="mt-3 text-xs font-semibold text-emerald-800 underline underline-offset-2 dark:text-emerald-200">More options and themes</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className="group relative isolate overflow-hidden rounded-2xl border-2 border-sky-400/60 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 text-left shadow-xl shadow-sky-500/20 ring-1 ring-inset ring-white/70 transition hover:border-sky-500/80 dark:from-sky-950/75 dark:via-cyan-950/70 dark:to-blue-950/60 dark:ring-white/10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-sky-400/15 bg-white/15 opacity-60 dark:bg-white/5">{[1, 2, 3, 4, 0, 5, 7, 8, 6].map((tile, index) => <span key={index} className="flex items-center justify-center border border-sky-400/10 text-sm font-black text-sky-700/25 dark:text-sky-200/20">{tile === 0 ? "·" : tile}</span>)}</div>
              <button onClick={() => setLocation("/slide-puzzle")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-600/10 text-sky-600 ring-1 ring-sky-400/20 dark:text-sky-300"><Grid3x3 className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Slide Puzzle</h2><p className="text-xs text-muted-foreground">Slide tiles into order</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Slide every tile back into place across four board sizes, with numbers, letters, or pictures. Pick a size to start.</p>
                <IconSetPreview themeId={themeId} />
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {visibleSlidePuzzleLevels.map((level) => <button key={level} onClick={() => launchSlidePuzzle(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/5 px-1 py-2 text-center transition-all hover:border-sky-400/40 hover:bg-sky-500/15"><span className="text-xs font-bold leading-none text-sky-700 dark:text-sky-300">{SLIDE_PUZZLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SLIDE_PUZZLE_LEVELS[level].size}×{SLIDE_PUZZLE_LEVELS[level].size} · {SLIDE_PUZZLE_LEVELS[level].tiles} tiles</span></button>)}
                </div>
                <button onClick={() => setLocation("/slide-puzzle")} className="mt-3 text-xs font-semibold text-sky-800 underline underline-offset-2 dark:text-sky-200">More options and tile styles</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
              const subject = QUIZ_SUBJECTS[id];
              const levels = visibleQuizLevelsFor(id);
              return (
            <section key={id} className={`group relative isolate overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} text-left shadow-xl ring-1 ring-inset ring-white/70 transition hover:brightness-[1.02] dark:ring-white/10`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: subject.theme.hex }} />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full blur-2xl dark:blur-3xl" style={{ backgroundColor: `${subject.theme.hex}59` }} />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border bg-white/15 p-1.5 opacity-60 dark:bg-white/5" style={{ borderColor: `${subject.theme.hex}26` }}>{["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => <span key={letter} className="flex items-center justify-center rounded-md border text-sm font-black" style={{ borderColor: `${subject.theme.hex}1a`, color: `${subject.theme.hex}40` }}>{letter}</span>)}</div>
              <button onClick={() => setLocation(`/quiz/${id}`)} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${subject.theme.soft}`} style={{ boxShadow: `0 0 0 1px ${subject.theme.hex}33` }}>{subject.emoji}</span><div><h2 className="font-serif text-xl font-bold">{subject.shortName} Quiz</h2><p className="text-xs text-muted-foreground">{subject.tagline}</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Timed multiple-choice questions across four levels. Pick a level to start.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {levels.map((level) => <button key={level} onClick={() => launchQuiz(id, level)} className={`flex min-h-[52px] flex-col items-center justify-center rounded-lg border bg-white/60 px-1 py-2 text-center transition-all hover:bg-white dark:bg-slate-950/30 dark:hover:bg-slate-950/50 ${subject.theme.border} ${subject.theme.hover}`}><span className={`text-xs font-bold leading-none ${subject.theme.strong}`}>{subject.levels[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{subject.levels[level].detail}</span></button>)}
                </div>
                <button onClick={() => setLocation(`/quiz/${id}`)} className="mt-3 text-xs font-semibold underline underline-offset-2" style={{ color: subject.theme.hex }}>More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
              );
            })}
          </div>
        </div>

        {/* Daily Challenges (desktop) */}
        <Collapsible
          open={dailyChallengesOpen}
          onOpenChange={setDailyChallengesOpen}
          className="rounded-2xl border-2 border-orange-200/70 bg-gradient-to-r from-orange-50 to-amber-50 p-5 dark:border-orange-800/30 dark:from-orange-950/20 dark:to-amber-950/20"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-expanded={dailyChallengesOpen}
              className="flex w-full items-center gap-2 text-left"
            >
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold">Daily Challenges</span>
              <span className="ml-auto text-xs text-muted-foreground">
                Same puzzle for everyone · Refreshes at 00:00 UTC
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-orange-400 transition-transform duration-200 ${
                  dailyChallengesOpen ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">
                {dailyChallengesOpen ? "Collapse" : "Expand"} daily challenges
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <button
                onClick={() => setLocation("/daily-challenge")}
                className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-orange-950/30 dark:hover:bg-orange-950/50"
              >
                <span className="shrink-0 text-2xl leading-none">🔢</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Sudoku</p>
                  <p className="text-xs text-muted-foreground">
                    One shared puzzle per day
                  </p>
                </div>
                <span className="shrink-0 text-orange-400">→</span>
              </button>
              <button
                onClick={() => setLocation("/memory-challenge/")}
                className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-orange-950/30 dark:hover:bg-orange-950/50"
              >
                <span className="shrink-0 text-2xl leading-none">🃏</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Memory Match</p>
                  <p className="text-xs text-muted-foreground">
                    Daily + weekly challenge
                  </p>
                </div>
                <span className="shrink-0 text-orange-400">→</span>
              </button>
              <button
                onClick={() => setLocation("/jigsaw-challenge")}
                className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-orange-950/30 dark:hover:bg-orange-950/50"
              >
                <Puzzle className="h-6 w-6 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Jigsaw Puzzle</p>
                  <p className="text-xs text-muted-foreground">Daily picture challenge</p>
                </div>
                <span className="shrink-0 text-orange-400">→</span>
              </button>
              <button onClick={() => setLocation("/word-search-challenge")} className="flex items-center gap-3 rounded-xl border border-violet-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-violet-950/20 dark:hover:bg-violet-950/40">
                <span className="shrink-0 text-2xl leading-none">🔎</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Word Search</p><p className="text-xs text-muted-foreground">One shared word puzzle each day</p></div><span className="shrink-0 text-violet-500">→</span>
              </button>
              <button onClick={() => setLocation("/minesweeper-challenge")} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40">
                <Bomb className="h-6 w-6 shrink-0 text-emerald-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Minesweeper</p><p className="text-xs text-muted-foreground">One shared minefield each day</p></div><span className="shrink-0 text-sm text-emerald-500">→</span>
              </button>
              <button onClick={() => setLocation("/slide-puzzle-challenge")} className="flex items-center gap-3 rounded-xl border border-sky-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-sky-950/20 dark:hover:bg-sky-950/40">
                <Grid3x3 className="h-6 w-6 shrink-0 text-sky-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Slide Puzzle</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-sky-500">→</span>
              </button>
              {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
                const subject = QUIZ_SUBJECTS[id];
                return (
                  <button key={id} onClick={() => setLocation(`/quiz-challenge?subject=${id}`)} className={`flex items-center gap-3 rounded-xl border bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:hover:brightness-110 ${subject.theme.border}`}>
                    <span className="shrink-0 text-2xl leading-none">{subject.emoji}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{subject.shortName} Quiz</p><p className="text-xs text-muted-foreground">One shared {subject.shortName.toLowerCase()} quiz each day</p></div><span className={`shrink-0 text-sm ${subject.theme.text}`}>→</span>
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

      </div>

      {/* ═══════════════════════════════════════════════════════════
          GAME INFO CARDS — mobile only (descriptions / discovery)
          shown below the quick launch section
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-6 mt-2">
        {/* Play Brain Games . Online information — combined and collapsed by default */}
        <Collapsible
          open={aboutGamesOpen}
          onOpenChange={setAboutGamesOpen}
          className="rounded-2xl border border-border bg-card p-3"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-expanded={aboutGamesOpen}
              className="w-full flex items-center justify-between gap-3 text-left group"
            >
              <span>
                <span className="block text-base font-serif font-bold tracking-tight leading-tight">
                  Play Brain Games . Online
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">
                  Six classic brain games, endlessly replayable
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  aboutGamesOpen ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">
                {aboutGamesOpen ? "Collapse" : "Expand"} Play Brain Games .
                Online information
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="space-y-3">
              {!profileId && isReady && (
                <p className="text-xs text-muted-foreground">
                  <button
                    className="underline underline-offset-2 transition-colors hover:text-foreground"
                    onClick={() => setLocation("/sign-in")}
                  >
                    Sign in
                  </button>{" "}
                  to sync progress across devices
                </p>
              )}
              <button
                type="button"
                onClick={() => setLocation("/sudoku")}
                className="w-full rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start text-left hover:bg-muted/70 hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Grid3X3 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Sudoku</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Fill the grid so every row, column, and box contains each
                    symbol exactly once. 5 grid sizes, 4 difficulty levels.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLocation("/memory/")}
                className="w-full rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start text-left hover:bg-muted/70 hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-lg mt-0.5 shrink-0">🃏</span>
                <div>
                  <p className="font-semibold text-sm">Memory Match</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Flip cards to find matching pairs. Beat the clock and
                    minimise your flips to maximise your score.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLocation("/jigsaw")}
                className="w-full rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start text-left hover:bg-muted/70 hover:border-amber-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Puzzle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Jigsaw Puzzle</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Kids mode has 2×2 and 3×3; Adult mode has 4×4 and 5×5;
                    default 4 All mode has all four. Choose a level, use tips
                    and previews, and earn points, XP, and gems.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLocation("/word-search")}
                className="w-full rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start text-left hover:bg-muted/70 hover:border-violet-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-lg mt-0.5 shrink-0" aria-hidden>🔎</span>
                <div>
                  <p className="font-semibold text-sm">Word Search</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Find theme-based words hidden in a letter grid. Choose one of four levels and resume your puzzle later.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLocation("/minesweeper")}
                className="w-full rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start text-left hover:bg-muted/70 hover:border-emerald-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Bomb className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Minesweeper</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Reveal safe cells and dodge the mines across four board sizes. Kids mode gets the small boards, Adult mode the big ones — hit three mines and it&apos;s over.
                  </p>
                </div>
              </button>
            </div>
          </CollapsibleContent>
        </Collapsible>

      </div>

      <MobileContentDisclosure
        id="portal-game-guidance"
        title="More about Play Brain Games"
        className="mt-3 rounded-2xl border border-border bg-card p-3 md:p-5"
      >
      <section className="space-y-5 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            Choose a puzzle, then adjust the challenge
          </h2>
          <p className="mt-2">
            Play Brain Games . Online brings together six games that reward
            different kinds of attention. Sudoku asks you to compare rows,
            columns, and boxes before placing a symbol. Memory Match asks you to
            remember where cards appeared. Jigsaw asks you to rebuild a picture
            piece by piece. Word Search asks you to spot hidden words inside a
            letter grid. Minesweeper asks you to clear every safe cell without
            touching a mine. Slide Puzzle asks you to slide every tile back
            into order. All six can be started in a browser without
            creating an account.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-foreground">Choosing a Sudoku board</h3>
            <p className="mt-1">
              Start with a 3×3 Baby, 4×4 Mini, or 6×6 Dual grid if you want fewer
              cells to track. The 9×9 Classic board is the familiar standard,
              while 16×16 Pro gives experienced players a larger symbol set.
              Easy, medium, hard, and expert settings let you change the puzzle
              difficulty separately from its size.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">A steady Sudoku routine</h3>
            <p className="mt-1">
              Check a row, column, or box with only a few empty cells. List the
              symbols it still needs, then rule out any candidate already used
              by an intersecting group. Place a symbol only when the remaining
              constraints support it; use pencil notes when a cell still has
              several possibilities.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Remember card positions</h3>
            <p className="mt-1">
              In Memory Match, turn over two cards at a time. A pair stays
              visible; a mismatch turns face-down again, so remember both
              locations before moving on. A consistent scan—such as working
              across each row—can make it easier to recall where a symbol was
              seen.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Rebuild a Jigsaw picture</h3>
            <p className="mt-1">
              Choose a 2×2 to 5×5 board. Kids mode offers 2×2 and 3×3, Adult
              offers 4×4 and 5×5, and default 4 All mode offers every size.
              Drag pieces into empty spaces or tap two pieces to swap them.
              Easy keeps the reference visible,
              Medium gives three short previews, and Hard hides the reference.
              Tips can reveal piece information; efficient moves and fewer
              assists help protect your score.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Hunt words in the grid</h3>
            <p className="mt-1">
              In Word Search, themed words hide in straight lines across,
              down, and — on Medium and Hard — diagonally, including backwards.
              Press on a word&apos;s first letter and drag to its last to
              reveal it. Four levels range from a quick 6×6 Beginner grid to a
              14×14 Hard board, each with its own word theme. Fewer tries and
              hints keep your score high.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Sweep the minefield safely</h3>
            <p className="mt-1">
              In Minesweeper, every revealed number counts the mines touching
              that cell. Flag the cells you believe are mined, reveal the rest,
              and clear every safe cell to win — hitting three mines ends the
              game. Beginner (6×6, 5 mines) and Easy (8×8, 12 mines) suit quick
              rounds, while Medium (12×12, 24 mines) and Hard (14×14, 34 mines)
              reward careful deduction. Click a revealed number with enough
              flags around it to clear its neighbours at once.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Slide every tile into place</h3>
            <p className="mt-1">
              In Slide Puzzle, one gap lets you slide neighbouring tiles one
              space at a time until the board reads in order. Boards come in
              2×2, 3×3, 4×4, and 5×5 — the two smaller sizes suit Kids mode,
              the two larger suit Adult mode. Tiles can show numbers, alphabet
              letters, or pictures from the icon themes. Work row by row, use
              the hint only when truly stuck, and finish quickly with few moves
              for the best score.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Choose symbols and track progress</h3>
            <p className="mt-1">
              Smaller Sudoku boards also support letter or image-symbol play,
              and Memory Match can use numbers, letters, or themed icons. These
              styles change what you see, not the rules. Guest play is available
              immediately; optional Google sign-in syncs profile progress and
              statistics across devices.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4">
          <Link href="/sudoku" className="font-semibold text-primary underline-offset-2 hover:underline">
            Sudoku setup
          </Link>
          <Link href="/memory/" className="font-semibold text-primary underline-offset-2 hover:underline">
            Memory Match setup
          </Link>
          <Link href="/jigsaw" className="font-semibold text-primary underline-offset-2 hover:underline">
            Jigsaw setup
          </Link>
          <Link href="/word-search" className="font-semibold text-primary underline-offset-2 hover:underline">
            Word Search setup
          </Link>
          <Link href="/minesweeper" className="font-semibold text-primary underline-offset-2 hover:underline">
            Minesweeper setup
          </Link>
          <Link href="/slide-puzzle" className="font-semibold text-primary underline-offset-2 hover:underline">
            Slide Puzzle setup
          </Link>
          <Link href="/guides/" className="font-semibold text-primary underline-offset-2 hover:underline">
            Read the puzzle guides
          </Link>
          <Link href="/daily-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Sudoku challenge
          </Link>
          <Link href="/jigsaw-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Jigsaw challenge
          </Link>
        </div>
      </section>
      </MobileContentDisclosure>
    </div>
  );
}
