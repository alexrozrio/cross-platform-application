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
  ChevronRight,
  Puzzle,
  Search,
  Bomb,
  Grid3x3,
  Copy,
  Images,
  List,
  LayoutGrid,
  LayoutDashboard,
  X,
  Box,
  LetterText,
  type LucideIcon,
} from "lucide-react";
import { Snake } from "@/components/snake-icon";
import { customFetch, useGetProfile } from "@workspace/api-client-react";
import { generateOfflinePuzzle } from "@/lib/sudoku-generator";
import { getLevelFromXp } from "@/lib/levels";
import { getTheme } from "@/lib/themes";
import { sudokuGamePath } from "@/lib/sudoku-routes";
import { usePortalNativeAd } from "@/lib/native-portal-ad";
import { WORD_SEARCH_LEVELS, type WordSearchDifficulty } from "@/lib/word-search";
import { MINESWEEPER_LEVELS, type MinesweeperDifficulty } from "@/lib/minesweeper";
import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty } from "@/lib/slide-puzzle";
import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";
import { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";
import { SNAKE_LEVELS, type SnakeDifficulty } from "@/lib/snake";
import { ODD_IMAGE_LEVELS, ODD_IMAGE_LEVEL_ORDER, type OddImageLevel } from "@/lib/odd-images";
import { RUBIKS_LEVELS, RUBIKS_VISIBLE } from "@/lib/rubiks";
import { QUIZ_LEVELS, QUIZ_SUBJECTS, quizGameId, type QuizLevel, type QuizSubject } from "@/lib/quiz";
import { GAME_ICONS, gameIconColor } from "@/lib/game-icons";
import {
  getLastPlayedDifficulty,
  LAST_GRID_SIZE_KEY,
  rememberSudokuDifficulty,
} from "@/lib/sudoku-preferences";
import {
  JIGSAW_SESSION_STORAGE_KEY,
  JIGSAW_SIZE_NAMES,
  jigsawSizeLabel,
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

type PortalGameView = "box" | "grid" | "list";

interface PortalGameEntry {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  /** Icon color class. */
  color: string;
  /** Soft background for the list-view icon chip. */
  chip: string;
  /** Colorful gradient for the grid-view tile. */
  gradient: string;
  tagline: string;
  desc: string;
  keywords?: string;
}

const FEATURED_GAME_IDS = new Set(["sudoku", "memory", "jigsaw", "word-search", "minesweeper", "slide-puzzle", "game-2048", "jumble", "snake", "odd-images", "science-quiz", "maths-quiz", "gk-quiz"]);

const PORTAL_GAMES: PortalGameEntry[] = [
  {
    id: "sudoku", name: "Sudoku", href: "/sudoku",
    icon: GAME_ICONS.sudoku, color: gameIconColor("sudoku"), chip: "bg-primary/10",
    gradient: "from-cyan-100 via-sky-50 to-indigo-100 dark:from-cyan-950/80 dark:via-sky-950/75 dark:to-indigo-950/80",
    tagline: "Numbers · letters · icons",
    desc: "Fill the grid so every row, column, and box contains each symbol exactly once. 5 grid sizes, 4 difficulty levels.",
    keywords: "number puzzle grid",
  },
  {
    id: "memory", name: "Memory Match", href: "/memory/",
    icon: GAME_ICONS.memory, color: gameIconColor("memory"), chip: "bg-violet-100 dark:bg-violet-950/60",
    gradient: "from-fuchsia-100 via-violet-50 to-amber-100 dark:from-fuchsia-950/75 dark:via-violet-950/80 dark:to-amber-950/60",
    tagline: "Card matching",
    desc: "Flip cards to find matching pairs. Beat the clock and minimise your flips to maximise your score.",
    keywords: "pairs cards concentration",
  },
  {
    id: "jigsaw", name: "Jigsaw Puzzle", href: "/jigsaw",
    icon: GAME_ICONS.jigsaw, color: gameIconColor("jigsaw"), chip: "bg-amber-100 dark:bg-amber-950/60",
    gradient: "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/70 dark:via-orange-950/65 dark:to-yellow-950/70",
    tagline: "Picture puzzle",
    desc: "Rebuild a picture piece by piece on 2×2 to 5×5 boards. Choose a level, use tips and previews, and earn points, XP, and gems.",
    keywords: "pieces picture",
  },
  {
    id: "word-search", name: "Word Search", href: "/word-search",
    icon: GAME_ICONS["word-search"], color: gameIconColor("word-search"), chip: "bg-fuchsia-100 dark:bg-fuchsia-950/60",
    gradient: "from-violet-100 via-fuchsia-50 to-pink-100 dark:from-violet-950/75 dark:via-fuchsia-950/70 dark:to-pink-950/60",
    tagline: "Hidden words",
    desc: "Find theme-based words hidden in a letter grid. Choose one of four levels and resume your puzzle later.",
    keywords: "letters find words",
  },
  {
    id: "minesweeper", name: "Minesweeper", href: "/minesweeper",
    icon: GAME_ICONS.minesweeper, color: gameIconColor("minesweeper"), chip: "bg-emerald-100 dark:bg-emerald-950/60",
    gradient: "from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950/75 dark:via-teal-950/70 dark:to-cyan-950/60",
    tagline: "Clear the field",
    desc: "Reveal safe cells and dodge the mines across four board sizes. Kids mode gets the small boards, Adult mode the big ones — hit three mines and it's over.",
    keywords: "mines flags grid",
  },
  {
    id: "slide-puzzle", name: "Slide Puzzle", href: "/slide-puzzle",
    icon: GAME_ICONS["slide-puzzle"], color: gameIconColor("slide-puzzle"), chip: "bg-sky-100 dark:bg-sky-950/60",
    gradient: "from-sky-100 via-cyan-50 to-blue-100 dark:from-sky-950/75 dark:via-cyan-950/70 dark:to-blue-950/60",
    tagline: "Slide to order",
    desc: "Slide tiles into order on boards from 2×2 to 5×5 — numbers, letters, or pictures. Finish under par with few moves for bonus points.",
    keywords: "tiles 15 puzzle",
  },
  {
    id: "game-2048", name: "2048", href: "/game-2048",
    icon: GAME_ICONS["game-2048"], color: gameIconColor("game-2048"), chip: "bg-orange-100 dark:bg-orange-950/60",
    gradient: "from-orange-100 via-amber-50 to-yellow-100 dark:from-orange-950/75 dark:via-amber-950/70 dark:to-yellow-950/60",
    tagline: "Merge & reach 2048",
    desc: "Slide and merge numbered tiles on boards from 3×3 to 6×6. Reach the target tile before you run out of moves — daily challenges and duels included.",
    keywords: "merge numbers tiles",
  },
  {
    id: "jumble", name: "Jumble Words", href: "/jumble",
    icon: GAME_ICONS.jumble, color: gameIconColor("jumble"), chip: "bg-cyan-100 dark:bg-cyan-950/60",
    gradient: "from-cyan-100 via-sky-50 to-blue-100 dark:from-cyan-950/75 dark:via-sky-950/70 dark:to-blue-950/60",
    tagline: "Unscramble the word",
    desc: "Jumbled English letters hide a real word — rebuild it letter by letter across four levels with growing word counts and difficulty.",
    keywords: "anagram letters word",
  },
  {
    id: "snake", name: "Snake", href: "/snake",
    icon: GAME_ICONS.snake, color: gameIconColor("snake"), chip: "bg-green-100 dark:bg-green-950/60",
    gradient: "from-green-100 via-emerald-50 to-teal-100 dark:from-green-950/75 dark:via-emerald-950/70 dark:to-teal-950/60",
    tagline: "Eat & grow",
    desc: "Guide the classic Nokia snake to eat food and grow — four speeds and grid sizes, Kids and Adult modes, daily challenges and duels.",
    keywords: "snake eat grow classic",
  },
  {
    id: "odd-images", name: "Odd Images", href: "/odd-images",
    icon: GAME_ICONS["odd-images"], color: gameIconColor("odd-images"), chip: "bg-teal-100 dark:bg-teal-950/60",
    gradient: "from-teal-100 via-cyan-50 to-sky-100 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60",
    tagline: "Spot the difference",
    desc: "Find the one image that does not belong in each grid. Grid size and question count grow from Easy to Expert.",
    keywords: "different image grid vision",
  },
  ...(RUBIKS_VISIBLE ? [{
    id: "rubiks", name: "Rubik's Cube", href: "/rubiks",
    icon: GAME_ICONS.rubiks, color: gameIconColor("rubiks"), chip: "bg-rose-100 dark:bg-rose-950/60",
    gradient: "from-rose-100 via-pink-50 to-orange-100 dark:from-rose-950/75 dark:via-pink-950/70 dark:to-orange-950/60",
    tagline: "Twist and solve",
    desc: "Solve the Pocket Cube (2×2), classic Rubik's Cube (3×3), Pyraminx and Rubik's Revenge (4×4) against the clock — with daily challenges and duels.",
    keywords: "cube twist turns 3d",
  }] : []),
  ...(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id): PortalGameEntry => {
    const subject = QUIZ_SUBJECTS[id];
    return {
      id: quizGameId(id), name: `${subject.shortName} Quiz`, href: `/quiz/${id}`,
      icon: GAME_ICONS[quizGameId(id)], color: gameIconColor(quizGameId(id)), chip: subject.theme.soft,
      gradient: `${subject.gradient} ${subject.gradientDark}`,
      tagline: subject.tagline,
      desc: `Timed ${subject.name.toLowerCase()} questions — four levels from 5 to 12 questions. Answer fast and accurately to maximise points, XP, and gems.`,
      keywords: `${subject.name} trivia questions`,
    };
  }),
];

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
  usePortalNativeAd();
  const landingPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Play Brain Games . Online",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description:
      "Play thirteen free games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, guest play, and optional synced progress.",
    url: new URL("/", window.location.origin).toString(),
  };
  usePageMeta({
    title: "Free Puzzle & Quiz Games Online | Play Brain Games . Online",
    description:
      "Play free browser-based Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes. Choose a game, join daily challenges, and play as a guest or sync progress.",
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
    { size: 2, label: "Easy", sub: "4 pairs" },
    { size: 4, label: "Medium", sub: "8 pairs" },
    { size: 6, label: "Hard", sub: "16 pairs" },
    { size: 8, label: "Expert", sub: "32 pairs" },
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
  const visibleGame2048Levels: Game2048Difficulty[] = (["3x3", "4x4", "5x5", "6x6"] as Game2048Difficulty[]).filter((level) =>
    gameMode === "children" ? GAME_2048_LEVELS[level].mode === "baby" : gameMode === "adult" ? GAME_2048_LEVELS[level].mode === "adult" : true,
  );
  const launchGame2048 = (difficulty: Game2048Difficulty) =>
    setLocation(`/game-2048?start=1&difficulty=${difficulty}`);
  const visibleJumbleLevels: JumbleDifficulty[] = (["easy", "medium", "hard", "expert"] as JumbleDifficulty[]).filter((level) =>
    gameMode === "children" ? JUMBLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? JUMBLE_LEVELS[level].mode === "adult" : true,
  );
  const launchJumble = (difficulty: JumbleDifficulty) =>
    setLocation(`/jumble?start=1&difficulty=${difficulty}`);
  const visibleSnakeLevels: SnakeDifficulty[] = (["easy", "medium", "hard", "expert"] as SnakeDifficulty[]).filter((level) =>
    gameMode === "children" ? SNAKE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SNAKE_LEVELS[level].mode === "adult" : true,
  );
  const launchSnake = (difficulty: SnakeDifficulty) =>
    setLocation(`/snake?start=1&difficulty=${difficulty}`);
  const visibleOddImageLevels: OddImageLevel[] = ODD_IMAGE_LEVEL_ORDER.filter((level) =>
    gameMode === "children" ? ODD_IMAGE_LEVELS[level].mode === "baby" : gameMode === "adult" ? ODD_IMAGE_LEVELS[level].mode === "adult" : true,
  );
  const launchOddImages = (level: OddImageLevel) =>
    setLocation(`/odd-images?start=1&level=${level}`);
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
  const [gameView, setGameViewState] = useState<PortalGameView>("box");
  const [gameSearch, setGameSearch] = useState("");
  const gameViewStorageKey = `brain-games-portal-view-${profileId ?? "guest"}`;
  const gameViewLoaded = React.useRef(false);

  // Restore this user's last selected view once auth resolves.
  useEffect(() => {
    if (!isReady || gameViewLoaded.current) return;
    gameViewLoaded.current = true;
    try {
      const saved = localStorage.getItem(gameViewStorageKey);
      if (saved === "list" || saved === "grid" || saved === "box") setGameViewState(saved);
    } catch { /* ignore */ }
  }, [isReady, profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setGameView = (view: PortalGameView) => {
    setGameViewState(view);
    try { localStorage.setItem(gameViewStorageKey, view); } catch { /* ignore */ }
  };

  // Search always starts empty each time the home screen is opened.
  useEffect(() => {
    setGameSearch("");
  }, []);

  const gameQuery = gameSearch.trim().toLowerCase();
  const filteredGames = gameQuery
    ? PORTAL_GAMES.filter(
        (game) =>
          game.name.toLowerCase().includes(gameQuery) ||
          game.keywords?.toLowerCase().includes(gameQuery),
      )
    : PORTAL_GAMES;
  const matchesGame = (id: string) => filteredGames.some((game) => game.id === id);
  const extraPortalGames = filteredGames.filter((game) => !FEATURED_GAME_IDS.has(game.id));
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
        <GameViewToolbar view={gameView} onViewChange={setGameView} search={gameSearch} onSearchChange={setGameSearch} />
        {gameView === "box" ? (
        <>
        {/* Sudoku quick launch — featured game */}
        <div className={`relative isolate overflow-hidden rounded-2xl border-2 border-primary/55 bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100 p-4 space-y-3 shadow-xl shadow-primary/20 ring-1 ring-inset ring-white/70 dark:from-cyan-950/80 dark:via-sky-950/75 dark:to-indigo-950/80 dark:ring-white/10 ${matchesGame("sudoku") ? "" : "hidden"}`}>
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
        <div className={`relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-fuchsia-100 via-violet-50 to-amber-100 p-4 space-y-3 shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 dark:from-fuchsia-950/75 dark:via-violet-950/80 dark:to-amber-950/60 dark:ring-white/10 ${matchesGame("memory") ? "" : "hidden"}`}>
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
                {jigsawSizeLabel(jigsawSession.gridSize)} · {jigsawSession.moves} moves · {jigsawSessionTime}
              </span>
            </span>
            <span className="shrink-0 text-sm text-primary">→</span>
          </button>
        )}

        {/* Jigsaw Puzzle quick launch */}
        <div className={`relative isolate overflow-hidden rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 space-y-3 shadow-xl shadow-amber-500/15 ring-1 ring-inset ring-white/70 dark:from-amber-950/70 dark:via-orange-950/65 dark:to-yellow-950/70 dark:ring-white/10 ${matchesGame("jigsaw") ? "" : "hidden"}`}>
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
                <span className="font-bold text-base leading-none text-amber-700">{JIGSAW_SIZE_NAMES[size]}</span>
                <span className="mt-1 text-xs leading-none text-muted-foreground">{size * size} pieces</span>
              </button>
            ))}
          </div>
        </div>

        {/* Word Search quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-pink-100 p-4 shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 dark:from-violet-950/75 dark:via-fuchsia-950/70 dark:to-pink-950/60 dark:ring-white/10 ${matchesGame("word-search") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-fuchsia-300/35 blur-2xl dark:bg-fuchsia-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-violet-400/15 bg-white/15 opacity-60 dark:bg-white/5">{"WORDSEARCH".slice(0, 9).split("").map((letter, index) => <span key={index} className="flex items-center justify-center border border-violet-400/10 text-xs font-black text-violet-700/25 dark:text-violet-200/20">{letter}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md"><Search className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Word Search</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700 shadow-sm dark:bg-slate-950/30 dark:text-violet-300">Hidden words</span></div></div><button onClick={() => setLocation("/word-search")} className="rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-violet-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Find hidden words in the letter grid.</p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleWordSearchLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleWordSearchLevels.map((level) => <button key={level} onClick={() => launchWordSearch(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-violet-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-violet-700 dark:text-violet-300">{WORD_SEARCH_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{WORD_SEARCH_LEVELS[level].wordCount} words</span></button>)}
          </div>
        </section>

        {/* Minesweeper quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 p-4 shadow-xl shadow-emerald-500/20 ring-1 ring-inset ring-white/70 dark:from-emerald-950/75 dark:via-teal-950/70 dark:to-cyan-950/60 dark:ring-white/10 ${matchesGame("minesweeper") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-teal-300/35 blur-2xl dark:bg-teal-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-emerald-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["1", "💣", "1", "", "2", "1", "🚩", "", "3"].map((cell, index) => <span key={index} className="flex items-center justify-center border border-emerald-400/10 text-xs font-black text-emerald-700/25 dark:text-emerald-200/20">{cell}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md"><Bomb className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Minesweeper</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 shadow-sm dark:bg-slate-950/30 dark:text-emerald-300">Clear the field</span></div></div><button onClick={() => setLocation("/minesweeper")} className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-emerald-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Reveal every safe cell — dodge the mines.</p>
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleMinesweeperLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleMinesweeperLevels.map((level) => <button key={level} onClick={() => launchMinesweeper(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-emerald-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-emerald-700 dark:text-emerald-300">{MINESWEEPER_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{MINESWEEPER_LEVELS[level].mines} mines</span></button>)}
          </div>
        </section>

        {/* Slide Puzzle quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-sky-400/60 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 p-4 shadow-xl shadow-sky-500/20 ring-1 ring-inset ring-white/70 dark:from-sky-950/75 dark:via-cyan-950/70 dark:to-blue-950/60 dark:ring-white/10 ${matchesGame("slide-puzzle") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-sky-400/15 bg-white/15 opacity-60 dark:bg-white/5">{[1, 2, 3, 4, 0, 5, 7, 8, 6].map((tile, index) => <span key={index} className="flex items-center justify-center border border-sky-400/10 text-xs font-black text-sky-700/25 dark:text-sky-200/20">{tile === 0 ? "·" : tile}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md"><Grid3x3 className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Slide Puzzle</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700 shadow-sm dark:bg-slate-950/30 dark:text-sky-300">Slide to order</span></div></div><button onClick={() => setLocation("/slide-puzzle")} className="rounded-full bg-sky-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-sky-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Slide the tiles back into order.</p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleSlidePuzzleLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleSlidePuzzleLevels.map((level) => <button key={level} onClick={() => launchSlidePuzzle(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-sky-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-sky-700 dark:text-sky-300">{SLIDE_PUZZLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SLIDE_PUZZLE_LEVELS[level].tiles} tiles</span></button>)}
          </div>
        </section>

        {/* 2048 quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-orange-400/60 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 p-4 shadow-xl shadow-orange-500/20 ring-1 ring-inset ring-white/70 dark:from-orange-950/75 dark:via-amber-950/70 dark:to-yellow-950/60 dark:ring-white/10 ${matchesGame("game-2048") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-orange-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["2", "4", "8", "16", "32", "64", "128", "256", "512"].map((tile, index) => <span key={index} className="flex items-center justify-center border border-orange-400/10 text-[10px] font-black text-orange-700/30 dark:text-orange-200/20">{tile}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md"><LayoutGrid className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">2048</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 shadow-sm dark:bg-slate-950/30 dark:text-orange-300">Merge &amp; reach</span></div></div><button onClick={() => setLocation("/game-2048")} className="rounded-full bg-orange-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-orange-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Slide tiles to merge matching numbers.</p>
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleGame2048Levels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleGame2048Levels.map((level) => <button key={level} onClick={() => launchGame2048(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-orange-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-orange-700 dark:text-orange-300">{GAME_2048_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · {GAME_2048_LEVELS[level].targetTile}</span></button>)}
          </div>
        </section>

        {/* Jumble Words quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 p-4 shadow-xl shadow-cyan-500/20 ring-1 ring-inset ring-white/70 dark:from-cyan-950/75 dark:via-sky-950/70 dark:to-blue-950/60 dark:ring-white/10 ${matchesGame("jumble") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-sky-300/35 blur-2xl dark:bg-sky-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-cyan-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["T", "A", "C", "E", "P", "O", "H", "S", "R"].map((letter, index) => <span key={index} className="flex items-center justify-center border border-cyan-400/10 text-[10px] font-black text-cyan-700/30 dark:text-cyan-200/20">{letter}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md"><LetterText className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Jumble Words</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700 shadow-sm dark:bg-slate-950/30 dark:text-cyan-300">Unscramble &amp; spell</span></div></div><button onClick={() => setLocation("/jumble")} className="rounded-full bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-cyan-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Rebuild the hidden word from jumbled letters.</p>
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleJumbleLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleJumbleLevels.map((level) => <button key={level} onClick={() => launchJumble(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-cyan-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-cyan-700 dark:text-cyan-300">{JUMBLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{JUMBLE_LEVELS[level].questions} words</span></button>)}
          </div>
        </section>

        {/* Snake quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-green-400/60 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-4 shadow-xl shadow-green-500/20 ring-1 ring-inset ring-white/70 dark:from-green-950/75 dark:via-emerald-950/70 dark:to-teal-950/60 dark:ring-white/10 ${matchesGame("snake") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-emerald-300/35 blur-2xl dark:bg-emerald-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-4 overflow-hidden rounded-xl border border-green-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "·", "·"].map((cell, index) => <span key={index} className={`flex items-center justify-center text-[10px] font-black ${cell === "●" ? "text-green-700/40 dark:text-green-200/25" : "text-emerald-700/20 dark:text-emerald-200/15"}`}>{cell}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-md"><Snake className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Snake</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-green-700 shadow-sm dark:bg-slate-950/30 dark:text-green-300">Eat &amp; grow</span></div></div><button onClick={() => setLocation("/snake")} className="rounded-full bg-green-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-green-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Guide the snake to the food before you hit a wall.</p>
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleSnakeLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleSnakeLevels.map((level) => <button key={level} onClick={() => launchSnake(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-green-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-green-700 dark:text-green-300">{SNAKE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize}</span></button>)}
          </div>
        </section>

        {/* Odd Images quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 p-4 shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-teal-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["same", "same", "odd", "same", "odd", "same", "same", "same", "same"].map((cell, index) => <span key={index} className={`flex items-center justify-center border border-teal-400/10 text-[9px] font-black ${cell === "odd" ? "bg-rose-400/25 text-rose-700/35 dark:text-rose-200/25" : "text-teal-700/25 dark:text-teal-200/20"}`}>{cell === "odd" ? "?" : "✓"}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md"><Images className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Odd Images</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700 shadow-sm dark:bg-slate-950/30 dark:text-teal-300">Spot the difference</span></div></div><button onClick={() => setLocation("/odd-images")} className="rounded-full bg-teal-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-teal-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Find the one image that does not belong.</p>
          <IconSetPreview themeId={themeId} className="mt-1" />
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleOddImageLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleOddImageLevels.map((level) => <button key={level} onClick={() => launchOddImages(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-teal-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-teal-700 dark:text-teal-300">{ODD_IMAGE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{ODD_IMAGE_LEVELS[level].gridSize}×{ODD_IMAGE_LEVELS[level].gridSize} · {ODD_IMAGE_LEVELS[level].questions} Qs</span></button>)}
          </div>
        </section>

        {/* Rubik's Cube quick launch */}
        {RUBIKS_VISIBLE && (
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-rose-400/60 bg-gradient-to-br from-rose-100 via-red-50 to-orange-100 p-4 shadow-xl shadow-rose-500/20 ring-1 ring-inset ring-white/70 dark:from-rose-950/75 dark:via-red-950/70 dark:to-orange-950/60 dark:ring-white/10 ${matchesGame("rubiks") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-orange-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-red-300/35 blur-2xl dark:bg-red-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-rose-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["⬜", "🟧", "🟩", "🟦", "⬜", "🟥", "🟨", "🟩", "⬜"].map((sticker, index) => <span key={index} className="flex items-center justify-center rounded-sm border border-rose-400/10 text-xs">{sticker}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md"><Box className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Rubik's Cube</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700 shadow-sm dark:bg-slate-950/30 dark:text-rose-300">Twist &amp; solve</span></div></div><button onClick={() => setLocation("/rubiks")} className="rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-rose-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Twist the layers until every face is one colour.</p>
          <div className="relative z-10 mt-2 grid grid-cols-4 gap-1.5">
            {RUBIKS_LEVELS.map((level) => <button key={level.puzzle} onClick={() => setLocation(`/rubiks?puzzle=${level.puzzle}`)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-rose-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-rose-700 dark:text-rose-300">{level.label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{level.name} · {level.puzzle === "pyraminx" ? "Pyramid" : level.puzzle}</span></button>)}
          </div>
        </section>
        )}

        {/* Quiz quick launches — one card per subject */}
        {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
          const subject = QUIZ_SUBJECTS[id];
          const levels = visibleQuizLevelsFor(id);
          return (
            <section key={id} className={`relative isolate overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} p-4 shadow-xl ring-1 ring-inset ring-white/70 dark:ring-white/10 ${matchesGame(quizGameId(id)) ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: subject.theme.hex }} />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full blur-2xl dark:blur-3xl" style={{ backgroundColor: `${subject.theme.hex}59` }} />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border bg-white/15 p-1.5 opacity-60 dark:bg-white/5" style={{ borderColor: `${subject.theme.hex}26` }}>{["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => <span key={letter} className="flex items-center justify-center rounded-md border text-xs font-black" style={{ borderColor: `${subject.theme.hex}1a`, color: `${subject.theme.hex}40` }}>{letter}</span>)}</div>
              <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl shadow-md ${subject.theme.soft}`}>{subject.emoji}</div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">{subject.shortName} Quiz</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm dark:bg-slate-950/30" style={{ color: subject.theme.hex }}>{subject.tagline}</span></div></div><button onClick={() => setLocation(`/quiz/${id}`)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors ${subject.theme.btn}`}>All options</button></div>
              <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Timed multiple-choice questions across four levels.</p>
              <div className={`relative z-10 mt-2 grid gap-1.5 ${levels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
                {levels.map((level) => <button key={level} onClick={() => launchQuiz(id, level)} className={`relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55 ${subject.theme.border} ${subject.theme.hover}`}><span className={`font-black text-sm leading-tight ${subject.theme.strong}`}>{subject.levels[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{subject.levels[level].detail.replace("questions", "quiz")}</span></button>)}
              </div>
            </section>
          );
        })}
        {extraPortalGames.length > 0 && <PortalGameEntries view="box" games={extraPortalGames} onOpen={(href) => setLocation(href)} />}
        </>
        ) : (
          <PortalGameEntries view={gameView} games={filteredGames} onOpen={(href) => setLocation(href)} />
        )}

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
            <button onClick={() => setLocation("/game-2048-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-orange-950/20 dark:hover:bg-orange-950/40">
              <LayoutGrid className="h-5 w-5 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
            </button>
            <button onClick={() => setLocation("/jumble-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
              <LetterText className="h-5 w-5 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
            </button>
            <button onClick={() => setLocation("/snake-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-green-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-green-950/20 dark:hover:bg-green-950/40">
              <Snake className="h-5 w-5 shrink-0 text-green-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Snake</p><p className="text-xs text-muted-foreground">One shared food trail each day</p></div><span className="shrink-0 text-sm text-green-500">→</span>
            </button>
            <button onClick={() => setLocation("/odd-images-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-teal-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-teal-950/20 dark:hover:bg-teal-950/40">
              <Images className="h-5 w-5 shrink-0 text-teal-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Odd Images</p><p className="text-xs text-muted-foreground">One shared image grid each day</p></div><span className="shrink-0 text-sm text-teal-500">→</span>
            </button>
            {RUBIKS_VISIBLE && (
            <button onClick={() => setLocation("/rubiks?daily=1")} className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/40">
              <Box className="h-5 w-5 shrink-0 text-rose-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Rubik's Cube</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-rose-500">→</span>
            </button>
            )}
            {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
              const subject = QUIZ_SUBJECTS[id];
              return (
                <button key={id} onClick={() => setLocation(`/quiz-challenge/${id}`)} className={`flex w-full items-center gap-3 rounded-xl border bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:hover:brightness-110 ${subject.theme.border}`}>
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Available Games
            </p>
            <GameViewToolbar view={gameView} onViewChange={setGameView} search={gameSearch} onSearchChange={setGameSearch} />
          </div>
          {gameView === "box" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sudoku Card */}
            <div className={`group relative isolate overflow-hidden rounded-2xl border-2 border-primary/55 bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100 shadow-xl shadow-primary/20 ring-1 ring-inset ring-white/70 dark:from-cyan-950/80 dark:via-sky-950/75 dark:to-indigo-950/80 dark:ring-white/10 ${matchesGame("sudoku") ? "" : "hidden"}`}>
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
                  className={`grid gap-1.5 ${visibleSudokuSizes.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
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
                <div className={`group relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-fuchsia-100 via-violet-50 to-amber-100 shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 dark:from-fuchsia-950/75 dark:via-violet-950/80 dark:to-amber-950/60 dark:ring-white/10 ${matchesGame("memory") ? "" : "hidden"}`}>
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
                    <div className="grid grid-cols-2 gap-2">
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
            <div className={`group relative isolate overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 shadow-xl shadow-amber-500/20 ring-1 ring-inset ring-white/70 dark:from-orange-950/75 dark:via-amber-950/80 dark:to-yellow-950/60 dark:ring-white/10 ${matchesGame("jigsaw") ? "" : "hidden"}`}>
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
                <div className="grid grid-cols-2 gap-1.5">
                  {visibleJigsawSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setLocation(`/jigsaw?gridSize=${size}&level=1&imageKey=1&play=1`)}
                      className="flex flex-col items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all py-2 px-1 cursor-pointer min-h-[52px]"
                    >
                      <span className="font-bold text-xs leading-none text-amber-600 dark:text-amber-400">
                        {JIGSAW_SIZE_NAMES[size]}
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
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-violet-400/60 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-pink-100 text-left shadow-xl shadow-violet-500/20 ring-1 ring-inset ring-white/70 transition hover:border-violet-500/80 dark:from-violet-950/75 dark:via-fuchsia-950/70 dark:to-pink-950/60 dark:ring-white/10 ${matchesGame("word-search") ? "" : "hidden"}`}>
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
                  {visibleWordSearchLevels.map((level) => <button key={level} onClick={() => launchWordSearch(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/5 px-1 py-2 text-center transition-all hover:border-violet-400/40 hover:bg-violet-500/15"><span className="text-xs font-bold leading-none text-violet-600 dark:text-violet-400">{WORD_SEARCH_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{WORD_SEARCH_LEVELS[level].wordCount} words</span></button>)}
                </div>
                <button onClick={() => setLocation("/word-search")} className="mt-3 text-xs font-semibold text-violet-800 underline underline-offset-2 dark:text-violet-200">More options and themes</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 text-left shadow-xl shadow-emerald-500/20 ring-1 ring-inset ring-white/70 transition hover:border-emerald-500/80 dark:from-emerald-950/75 dark:via-teal-950/70 dark:to-cyan-950/60 dark:ring-white/10 ${matchesGame("minesweeper") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-teal-300/35 blur-2xl dark:bg-teal-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-emerald-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["1", "💣", "1", "", "2", "1", "🚩", "", "3"].map((cell, index) => <span key={index} className="flex items-center justify-center border border-emerald-400/10 text-sm font-black text-emerald-700/25 dark:text-emerald-200/20">{cell}</span>)}</div>
              <button onClick={() => setLocation("/minesweeper")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-400/20 dark:text-emerald-300"><Bomb className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Minesweeper</h2><p className="text-xs text-muted-foreground">Clear the minefield</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Reveal every safe cell and dodge the mines. Pick a board size and mine count to start.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {visibleMinesweeperLevels.map((level) => <button key={level} onClick={() => launchMinesweeper(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-1 py-2 text-center transition-all hover:border-emerald-400/40 hover:bg-emerald-500/15"><span className="text-xs font-bold leading-none text-emerald-700 dark:text-emerald-300">{MINESWEEPER_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{MINESWEEPER_LEVELS[level].mines} mines</span></button>)}
                </div>
                <button onClick={() => setLocation("/minesweeper")} className="mt-3 text-xs font-semibold text-emerald-800 underline underline-offset-2 dark:text-emerald-200">More options and themes</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-sky-400/60 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 text-left shadow-xl shadow-sky-500/20 ring-1 ring-inset ring-white/70 transition hover:border-sky-500/80 dark:from-sky-950/75 dark:via-cyan-950/70 dark:to-blue-950/60 dark:ring-white/10 ${matchesGame("slide-puzzle") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-sky-400/15 bg-white/15 opacity-60 dark:bg-white/5">{[1, 2, 3, 4, 0, 5, 7, 8, 6].map((tile, index) => <span key={index} className="flex items-center justify-center border border-sky-400/10 text-sm font-black text-sky-700/25 dark:text-sky-200/20">{tile === 0 ? "·" : tile}</span>)}</div>
              <button onClick={() => setLocation("/slide-puzzle")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-600/10 text-sky-600 ring-1 ring-sky-400/20 dark:text-sky-300"><Grid3x3 className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Slide Puzzle</h2><p className="text-xs text-muted-foreground">Slide tiles into order</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Slide every tile back into place across four board sizes, with numbers, letters, or pictures. Pick a size to start.</p>
                <IconSetPreview themeId={themeId} />
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {visibleSlidePuzzleLevels.map((level) => <button key={level} onClick={() => launchSlidePuzzle(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/5 px-1 py-2 text-center transition-all hover:border-sky-400/40 hover:bg-sky-500/15"><span className="text-xs font-bold leading-none text-sky-700 dark:text-sky-300">{SLIDE_PUZZLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SLIDE_PUZZLE_LEVELS[level].tiles} tiles</span></button>)}
                </div>
                <button onClick={() => setLocation("/slide-puzzle")} className="mt-3 text-xs font-semibold text-sky-800 underline underline-offset-2 dark:text-sky-200">More options and tile styles</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-orange-400/60 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 text-left shadow-xl shadow-orange-500/20 ring-1 ring-inset ring-white/70 transition hover:border-orange-500/80 dark:from-orange-950/75 dark:via-amber-950/70 dark:to-yellow-950/60 dark:ring-white/10 ${matchesGame("game-2048") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-orange-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["2", "4", "8", "16", "32", "64", "128", "256", "512"].map((tile, index) => <span key={index} className="flex items-center justify-center border border-orange-400/10 text-sm font-black text-orange-700/25 dark:text-orange-200/20">{tile}</span>)}</div>
              <button onClick={() => setLocation("/game-2048")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-600/10 text-orange-600 ring-1 ring-orange-400/20 dark:text-orange-300"><LayoutGrid className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">2048</h2><p className="text-xs text-muted-foreground">Merge tiles, reach the target</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Slide every tile to merge matching numbers across four board sizes — 3×3 up to 6×6. Reach the target tile before you run out of moves.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {visibleGame2048Levels.map((level) => <button key={level} onClick={() => launchGame2048(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-orange-400/20 bg-orange-500/5 px-1 py-2 text-center transition-all hover:border-orange-400/40 hover:bg-orange-500/15"><span className="text-xs font-bold leading-none text-orange-700 dark:text-orange-300">{GAME_2048_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · {GAME_2048_LEVELS[level].targetTile}</span></button>)}
                </div>
                <button onClick={() => setLocation("/game-2048")} className="mt-3 text-xs font-semibold text-orange-800 underline underline-offset-2 dark:text-orange-200">More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 text-left shadow-xl shadow-cyan-500/20 ring-1 ring-inset ring-white/70 transition hover:border-cyan-500/80 dark:from-cyan-950/75 dark:via-sky-950/70 dark:to-blue-950/60 dark:ring-white/10 ${matchesGame("jumble") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-sky-300/35 blur-2xl dark:bg-sky-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-cyan-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["T", "A", "C", "E", "P", "O", "H", "S", "R"].map((letter, index) => <span key={index} className="flex items-center justify-center border border-cyan-400/10 text-sm font-black text-cyan-700/25 dark:text-cyan-200/20">{letter}</span>)}</div>
              <button onClick={() => setLocation("/jumble")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-600 ring-1 ring-cyan-400/20 dark:text-cyan-300"><LetterText className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Jumble Words</h2><p className="text-xs text-muted-foreground">Unscramble jumbled letters into words</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Every round hides real English words behind shuffled letters. Rebuild each word letter by letter — four levels with growing word counts and difficulty.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {visibleJumbleLevels.map((level) => <button key={level} onClick={() => launchJumble(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-1 py-2 text-center transition-all hover:border-cyan-400/40 hover:bg-cyan-500/15"><span className="text-xs font-bold leading-none text-cyan-700 dark:text-cyan-300">{JUMBLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{JUMBLE_LEVELS[level].questions} words</span></button>)}
                </div>
                <button onClick={() => setLocation("/jumble")} className="mt-3 text-xs font-semibold text-cyan-800 underline underline-offset-2 dark:text-cyan-200">More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-green-400/60 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 text-left shadow-xl shadow-green-500/20 ring-1 ring-inset ring-white/70 transition hover:border-green-500/80 dark:from-green-950/75 dark:via-emerald-950/70 dark:to-teal-950/60 dark:ring-white/10 ${matchesGame("snake") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-emerald-300/35 blur-2xl dark:bg-emerald-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-4 overflow-hidden rounded-xl border border-green-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "·", "·"].map((cell, index) => <span key={index} className={`flex items-center justify-center text-sm font-black ${cell === "●" ? "text-green-700/40 dark:text-green-200/25" : "text-emerald-700/20 dark:text-emerald-200/15"}`}>{cell}</span>)}</div>
              <button onClick={() => setLocation("/snake")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-600/10 text-green-600 ring-1 ring-green-400/20 dark:text-green-300"><Snake className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Snake</h2><p className="text-xs text-muted-foreground">Eat food, grow, don&apos;t crash</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">The classic Nokia arcade game — eat as many apples as you can before you hit a wall or your own tail — the run only ends when you crash. Four levels from a calm 12×12 up to a fast 18×18.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {visibleSnakeLevels.map((level) => <button key={level} onClick={() => launchSnake(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-green-400/20 bg-green-500/5 px-1 py-2 text-center transition-all hover:border-green-400/40 hover:bg-green-500/15"><span className="text-xs font-bold leading-none text-green-700 dark:text-green-300">{SNAKE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize}</span></button>)}
                </div>
                <button onClick={() => setLocation("/snake")} className="mt-3 text-xs font-semibold text-green-800 underline underline-offset-2 dark:text-green-200">More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 text-left shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 transition hover:border-teal-500/80 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-cyan-300/35 blur-2xl dark:bg-cyan-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-teal-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["same", "same", "odd", "same", "odd", "same", "same", "same", "same"].map((cell, index) => <span key={index} className={`flex items-center justify-center border border-teal-400/10 text-sm font-black ${cell === "odd" ? "bg-rose-400/25 text-rose-700/35 dark:text-rose-200/25" : "text-teal-700/25 dark:text-teal-200/20"}`}>{cell === "odd" ? "?" : "✓"}</span>)}</div>
              <button onClick={() => setLocation("/odd-images")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-600/10 text-teal-600 ring-1 ring-teal-400/20 dark:text-teal-300"><Images className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Odd Images</h2><p className="text-xs text-muted-foreground">Find the different image</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">One image in every grid does not belong. Pick the right tile across four levels with growing grids and question counts.</p>
                <IconSetPreview themeId={themeId} />
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {visibleOddImageLevels.map((level) => <button key={level} onClick={() => launchOddImages(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-teal-400/20 bg-teal-500/5 px-1 py-2 text-center transition-all hover:border-teal-400/40 hover:bg-teal-500/15"><span className="text-xs font-bold leading-none text-teal-700 dark:text-teal-300">{ODD_IMAGE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{ODD_IMAGE_LEVELS[level].gridSize}×{ODD_IMAGE_LEVELS[level].gridSize} · {ODD_IMAGE_LEVELS[level].questions} Qs</span></button>)}
                </div>
                <button onClick={() => setLocation("/odd-images")} className="mt-3 text-xs font-semibold text-teal-800 underline underline-offset-2 dark:text-teal-200">More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            {RUBIKS_VISIBLE && (
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-rose-400/60 bg-gradient-to-br from-rose-100 via-red-50 to-orange-100 text-left shadow-xl shadow-rose-500/20 ring-1 ring-inset ring-white/70 transition hover:border-rose-500/80 dark:from-rose-950/75 dark:via-red-950/70 dark:to-orange-950/60 dark:ring-white/10 ${matchesGame("rubiks") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-orange-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-red-300/35 blur-2xl dark:bg-red-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-rose-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["⬜", "🟧", "🟩", "🟦", "⬜", "🟥", "🟨", "🟩", "⬜"].map((sticker, index) => <span key={index} className="flex items-center justify-center rounded-sm border border-rose-400/10 text-sm">{sticker}</span>)}</div>
              <button onClick={() => setLocation("/rubiks")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-600/10 text-rose-600 ring-1 ring-rose-400/20 dark:text-rose-300"><Box className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Rubik's Cube</h2><p className="text-xs text-muted-foreground">Twist &amp; solve against the clock</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Restore every face to a single colour across four puzzles — 2×2, 3×3, Pyraminx, and 4×4. Pick a puzzle to start.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {RUBIKS_LEVELS.map((level) => <button key={level.puzzle} onClick={() => setLocation(`/rubiks?puzzle=${level.puzzle}`)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-rose-400/20 bg-rose-500/5 px-1 py-2 text-center transition-all hover:border-rose-400/40 hover:bg-rose-500/15"><span className="text-xs font-bold leading-none text-rose-700 dark:text-rose-300">{level.label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{level.name} · {level.puzzle === "pyraminx" ? "Pyramid" : level.puzzle}</span></button>)}
                </div>
                <button onClick={() => setLocation("/rubiks")} className="mt-3 text-xs font-semibold text-rose-800 underline underline-offset-2 dark:text-rose-200">More options and daily challenge</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            )}
            {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
              const subject = QUIZ_SUBJECTS[id];
              const levels = visibleQuizLevelsFor(id);
              return (
            <section key={id} className={`group relative isolate overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} text-left shadow-xl ring-1 ring-inset ring-white/70 transition hover:brightness-[1.02] dark:ring-white/10 ${matchesGame(quizGameId(id)) ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: subject.theme.hex }} />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full blur-2xl dark:blur-3xl" style={{ backgroundColor: `${subject.theme.hex}59` }} />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border bg-white/15 p-1.5 opacity-60 dark:bg-white/5" style={{ borderColor: `${subject.theme.hex}26` }}>{["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => <span key={letter} className="flex items-center justify-center rounded-md border text-sm font-black" style={{ borderColor: `${subject.theme.hex}1a`, color: `${subject.theme.hex}40` }}>{letter}</span>)}</div>
              <button onClick={() => setLocation(`/quiz/${id}`)} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${subject.theme.soft}`} style={{ boxShadow: `0 0 0 1px ${subject.theme.hex}33` }}>{subject.emoji}</span><div><h2 className="font-serif text-xl font-bold">{subject.shortName} Quiz</h2><p className="text-xs text-muted-foreground">{subject.tagline}</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Timed multiple-choice questions across four levels. Pick a level to start.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {levels.map((level) => <button key={level} onClick={() => launchQuiz(id, level)} className={`flex min-h-[52px] flex-col items-center justify-center rounded-lg border bg-white/60 px-1 py-2 text-center transition-all hover:bg-white dark:bg-slate-950/30 dark:hover:bg-slate-950/50 ${subject.theme.border} ${subject.theme.hover}`}><span className={`text-xs font-bold leading-none ${subject.theme.strong}`}>{subject.levels[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{subject.levels[level].detail.replace("questions", "quiz")}</span></button>)}
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
            {extraPortalGames.length > 0 && <div className="col-span-full"><PortalGameEntries view="box" games={extraPortalGames} onOpen={(href) => setLocation(href)} /></div>}
          </div>
          ) : (
            <PortalGameEntries view={gameView} games={filteredGames} onOpen={(href) => setLocation(href)} />
          )}
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
              <button onClick={() => setLocation("/game-2048-challenge")} className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-orange-950/20 dark:hover:bg-orange-950/40">
                <LayoutGrid className="h-6 w-6 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
              </button>
              <button onClick={() => setLocation("/jumble-challenge")} className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
                <LetterText className="h-6 w-6 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
              </button>
              <button onClick={() => setLocation("/snake-challenge")} className="flex items-center gap-3 rounded-xl border border-green-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-green-950/20 dark:hover:bg-green-950/40">
                <Snake className="h-6 w-6 shrink-0 text-green-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Snake</p><p className="text-xs text-muted-foreground">One shared food trail each day</p></div><span className="shrink-0 text-sm text-green-500">→</span>
              </button>
              <button onClick={() => setLocation("/odd-images-challenge")} className="flex items-center gap-3 rounded-xl border border-teal-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-teal-950/20 dark:hover:bg-teal-950/40">
                <Images className="h-6 w-6 shrink-0 text-teal-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Odd Images</p><p className="text-xs text-muted-foreground">One shared image grid each day</p></div><span className="shrink-0 text-sm text-teal-500">→</span>
              </button>
              {RUBIKS_VISIBLE && (
              <button onClick={() => setLocation("/rubiks?daily=1")} className="flex items-center gap-3 rounded-xl border border-rose-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-rose-950/20 dark:hover:bg-rose-950/40">
                <Box className="h-6 w-6 shrink-0 text-rose-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Rubik's Cube</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-rose-500">→</span>
              </button>
              )}
              {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
                const subject = QUIZ_SUBJECTS[id];
                return (
                  <button key={id} onClick={() => setLocation(`/quiz-challenge/${id}`)} className={`flex items-center gap-3 rounded-xl border bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:hover:brightness-110 ${subject.theme.border}`}>
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
                  Thirteen puzzle &amp; quiz games, endlessly replayable
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
              {PORTAL_GAMES.map((game) => {
                const GameIcon = game.icon;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setLocation(game.href)}
                    className="w-full rounded-2xl border border-border bg-muted p-4 flex gap-3 items-start text-left hover:bg-muted/70 hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <GameIcon className={`w-5 h-5 mt-0.5 shrink-0 ${game.color}`} />
                    <div>
                      <p className="font-semibold text-sm">{game.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {game.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
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
            Play Brain Games . Online brings together thirteen games that reward
            different kinds of attention. Sudoku asks you to compare rows,
            columns, and boxes before placing a symbol. Memory Match asks you to
            remember where cards appeared. Jigsaw asks you to rebuild a picture
            piece by piece. Word Search asks you to spot hidden words inside a
            letter grid. Minesweeper asks you to clear every safe cell without
            touching a mine. Slide Puzzle asks you to slide every tile back
            into order. 2048 asks you to merge numbered tiles into bigger and
            bigger values. Jumble Words asks you to unscramble jumbled letters
            back into real words. Snake asks you to guide the classic snake to
            eat apples for as long as you can before you crash. Odd Images asks you to find
            the one picture that does not belong in each grid. The Science,
            Maths, and GK quizzes ask you to answer timed multiple-choice
            questions before the clock runs out. All thirteen can be started
            in a browser without creating an account.
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
              Choose from Easy (2×2) to Expert (5×5). Kids mode offers the
              smaller boards, Adult mode the larger ones, and default 4 All
              mode offers every size.
              Drag pieces into empty spaces or tap two pieces to swap them.
              Guided keeps the reference visible,
              Assisted gives three short previews, and Challenging hides the reference.
              Tips can reveal piece information; efficient moves and fewer
              assists help protect your score.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Hunt words in the grid</h3>
            <p className="mt-1">
              In Word Search, themed words hide in straight lines across,
              down, and — on Hard and Expert — diagonally, including backwards.
              Press on a word&apos;s first letter and drag to its last to
              reveal it. Four levels range from a quick 6×6 Easy grid to a
              14×14 Expert board, each with its own word theme. Fewer tries and
              hints keep your score high.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Sweep the minefield safely</h3>
            <p className="mt-1">
              In Minesweeper, every revealed number counts the mines touching
              that cell. Flag the cells you believe are mined, reveal the rest,
              and clear every safe cell to win — hitting three mines ends the
              game. Easy (6×6, 5 mines) and Medium (8×8, 12 mines) suit quick
              rounds, while Hard (12×12, 24 mines) and Expert (14×14, 34 mines)
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
            <h3 className="font-semibold text-foreground">Merge tiles in 2048</h3>
            <p className="mt-1">
              In 2048, slide numbered tiles across the grid to merge matching
              values — every merge builds a bigger number. Boards come in 3×3,
              4×4, 5×5, and 6×6, and each board has its own target tile to
              reach. Finish quickly with efficient moves for the best score.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Unscramble words in Jumble</h3>
            <p className="mt-1">
              In Jumble Words, a real English word arrives with its letters
              scrambled — rebuild it letter by letter or type it out. Rounds
              grow from 5 words on Easy to 12 on Expert, with harder vocabulary
              at every level. Stuck on one? Skip it and revisit the skipped
              words before finishing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Steer the classic snake</h3>
            <p className="mt-1">
              In Snake, the snake grows longer every time it eats — steer it to
              each apple without hitting a wall or your own tail — the run ends
              only when you crash. Easy and Medium suit Kids mode with slower
              speeds and smaller grids; Hard and Expert speed things up for
              Adult mode. Survive longer and turn efficiently for the best
              points.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Test yourself in the quizzes</h3>
            <p className="mt-1">
              Science Quiz covers planets, elements, and living things; Maths
              Quiz covers arithmetic, algebra, and shapes; GK Quiz covers
              countries, history, and world facts. Each has four timed levels —
              Easy asks 5 questions in 2 minutes, Medium 8 in 3, Hard 10 in 4,
              and Expert 12 in 5. Points reward accuracy plus a speed bonus for
              finishing under the par time, and every subject has its own daily
              quiz, leaderboard, achievements, and friend challenges.
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
          <Link href="/game-2048" className="font-semibold text-primary underline-offset-2 hover:underline">
            2048 setup
          </Link>
          <Link href="/jumble" className="font-semibold text-primary underline-offset-2 hover:underline">
            Jumble Words setup
          </Link>
          <Link href="/snake" className="font-semibold text-primary underline-offset-2 hover:underline">
            Snake setup
          </Link>
          <Link href="/quiz/science" className="font-semibold text-primary underline-offset-2 hover:underline">
            Science Quiz
          </Link>
          <Link href="/quiz/maths" className="font-semibold text-primary underline-offset-2 hover:underline">
            Maths Quiz
          </Link>
          <Link href="/quiz/gk" className="font-semibold text-primary underline-offset-2 hover:underline">
            GK Quiz
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
          <Link href="/quiz-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s quiz challenges
          </Link>
          <Link href="/memory-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Memory challenge
          </Link>
          <Link href="/word-search-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Word Search challenge
          </Link>
          <Link href="/minesweeper-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Minesweeper challenge
          </Link>
          <Link href="/slide-puzzle-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Slide Puzzle challenge
          </Link>
          <Link href="/game-2048-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s 2048 challenge
          </Link>
          <Link href="/jumble-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Jumble Words challenge
          </Link>
          <Link href="/snake-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Snake challenge
          </Link>
        </div>
      </section>
      </MobileContentDisclosure>
    </div>
  );
}

function GameViewToolbar({
  view,
  onViewChange,
  search,
  onSearchChange,
}: {
  view: PortalGameView;
  onViewChange: (view: PortalGameView) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const views: { id: PortalGameView; label: string; icon: LucideIcon }[] = [
    { id: "list", label: "List view", icon: List },
    { id: "grid", label: "Grid view", icon: LayoutGrid },
    { id: "box", label: "Card view", icon: LayoutDashboard },
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search games…"
          aria-label="Search games"
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center rounded-xl border border-border bg-card p-1" role="group" aria-label="Game view">
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            aria-label={label}
            aria-pressed={view === id}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${view === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

function PortalGameEntries({
  view,
  games,
  onOpen,
}: {
  view: PortalGameView;
  games: PortalGameEntry[];
  onOpen: (href: string) => void;
}) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-10 text-center">
        <p className="text-sm font-semibold text-foreground">No games match your search</p>
        <p className="mt-1 text-xs text-muted-foreground">Try a different name or clear the search box.</p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-2">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onOpen(game.href)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-muted/50 active:scale-[0.99]"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${game.chip}`}>
                <Icon className={`h-5 w-5 ${game.color}`} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">{game.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{game.tagline}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => {
        const Icon = game.icon;
        return (
          <button
            key={game.id}
            type="button"
            onClick={() => onOpen(game.href)}
            className={`group relative isolate flex min-h-[120px] flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${game.gradient}`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/75 shadow-sm ring-1 ring-black/5 dark:bg-slate-950/50 dark:ring-white/10">
              <Icon className={`h-6 w-6 ${game.color}`} />
            </span>
            <span className="relative z-10">
              <span className="block text-sm font-black leading-tight text-slate-900 dark:text-white">{game.name}</span>
              <span className="mt-0.5 block text-[11px] font-medium text-slate-700/80 dark:text-slate-300/80">{game.tagline}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
