import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import {
  useGetGame,
  useSaveGame,
  useCompleteGame,
  useGetProfile,
  useGeneratePuzzle,
  useCreateGame,
  customFetch,
  generatePuzzle,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useGameTimer } from "@/hooks/use-game-logic";
import { useImageTheme } from "@/hooks/use-image-theme";
import { ThemeIcon } from "@/components/theme-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Lightbulb,
  Eraser,
  PenLine,
  Hash,
  Type,
  Image,
  Flame,
  Loader2,
  RefreshCw,
  RotateCcw,
  Undo2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Share2,
  ChevronDown,
  Zap,
  Gem,
  Trophy,
} from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { Confetti } from "@/components/confetti";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { pickCompletionMessage } from "@/lib/completion-messages";
import { getLevelFromXp } from "@/lib/levels";
import gameFeatures from "@/config/game-features.json";

interface DailyChallengeInfo { puzzleId: number; date: string; }
interface StreakData { currentStreak: number; longestStreak: number; completedToday: boolean; }

function milestoneMessage(streak: number): string | null {
  if (streak === 3)   return "3-day streak! You're on a roll 🔥";
  if (streak === 7)   return "One week streak! Incredible consistency 🏆";
  if (streak === 14)  return "Two weeks straight! You're unstoppable 💪";
  if (streak === 30)  return "30-day streak! A whole month — legendary! 👑";
  if (streak === 50)  return "50 days! You're a Sudoku machine 🤖";
  if (streak === 100) return "100-day streak! Hall of fame material 🌟";
  if (streak > 100 && streak % 50 === 0) return `${streak} days! Absolute legend 🌟`;
  return null;
}

// ─── Alphabet mode helpers ────────────────────────────────────────────────────

const ALPHA_COLORS = [
  "#E53935", "#1E88E5", "#43A047", "#FB8C00",
  "#8E24AA", "#00897B", "#D81B60", "#F4511E",
  "#3949AB", "#00ACC1", "#7CB342", "#F9A825",
  "#6D4C41", "#546E7A", "#5E35B1", "#E53935",
];

// Grid encoding helpers (mirror of server-side encoding)
// '1'-'9' for 1-9, 'a'-'g' for 10-16, '0' for empty
function encodeForGrid(n: number): string {
  if (n <= 9) return n.toString();
  return String.fromCharCode(87 + n); // 10→'a', 11→'b', ..., 16→'g'
}
function decodeFromGrid(c: string): number {
  const n = parseInt(c, 10);
  if (!isNaN(n)) return n;
  return c.charCodeAt(0) - 87;
}

function AlphaLetter({ value, size = 32 }: { value: number; size?: number }) {
  const letter = String.fromCharCode(64 + value); // 1→A, 2→B …
  const color = ALPHA_COLORS[(value - 1) % ALPHA_COLORS.length];
  return (
    <span
      style={{
        color,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1,
        fontFamily: '"Inter", monospace',
        letterSpacing: "-0.02em",
      }}
    >
      {letter}
    </span>
  );
}

// ─── Modes ────────────────────────────────────────────────────────────────────

type GameMode = "number" | "image" | "alpha";

// ─── Cell content ─────────────────────────────────────────────────────────────

function CellContent({
  val,
  mode,
  themeId,
  gridSize,
  cellNotes,
}: {
  val: string;
  mode: GameMode;
  themeId: ReturnType<typeof useImageTheme>["themeId"];
  gridSize: number;
  cellNotes?: Set<string>;
}) {
  // alphaSize drives inline font-size in AlphaLetter; scale ~80% of cell px
  const alphaSize = gridSize === 3 ? 88 : gridSize === 4 ? 64 : gridSize === 16 ? 13 : 28;

  if (val !== "0") {
    const n = decodeFromGrid(val);
    if (mode === "image")
      // Wrapper fills 82% of the cell; CSS overrides the SVG's fixed width/height attrs
      return (
        <div className="w-[82%] h-[82%] flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_img]:!w-full [&_img]:!h-full">
          <ThemeIcon themeId={themeId} value={n} size={48} />
        </div>
      );
    if (mode === "alpha") return <AlphaLetter value={n} size={alphaSize} />;
    return <>{gridSize === 16 ? n : val}</>;
  }

  if (cellNotes && cellNotes.size > 0) {
    const cols = gridSize <= 3 ? gridSize : gridSize === 4 ? 2 : gridSize === 16 ? 4 : 3;
    return (
      <div
        className="grid w-full h-full p-0.5 pointer-events-none"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: gridSize }, (_, i) => i + 1).map((n) => (
          <div key={n} className="flex items-center justify-center">
            {cellNotes.has(encodeForGrid(n)) ? (
              mode === "image" ? (
                <ThemeIcon themeId={themeId} value={n} size={10} />
              ) : mode === "alpha" ? (
                <AlphaLetter value={n} size={9} />
              ) : (
                <span
                  style={{ fontSize: "0.45rem", lineHeight: 1, opacity: 0.7 }}
                >
                  {n}
                </span>
              )
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ─── Main game page ───────────────────────────────────────────────────────────

export default function Game({ id }: { id: string }) {
  const gameId = parseInt(id, 10);
  const storageKeyGrid = `sudoku-grid-${gameId}`;
  const storageKeyNotes = `sudoku-notes-${gameId}`;
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const modeParam = params.get("mode");
  const rawMode: GameMode =
    modeParam === "image"
      ? "image"
      : modeParam === "alpha"
        ? "alpha"
        : "number";

  const switchMode = (newMode: GameMode) => {
    if (newMode === "image" && !imageModeAllowed) return;
    if (newMode === "alpha" && !alphaModeAllowed) return;
    const next = newMode === "number" ? "" : `?mode=${newMode}`;
    setLocation(`/game/${gameId}${next}`, { replace: true });
  };

  const { profileId } = useAuth();
  const { themeId } = useImageTheme();

  const { data: profile } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });
  const {
    data: game,
    isLoading,
    error,
  } = useGetGame(gameId, { query: { enabled: !!gameId } });

  const saveGame = useSaveGame();
  const completeGame = useCompleteGame();
  const queryClient = useQueryClient();

  const { data: dailyChallenge } = useQuery<DailyChallengeInfo>({
    queryKey: ["daily-challenge"],
    queryFn: () => customFetch<DailyChallengeInfo>("/api/daily-challenge"),
    staleTime: 5 * 60 * 1000,
  });

  const gridSize = game?.puzzle?.gridSize ?? 9;
  const totalCells = gridSize * gridSize;
  const boxSize = gridSize === 9 ? 3 : gridSize === 4 ? 2 : gridSize === 16 ? 4 : 0;

  // 3×3 and 4×4 grids always offer all three play styles.
  // On 9×9 and 16×16, alphabet/image availability is controlled by the global config flags.
  const smallGrid = gridSize === 3 || gridSize === 4;
  const alphaModeAllowed = smallGrid || gameFeatures.alphabetModeEnabled;
  const imageModeAllowed = smallGrid || gameFeatures.imageModeEnabled;
  const availableModes: GameMode[] = (
    ["number", "alpha", "image"] as GameMode[]
  ).filter(
    (m) =>
      m === "number" ||
      (m === "alpha" && alphaModeAllowed) ||
      (m === "image" && imageModeAllowed),
  );
  const mode: GameMode =
    (rawMode === "alpha" && !alphaModeAllowed) ||
    (rawMode === "image" && !imageModeAllowed)
      ? "number"
      : rawMode;

  const [grid, setGrid] = useState<string[]>(Array(totalCells).fill("0"));
  const [initialGrid, setInitialGrid] = useState<string[]>(
    Array(totalCells).fill("0"),
  );
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const sounds = useSound(profile?.soundEnabled);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Record<number, Set<string>>>({});
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [challengeResult, setChallengeResult] = useState<null | {
    id: number; status: string; winnerId: number | null;
    challengerId: number; challengedId: number;
    challengerUsername: string; challengedUsername: string;
    challengerPoints: number | null; challengedPoints: number | null;
  }>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [wrongCells, setWrongCells] = useState<Set<number>>(new Set());
  const [highlightedNumber, setHighlightedNumber] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{
    grid: string[];
    notes: Record<number, Set<string>>;
    wrongCells: Set<number>;
  }>>([]);
  // Ref holds a fresh snapshot fn every render — lets useCallback handlers call it
  // without stale-closure issues and without adding snapshot state to their deps.
  const pushHistoryRef = useRef<() => void>(() => {});
  const [completionMessage, setCompletionMessage] = useState(() =>
    pickCompletionMessage(game?.puzzle?.difficulty, game?.puzzle?.gridSize),
  );

  const MAX_MISTAKES = 3;
  const MAX_HINTS = 3;

  // Count placed cells per value; numbers at gridSize are fully placed → disable pad button
  const numberCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (let n = 1; n <= gridSize; n++) {
      const encoded = encodeForGrid(n);
      counts.set(encoded, grid.filter((c) => c === encoded).length);
    }
    return counts;
  }, [grid, gridSize]);

  const completedNumbers = useMemo(() => {
    const done = new Set<string>();
    numberCounts.forEach((count, encoded) => {
      if (count >= gridSize) done.add(encoded);
    });
    return done;
  }, [numberCounts, gridSize]);
  const [isPaused, setIsPaused] = useState(false);

  // ─── Board pinch-zoom & pan ──────────────────────────────────────────────────
  const [boardScale, setBoardScale] = useState(1);
  const [boardOffset, setBoardOffset] = useState({ x: 0, y: 0 });
  // Mutable ref tracks mid-gesture state without causing re-renders
  const boardGesture = useRef({
    isPinching: false, startDist: 0, startScale: 1,
    lastTap: 0,
    isPanning: false, panStartX: 0, panStartY: 0, offsetStartX: 0, offsetStartY: 0,
    totalMovement: 0, suppressNextClick: false,
  });
  // Stable refs so gesture callbacks never go stale
  const scaleRef  = useRef(boardScale);  scaleRef.current  = boardScale;
  const offsetRef = useRef(boardOffset); offsetRef.current = boardOffset;

  // Derive game mode from profile
  const rawGameMode = (profile?.gameMode ?? '4all') as 'children' | 'adult' | '4all';
  const visibleSizes = ([3, 4, 9, 16] as const).filter(s =>
    rawGameMode === 'children' ? [3, 4].includes(s) :
    rawGameMode === 'adult'    ? [9, 16].includes(s) :
    true
  );
  const visibleDiffs = ['easy', 'medium', 'hard', 'expert'] as const;

  // New-game switcher state — synced to the current game's size/difficulty once loaded
  const [newSize, setNewSize] = useState<3 | 4 | 9 | 16>(3);
  const [newDiff, setNewDiff] = useState<"easy" | "medium" | "hard" | "expert">("easy");
  const [newGameFetching, setNewGameFetching] = useState(false);

  // Sync to current game once data arrives
  useEffect(() => {
    if (game?.puzzle) {
      setNewSize(game.puzzle.gridSize as 3 | 4 | 9 | 16);
      setNewDiff((game.puzzle.difficulty ?? "easy") as "easy" | "medium" | "hard" | "expert");
    }
  }, [game?.puzzle?.gridSize, game?.puzzle?.difficulty]);

  const createNewGame = useCreateGame();
  const newGameLoading = newGameFetching || createNewGame.isPending;

  // Accepts explicit overrides so callers don't have to wait for state to flush
  const handleNewGame = async (sizeOverride?: 3 | 4 | 9 | 16, diffOverride?: "easy" | "medium" | "hard" | "expert") => {
    const size = sizeOverride ?? newSize;
    const diff = diffOverride ?? newDiff;
    if (!profileId || newGameLoading) return;
    setNewGameFetching(true);
    setShowMobileControls(false);
    try {
      const puzzle = await generatePuzzle({ difficulty: diff, gridSize: size as any });
      if (!puzzle) return;
      const newGameResult = await createNewGame.mutateAsync({
        data: { profileId, puzzleId: puzzle.id, difficulty: diff },
      });
      const modeQuery = mode !== "number" ? `?mode=${mode}` : "";
      setLocation(`/game/${newGameResult.id}${modeQuery}`);
    } catch (err) {
      console.error("Error starting new game:", err);
    } finally {
      setNewGameFetching(false);
    }
  };

  // 9×9/16×16 with only Numbers available: the mode-switcher slot is replaced by a
  // Difficulty picker — changing it starts a new game immediately at the current grid size.
  const quickDifficultyInFlightRef = useRef(false);
  const [quickDifficultyLoading, setQuickDifficultyLoading] = useState(false);
  const handleQuickDifficultyChange = async (nextDifficulty: "easy" | "medium" | "hard" | "expert") => {
    if (!profileId || quickDifficultyInFlightRef.current) return;
    quickDifficultyInFlightRef.current = true;
    setQuickDifficultyLoading(true);
    try {
      const puzzle = await generatePuzzle({ difficulty: nextDifficulty, gridSize: gridSize as any });
      if (!puzzle) throw new Error("Failed to generate puzzle");
      const newGame = await createNewGame.mutateAsync({
        data: { profileId, puzzleId: puzzle.id, difficulty: nextDifficulty },
      });
      const modeQuery = mode !== "number" ? `?mode=${mode}` : "";
      setLocation(`/game/${newGame.id}${modeQuery}`);
    } catch (err) {
      console.error("Error starting new game:", err);
    } finally {
      setQuickDifficultyLoading(false);
      quickDifficultyInFlightRef.current = false;
    }
  };

  const { seconds, formattedTime } = useGameTimer(
    game?.elapsedSeconds || 0,
    !isCompleted && !isGameOver && !isPaused && game?.status === "active",
  );
  const saveTimeoutRef = useRef<number | null>(null);
  const gameLoadedRef = useRef(false);

  // Sync new-game size pill to the current game's grid size (only if valid for current mode)
  useEffect(() => {
    if (gridSize && visibleSizes.includes(gridSize as any)) {
      setNewSize(gridSize as 3 | 4 | 9 | 16);
    } else if (visibleSizes.length > 0) {
      setNewSize(visibleSizes[0]);
    }
  }, [gridSize]);

  // Clamp size when game mode changes
  useEffect(() => {
    if (!visibleSizes.includes(newSize)) {
      setNewSize(visibleSizes[0] ?? 9);
    }
  }, [rawGameMode]);

  useEffect(() => {
    if (game && !isCompleted && !isGameOver) {
      if (game.status === "completed") {
        setIsCompleted(true);
        localStorage.removeItem(storageKeyGrid);
        localStorage.removeItem(storageKeyNotes);
        return;
      }
      const serverGrid = game.currentGrid.split("");
      const loadedInitial = game.puzzle?.grid.split("") || Array(totalCells).fill("0");

      // Prefer localStorage grid if it has more filled cells (handles quick-refresh data loss)
      const savedGrid = localStorage.getItem(storageKeyGrid);
      const localGrid = savedGrid && savedGrid.length === serverGrid.length ? savedGrid.split("") : null;
      const serverFilled = serverGrid.filter((c) => c !== "0").length;
      const localFilled = localGrid ? localGrid.filter((c) => c !== "0").length : -1;
      const loadedGrid = localFilled > serverFilled ? localGrid! : serverGrid;

      setGrid(loadedGrid);
      setInitialGrid(loadedInitial);
      gameLoadedRef.current = true;

      // Restore notes from localStorage
      const savedNotes = localStorage.getItem(storageKeyNotes);
      if (savedNotes) {
        try {
          const parsed = JSON.parse(savedNotes) as Record<string, string[]>;
          const notesMap: Record<number, Set<string>> = {};
          for (const [k, v] of Object.entries(parsed)) {
            notesMap[Number(k)] = new Set(v);
          }
          setNotes(notesMap);
        } catch { /* ignore corrupt data */ }
      }

      const loadedMistakes = game.mistakeCount || 0;
      setMistakes(loadedMistakes);
      setHints(game.hintsUsed || 0);
      const solution = game.puzzle?.solution;
      if (solution) {
        const wrong = new Set<number>();
        loadedGrid.forEach((val, i) => {
          if (val !== "0" && loadedInitial[i] === "0" && val !== solution[i]) {
            wrong.add(i);
          }
        });
        setWrongCells(wrong);
      }
      if (loadedMistakes >= MAX_MISTAKES) {
        setIsGameOver(true);
        customFetch(`/api/games/${gameId}/abandon`, { method: "POST" }).catch(() => {});
      }
    }
  }, [game, isCompleted, isGameOver, totalCells, storageKeyGrid, storageKeyNotes]);

  // Immediately persist grid to localStorage on every change (no debounce).
  // Guard with gameLoadedRef so the initial empty-grid render does NOT overwrite saved data.
  useEffect(() => {
    if (!gameLoadedRef.current || isCompleted || isGameOver) return;
    localStorage.setItem(storageKeyGrid, grid.join(""));
  }, [grid, isCompleted, isGameOver, storageKeyGrid]);

  // Immediately persist notes to localStorage on every change.
  useEffect(() => {
    if (!gameLoadedRef.current) return;
    const serialized: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(notes)) {
      serialized[k] = Array.from(v);
    }
    localStorage.setItem(storageKeyNotes, JSON.stringify(serialized));
  }, [notes, storageKeyNotes]);

  useEffect(() => {
    if (isCompleted || !game || grid.join("") === game.currentGrid) return;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      saveGame.mutate({
        id: gameId,
        data: {
          currentGrid: grid.join(""),
          elapsedSeconds: seconds,
          mistakeCount: mistakes,
          hintsUsed: hints,
        },
      });
    }, 2000);
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [grid, seconds, mistakes, hints, gameId, isCompleted, game]);

  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);

  const checkCompletion = useCallback(
    (currentGrid: string[], solution?: string) => {
      if (!solution) return;
      if (currentGrid.join("") === solution) {
        sounds.complete();
        setIsCompleted(true);
        completeGame.mutate(
          {
            id: gameId,
            data: {
              elapsedSeconds: seconds,
              mistakeCount: mistakes,
              hintsUsed: hints,
            },
          },
          {
            onSuccess: async (data) => {
              localStorage.removeItem(storageKeyGrid);
              localStorage.removeItem(storageKeyNotes);
              if (profileId) {
                queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
                queryClient.invalidateQueries({ queryKey: [`/api/achievements/${profileId}`] });
                queryClient.invalidateQueries({ queryKey: [`/api/stats/${profileId}`] });
              }

              const pts = data.points ?? null;
              setPointsEarned(pts);
              setIsPersonalBest((data as any).isPersonalBest === true);
              const msg = pickCompletionMessage(game?.puzzle?.difficulty, game?.puzzle?.gridSize);
              setCompletionMessage(msg);
              toast.success(`${msg.headline} ${msg.emoji}`, {
                description: pts
                  ? `+${pts.toLocaleString()} pts • ${formattedTime}`
                  : `Time: ${formattedTime} • Mistakes: ${mistakes}`,
              });

              // Fetch challenge result (small delay so resolveChallengeForGame can run)
              setTimeout(async () => {
                try {
                  const cr = await customFetch<typeof challengeResult>(`/api/challenges/for-game/${gameId}`);
                  setChallengeResult(cr);
                } catch {}
              }, 800);

              const isDailyChallenge =
                profileId &&
                dailyChallenge &&
                game?.puzzle?.id === dailyChallenge.puzzleId;

              if (isDailyChallenge) {
                try {
                  const streak = await customFetch<StreakData>(
                    `/api/daily-challenge/streak/${profileId}`,
                  );
                  queryClient.setQueryData(
                    ["daily-challenge-streak", profileId],
                    streak,
                  );
                  const milestone = milestoneMessage(streak.currentStreak);
                  setTimeout(() => {
                    if (milestone) {
                      toast(`🔥 ${streak.currentStreak}-day streak!`, {
                        description: milestone,
                        duration: 6000,
                        icon: <Flame className="w-4 h-4 text-orange-500" />,
                      });
                    } else {
                      toast(`🔥 ${streak.currentStreak}-day streak!`, {
                        description:
                          streak.currentStreak === 1
                            ? "Daily challenge complete! Come back tomorrow to keep it going."
                            : `Keep it up — come back tomorrow for day ${streak.currentStreak + 1}!`,
                        duration: 5000,
                      });
                    }
                  }, 1200);
                } catch {
                }
              }
            },
          },
        );
      }
    },
    [gameId, seconds, mistakes, hints, formattedTime, completeGame, profileId, dailyChallenge, game, queryClient],
  );

  const handleNumberInput = useCallback(
    (num: string) => {
      if (selectedCell === null || isCompleted || isGameOver || isPaused) return;
      if (initialGrid[selectedCell] !== "0") return;

      // Snapshot before any modification so Undo can restore it
      pushHistoryRef.current();

      if (notesMode) {
        sounds.note();
        setNotes((prev) => {
          const cellNotes = new Set(prev[selectedCell] || []);
          cellNotes.has(num) ? cellNotes.delete(num) : cellNotes.add(num);
          return { ...prev, [selectedCell]: cellNotes };
        });
        return;
      }

      const solution = game?.puzzle?.solution;
      const newGrid = [...grid];
      newGrid[selectedCell] = num;
      setGrid(newGrid);
      setNotes((prev) => {
        const n = { ...prev };
        delete n[selectedCell!];
        return n;
      });

      if (solution && solution[selectedCell] !== num) {
        // Wrong answer — place it (highlighted red) and count mistake
        sounds.error();
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setWrongCells((prev) => new Set([...prev, selectedCell]));
        if (newMistakes >= MAX_MISTAKES) {
          sounds.gameover();
          setIsGameOver(true);
          customFetch(`/api/games/${gameId}/abandon`, { method: "POST" }).catch(() => {});
          toast.error("Game Over! 3 mistakes reached.", { duration: 5000 });
        } else {
          toast.error(`Wrong! ${MAX_MISTAKES - newMistakes} mistake${MAX_MISTAKES - newMistakes !== 1 ? "s" : ""} left.`, { duration: 1200 });
        }
      } else {
        // Correct — remove from wrong cells if it was wrong before
        sounds.place();
        setWrongCells((prev) => {
          const s = new Set(prev);
          s.delete(selectedCell);
          return s;
        });
        checkCompletion(newGrid, solution);
      }
    },
    [
      selectedCell,
      isCompleted,
      isGameOver,
      isPaused,
      initialGrid,
      notesMode,
      game,
      grid,
      mistakes,
      checkCompletion,
    ],
  );

  const handleErase = useCallback(() => {
    if (
      selectedCell === null ||
      isCompleted ||
      isGameOver ||
      initialGrid[selectedCell] !== "0"
    )
      return;
    pushHistoryRef.current(); // snapshot before erase
    sounds.erase();
    const newGrid = [...grid];
    newGrid[selectedCell] = "0";
    setGrid(newGrid);
    setWrongCells((prev) => {
      const s = new Set(prev);
      s.delete(selectedCell);
      return s;
    });
  }, [selectedCell, isCompleted, isGameOver, initialGrid, grid, sounds]);

  const handleReset = useCallback(() => {
    setGrid([...initialGrid]);
    setNotes({});
    setMistakes(0);
    setHints(0);
    setWrongCells(new Set());
    setSelectedCell(null);
    setHighlightedNumber(null);
    setHistory([]); // clear undo history on full reset
    localStorage.removeItem(storageKeyGrid);
    localStorage.removeItem(storageKeyNotes);
  }, [initialGrid, storageKeyGrid, storageKeyNotes]);

  const handleHint = () => {
    if (
      selectedCell === null ||
      isCompleted ||
      isGameOver ||
      hints >= MAX_HINTS ||
      initialGrid[selectedCell] !== "0" ||
      grid[selectedCell] !== "0"
    )
      return;
    const solution = game?.puzzle?.solution;
    if (solution) {
      const newHints = hints + 1;
      setHints(newHints);
      const newGrid = [...grid];
      newGrid[selectedCell] = solution[selectedCell];
      setGrid(newGrid);
      setWrongCells((prev) => {
        const s = new Set(prev);
        s.delete(selectedCell);
        return s;
      });
      if (newHints >= MAX_HINTS) toast.error("No more hints available!", { duration: 2000 });
      checkCompletion(newGrid, solution);
    }
  };

  const handleShare = useCallback(async () => {
    const diff = game?.puzzle?.difficulty ?? "";
    const size = game?.puzzle?.gridSize ?? 9;
    const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
    const sizeLabel = `${size}×${size}`;
    const xpGain = ({ easy: 1, medium: 2, hard: 3, expert: 5 } as Record<string, number>)[diff] ?? 1;
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const appUrl = `${window.location.origin}/`;
    const lines = [
      `${completionMessage.emoji} Solved a ${sizeLabel} ${diffLabel} Sudoku in ${formattedTime}!`,
      `❌ ${mistakes} mistake${mistakes !== 1 ? "s" : ""} · 💡 ${hints} hint${hints !== 1 ? "s" : ""}`,
      pointsEarned !== null ? `+${pointsEarned.toLocaleString()} pts · +${xpGain} XP` : `+${xpGain} XP`,
      rank ? `🏅 ${rank} · Brain Games 4 All` : "🧠 Brain Games 4 All",
      `🔗 ${appUrl}`,
    ];
    const text = lines.join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Result copied to clipboard!", { duration: 2500 });
      }
    } catch {
      // user cancelled or clipboard blocked — silent
    }
  }, [game, profile, completionMessage, formattedTime, mistakes, hints, pointsEarned]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "alpha") {
        const idx = e.key.toUpperCase().charCodeAt(0) - 64;
        if (idx >= 1 && idx <= Math.min(gridSize, 9)) {
          handleNumberInput(encodeForGrid(idx));
          return;
        }
      } else {
        // For 16×16 only support keyboard 1-9; use on-screen pad for 10-16
        const maxKey = Math.min(gridSize, 9);
        const validKeys = Array.from({ length: maxKey }, (_, i) => (i + 1).toString());
        if (validKeys.includes(e.key)) {
          handleNumberInput(encodeForGrid(parseInt(e.key)));
          return;
        }
      }
      if (e.key === "Backspace" || e.key === "Delete") handleErase();
      else if (e.key === "ArrowUp" && selectedCell !== null)
        setSelectedCell(
          selectedCell >= gridSize ? selectedCell - gridSize : selectedCell,
        );
      else if (e.key === "ArrowDown" && selectedCell !== null)
        setSelectedCell(
          selectedCell < totalCells - gridSize
            ? selectedCell + gridSize
            : selectedCell,
        );
      else if (e.key === "ArrowLeft" && selectedCell !== null)
        setSelectedCell(
          selectedCell % gridSize !== 0 ? selectedCell - 1 : selectedCell,
        );
      else if (e.key === "ArrowRight" && selectedCell !== null)
        setSelectedCell(
          selectedCell % gridSize !== gridSize - 1
            ? selectedCell + 1
            : selectedCell,
        );
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCell,
    handleNumberInput,
    handleErase,
    gridSize,
    totalCells,
    mode,
  ]);

  const selectedValue =
    selectedCell !== null && grid[selectedCell] !== "0"
      ? grid[selectedCell]
      : null;

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">Loading game…</div>
    );
  if (error || !game)
    return (
      <div className="p-8 text-center text-destructive">Error loading game</div>
    );

  const MODE_LABELS: Record<GameMode, string> = {
    number: "",
    image: "🖼 Image",
    alpha: "🔤 Letters",
  };
  const GRID_LABELS: Record<number, string> = {
    3: "3×3 Child",
    4: "4×4 Mini",
    9: "9×9 Classic",
    16: "16×16 Pro",
  };

  // ─── Board touch handlers (pinch-zoom + pan + double-tap reset) ────────────
  // Plain functions (not useCallback) so they can live after the early-return guards
  // without violating the Rules of Hooks. All values are read from stable refs.
  const handleBoardTouchStart = (e: React.TouchEvent) => {
    const g = boardGesture.current;
    if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]];
      g.isPinching = true;
      g.isPanning  = false;
      g.startDist  = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      g.startScale = scaleRef.current;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      const t   = e.touches[0];
      // Double-tap → reset zoom & pan, suppress the ensuing click
      if (now - g.lastTap < 300 && scaleRef.current > 1) {
        setBoardScale(1);
        setBoardOffset({ x: 0, y: 0 });
        g.lastTap = 0;
        g.suppressNextClick = true;
        return;
      }
      g.lastTap           = now;
      g.totalMovement     = 0;
      g.suppressNextClick = false;
      if (scaleRef.current > 1) {
        g.isPanning    = true;
        g.panStartX    = t.clientX;
        g.panStartY    = t.clientY;
        g.offsetStartX = offsetRef.current.x;
        g.offsetStartY = offsetRef.current.y;
      }
    }
  };

  const handleBoardTouchMove = (e: React.TouchEvent) => {
    const g = boardGesture.current;
    if (e.touches.length === 2 && g.isPinching) {
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const next = Math.min(3, Math.max(1, g.startScale * (dist / g.startDist)));
      setBoardScale(next);
      if (next <= 1) setBoardOffset({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && g.isPanning) {
      const t  = e.touches[0];
      const dx = t.clientX - g.panStartX;
      const dy = t.clientY - g.panStartY;
      g.totalMovement = Math.max(g.totalMovement, Math.abs(dx) + Math.abs(dy));
      if (g.totalMovement > 8) {
        g.suppressNextClick = true;
        setBoardOffset({ x: g.offsetStartX + dx, y: g.offsetStartY + dy });
      }
    }
  };

  const handleBoardTouchEnd = (e: React.TouchEvent) => {
    const g = boardGesture.current;
    if (e.touches.length < 2) g.isPinching = false;
    if (e.touches.length === 0) g.isPanning  = false;
  };

  const handleBoardTouchCancel = () => {
    const g = boardGesture.current;
    g.isPinching = false;
    g.isPanning  = false;
  };

  // Capture-phase click guard — fires before any cell onClick after a pan/double-tap
  const handleBoardClickCapture = (e: React.MouseEvent) => {
    if (boardGesture.current.suppressNextClick) {
      boardGesture.current.suppressNextClick = false;
      e.stopPropagation();
    }
  };

  // Keep pushHistoryRef current every render — reads live state so snapshots are always fresh
  pushHistoryRef.current = () => {
    setHistory(prev => [...prev.slice(-29), {
      grid: [...grid],
      notes: Object.fromEntries(
        Object.entries(notes).map(([k, v]) => [k, new Set(v as Set<string>)])
      ) as Record<number, Set<string>>,
      wrongCells: new Set(wrongCells),
    }]);
  };

  const handleUndo = () => {
    if (history.length === 0 || isCompleted || isGameOver) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setGrid(prev.grid);
    setNotes(prev.notes);
    setWrongCells(prev.wrongCells);
    setSelectedCell(null);
  };

  // Cell sizing — width is driven by the 1fr grid, height matches via aspect-square
  const cellText =
    mode === "number"
      ? gridSize === 3 ? "text-5xl sm:text-7xl"
        : gridSize === 4 ? "text-4xl sm:text-5xl"
        : gridSize === 16 ? "text-[11px] sm:text-[13px] font-bold"
        : "text-2xl sm:text-3xl"
      : "";

  const diff = game?.puzzle?.difficulty ?? "";
  const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
  const sizeLabel = `${gridSize}×${gridSize}`;
  const gemsEarned = pointsEarned !== null ? Math.max(1, Math.floor(pointsEarned / 5000)) : null;

  // ── Full-page Game Over result screen ────────────────────────────────────────
  if (isGameOver) {
    return (
      <div className="max-w-lg mx-auto w-full space-y-6 animate-in fade-in duration-500 pt-4">
        <div className="rounded-2xl bg-destructive text-destructive-foreground p-6 text-center space-y-3 shadow-lg">
          <div className="text-5xl mb-1">💀</div>
          <h1 className="text-3xl font-serif font-bold">Game Over</h1>
          <p className="opacity-80 text-sm">
            {MAX_MISTAKES} mistakes made — better luck next time!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Clock, label: "Time", value: formattedTime },
            { icon: AlertTriangle, label: "Mistakes", value: `${mistakes} / ${MAX_MISTAKES}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4 text-center space-y-1">
              <Icon className="w-4 h-4 text-primary mx-auto" />
              <p className="text-xl font-black tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            className="w-full gap-2"
            onClick={() => handleNewGame(gridSize as 3 | 4 | 9 | 16, diff as "easy" | "medium" | "hard" | "expert")}
            disabled={newGameLoading}
          >
            {newGameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Try again ({sizeLabel} {diffLabel})
          </Button>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Or start a new game</p>
            <div className={`grid gap-2 ${visibleSizes.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
              {visibleSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => handleNewGame(s, newDiff)}
                  disabled={newGameLoading}
                  className={[
                    "flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-center transition-all",
                    s === gridSize
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                  ].join(" ")}
                >
                  <span className="font-black text-base text-primary">{s}×{s}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {s === 3 ? "Child" : s === 4 ? "Mini" : s === 9 ? "Classic" : "Pro"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setLocation("/")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Brain Games 4 All
        </button>
      </div>
    );
  }

  // ── Full-page Completion result screen ───────────────────────────────────────
  if (isCompleted) {
    return (
      <div className="max-w-lg mx-auto w-full space-y-6 animate-in fade-in duration-500 pt-4">
        <Confetti />

        <div className="rounded-2xl bg-primary text-primary-foreground p-6 text-center space-y-3 shadow-lg">
          <div className="text-5xl mb-1">{completionMessage.emoji}</div>
          <h1 className="text-3xl font-serif font-bold">{completionMessage.headline}</h1>
          <p className="opacity-80 text-sm">
            {sizeLabel} {diffLabel} · {formattedTime} · {mistakes} mistake{mistakes !== 1 ? "s" : ""}
          </p>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 mt-1 text-sm opacity-80 hover:opacity-100 transition-opacity bg-white/15 hover:bg-white/25 rounded-lg px-4 py-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share your result
          </button>
        </div>

        {isPersonalBest && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-yellow-300/60 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 dark:border-yellow-700/40 px-4 py-2.5">
            <span className="text-lg">🏆</span>
            <span className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">New Personal Best!</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Time", value: formattedTime },
            { icon: AlertTriangle, label: "Mistakes", value: `${mistakes} / ${MAX_MISTAKES}` },
            { icon: Trophy, label: "Points", value: pointsEarned !== null ? pointsEarned.toLocaleString() : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4 text-center space-y-1">
              <Icon className="w-4 h-4 text-primary mx-auto" />
              <p className="text-xl font-black tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {pointsEarned !== null && (
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/8 to-primary/4 p-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-black text-lg">+{pointsEarned.toLocaleString()} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-cyan-500" />
              <span className="font-black text-lg">+{gemsEarned} 💎</span>
            </div>
          </div>
        )}

        {/* Challenge result card */}
        {challengeResult && (() => {
          const isChallenger = challengeResult.challengerId === profileId;
          const opponentName = isChallenger ? challengeResult.challengedUsername : challengeResult.challengerUsername;
          const myPoints = isChallenger ? challengeResult.challengerPoints : challengeResult.challengedPoints;
          const opponentPoints = isChallenger ? challengeResult.challengedPoints : challengeResult.challengerPoints;
          const isWinner = challengeResult.winnerId === profileId;
          const isTie = challengeResult.status === "completed" && challengeResult.winnerId === null;
          const isPending = challengeResult.status !== "completed";

          return (
            <div className={[
              "rounded-2xl border-2 p-4 space-y-3",
              isWinner ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30" :
              isTie ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30" :
              isPending ? "border-muted bg-muted/30" :
              "border-red-300 bg-red-50 dark:bg-red-950/30",
            ].join(" ")}>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {isPending ? "⏳" : isWinner ? "🏆" : isTie ? "🤝" : "😔"}
                </span>
                <div>
                  <p className="font-bold text-sm">
                    {isPending
                      ? `Challenge vs ${opponentName}`
                      : isWinner ? "You won the challenge!"
                      : isTie ? "It's a tie!"
                      : "You lost the challenge"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPending
                      ? `Waiting for ${opponentName} to finish…`
                      : `vs ${opponentName}`}
                  </p>
                </div>
              </div>
              {!isPending && (
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-background/60 p-2">
                    <p className="font-black text-base">{myPoints?.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Your points</p>
                  </div>
                  <div className="rounded-xl bg-background/60 p-2">
                    <p className="font-black text-base">{opponentPoints?.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{opponentName}'s points</p>
                  </div>
                </div>
              )}
              {isWinner && (
                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold text-center">+10 💎 bonus awarded!</p>
              )}
            </div>
          );
        })()}

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleNewGame(gridSize as 3 | 4 | 9 | 16, diff as "easy" | "medium" | "hard" | "expert")}
            disabled={newGameLoading}
          >
            {newGameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Play again ({sizeLabel} {diffLabel})
          </Button>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Or start a new game</p>
            <div className="grid grid-cols-2 gap-2">
              {visibleSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => handleNewGame(s, newDiff)}
                  disabled={newGameLoading}
                  className={[
                    "flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-center transition-all",
                    s === gridSize
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                  ].join(" ")}
                >
                  <span className="font-black text-base text-primary">{s}×{s}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {s === 3 ? "Child" : s === 4 ? "Mini" : s === 9 ? "Classic" : "Pro"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setLocation("/")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Brain Games 4 All
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-1.5 md:gap-3 animate-in fade-in duration-300 pb-16 sm:pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (!isCompleted && !isGameOver) {
              setShowLeaveDialog(true);
            } else {
              setLocation("/sudoku");
            }
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Leave-game confirmation dialog */}
        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Leave this game?</DialogTitle>
              <DialogDescription>
                If you leave, this game will end and cannot be resumed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => setShowLeaveDialog(false)}>
                Keep Playing
              </Button>
              <Button className="flex-1" onClick={async () => {
                try { await customFetch(`/api/games/${gameId}/abandon`, { method: "POST" }); } catch {}
                setLocation("/sudoku");
              }}>
                Leave Game
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset confirmation dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset this puzzle?</AlertDialogTitle>
              <AlertDialogDescription>
                All your filled numbers and notes will be cleared. The puzzle will restart from scratch.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Playing</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          {profile?.showTimer !== false && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 hidden xs:block" />
              <span className="font-mono text-xs sm:text-sm">{formattedTime}</span>
            </div>
          )}
          {/* Style toggle — after timer, mobile only */}
          {!isCompleted && !isGameOver && availableModes.length > 1 && (
            <div className="md:hidden flex gap-0.5 shrink-0">
              {availableModes.map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={[
                    "flex items-center justify-center w-7 h-6 rounded text-[10px] font-bold transition-all",
                    mode === m
                      ? "bg-muted text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  title={m === "number" ? "Numbers" : m === "alpha" ? "Letters" : "Images"}
                >
                  {m === "number" ? "123" : m === "alpha" ? "ABC" : "🖼"}
                </button>
              ))}
            </div>
          )}
          {/* Only Numbers available (9×9/16×16 with style flags off) — quick difficulty picker, mobile only */}
          {!isCompleted && !isGameOver && availableModes.length === 1 && (
            <Select
              value={game.puzzle?.difficulty ?? "easy"}
              onValueChange={(v) => handleQuickDifficultyChange(v as "easy" | "medium" | "hard" | "expert")}
              disabled={quickDifficultyLoading}
            >
              <SelectTrigger className="md:hidden h-6 text-[10px] w-[4.5rem] shrink-0 px-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibleDiffs.map((d) => (
                  <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className={`flex items-center gap-1 font-semibold ${
            mistakes === 0 ? "text-muted-foreground"
            : mistakes === 1 ? "text-orange-500"
            : "text-red-500"
          }`}>
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs sm:text-sm">{mistakes}/{MAX_MISTAKES}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
            onClick={sounds.toggle}
            title={sounds.enabled ? "Mute sounds" : "Unmute sounds"}
          >
            {sounds.enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </Button>
          {!isCompleted && !isGameOver && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsPaused((p) => !p)}
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </Button>
          )}
          {/* Mobile — New Game toggle */}
          <button
            className={[
              'md:hidden flex items-center gap-0.5 px-1.5 h-7 rounded text-[10px] font-semibold transition-colors shrink-0',
              showMobileControls
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
            onClick={() => setShowMobileControls(v => !v)}
          >
            <RefreshCw className="h-3 w-3" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* ── Mobile-only: New Game panel (shown when "New" is tapped) ── */}
      {showMobileControls && (
        <div className="md:hidden w-full rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5 flex flex-col gap-1">

          {/* Current game label + Reset on the same row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Now playing:</span>
              <span className="text-foreground">{GRID_LABELS[gridSize] ?? `${gridSize}×${gridSize}`}</span>
              <span>·</span>
              <span className="capitalize text-foreground">{game.puzzle?.difficulty}</span>
            </div>
            {!isCompleted && !isGameOver && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 py-0 text-[9px] gap-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => { setShowMobileControls(false); setShowResetDialog(true); }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>

          {/* Size chips — tapping one starts immediately with the current difficulty */}
          <div className="flex gap-0.5">
            {visibleSizes.map((s) => (
              <button
                key={s}
                disabled={newGameLoading}
                onClick={() => { setNewSize(s); handleNewGame(s, newDiff); }}
                className={[
                  "flex-1 rounded py-0.5 text-[10px] font-bold transition-all leading-none disabled:opacity-50",
                  newSize === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground",
                ].join(" ")}
              >
                {newGameLoading && newSize === s
                  ? <Loader2 className="w-2.5 h-2.5 animate-spin mx-auto" />
                  : `${s}×${s}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Two-column layout: board left, controls right on desktop ── */}
      <div className="flex flex-col md:flex-row md:items-start gap-3 w-full">

        {/* LEFT — Board (fills remaining width on desktop) */}
        <div className="w-full md:flex-1 min-w-0">
          <Card
            className="w-full shadow-lg border-2 border-foreground/15 overflow-hidden relative"
            style={{ touchAction: 'none' }}
            onTouchStart={handleBoardTouchStart}
            onTouchMove={handleBoardTouchMove}
            onTouchEnd={handleBoardTouchEnd}
            onClickCapture={handleBoardClickCapture}
          >
            {/* Pause overlay */}
            {isPaused && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-md cursor-pointer"
                onClick={() => setIsPaused(false)}
              >
                <div className="rounded-full bg-primary/10 p-5">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  Paused — tap to resume
                </p>
              </div>
            )}
            {/* Zoom-level badge — visible only when zoomed in */}
            {boardScale > 1.05 && (
              <div className="absolute top-2 right-2 z-20 bg-black/55 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none select-none">
                {boardScale.toFixed(1)}× · double-tap to reset
              </div>
            )}
            {/* Transform wrapper — scales & pans the grid */}
            <div
              style={{
                transform: `translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardScale})`,
                transformOrigin: 'center center',
                willChange: boardScale !== 1 ? 'transform' : 'auto',
              }}
            >
            <div
              className="grid w-full p-0"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: "1px",
                background: "hsl(var(--foreground) / 0.12)",
              }}
            >
              {grid.map((val, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const isSelected = selectedCell === index;
                const isRelated =
                  selectedCell !== null &&
                  !isSelected &&
                  (Math.floor(selectedCell / gridSize) === row ||
                    selectedCell % gridSize === col ||
                    (boxSize > 0 &&
                      Math.floor(Math.floor(selectedCell / gridSize) / boxSize) ===
                        Math.floor(row / boxSize) &&
                      Math.floor((selectedCell % gridSize) / boxSize) ===
                        Math.floor(col / boxSize)));
                const activeHighlight = selectedValue ?? highlightedNumber;
                const isSameValue =
                  activeHighlight && val === activeHighlight && !isSelected;
                const isInitial = initialGrid[index] !== "0";
                const isWrong = wrongCells.has(index);
                const rightBorder =
                  boxSize > 0 && (col + 1) % boxSize === 0 && col !== gridSize - 1;
                const bottomBorder =
                  boxSize > 0 && (row + 1) % boxSize === 0 && row !== gridSize - 1;

                return (
                  <div
                    key={index}
                    onClick={() => { if (!isCompleted && !isGameOver) { sounds.click(); setSelectedCell(index); setHighlightedNumber(null); } }}
                    className={[
                      "flex items-center justify-center cursor-pointer select-none transition-colors aspect-square min-w-0 min-h-0",
                      cellText,
                      rightBorder ? "border-r-2 border-r-foreground/40" : "",
                      bottomBorder ? "border-b-2 border-b-foreground/40" : "",
                      isWrong && isSelected
                        ? "bg-red-200 ring-2 ring-inset ring-red-500"
                        : "",
                      isWrong && !isSelected
                        ? "bg-red-100"
                        : "",
                      !isWrong && isSelected
                        ? "bg-primary/20 ring-2 ring-inset ring-primary"
                        : "",
                      !isWrong && !isSelected && isSameValue ? "bg-primary/15" : "",
                      !isWrong && !isSelected && !isSameValue && isRelated
                        ? "bg-primary/5"
                        : "",
                      !isWrong && !isSelected && !isRelated && !isSameValue
                        ? "bg-background"
                        : "",
                      isInitial && !isSelected ? "font-bold text-foreground" : "",
                      isWrong && !isSelected
                        ? "font-medium text-red-600"
                        : !isInitial && val !== "0" && !isSelected && mode === "number"
                        ? "font-medium text-primary"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <CellContent
                      val={val}
                      mode={mode}
                      themeId={themeId}
                      gridSize={gridSize}
                      cellNotes={notes[index]}
                    />
                  </div>
                );
              })}
            </div>
            </div>{/* end transform wrapper */}
          </Card>
        </div>

        {/* RIGHT — Controls sidebar (full width on mobile, fixed 260px on desktop) */}
        <div className="flex flex-col gap-3 w-full md:w-[260px] shrink-0">

          {/* Mode switcher — desktop only (shown above board on mobile) */}
          <div className="hidden md:block">
          {!isCompleted && !isGameOver && availableModes.length > 1 && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">Style</span>
              <div className="flex gap-1 flex-1">
                {availableModes.map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={[
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-1 justify-center",
                      mode === m
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    ].join(" ")}
                  >
                    {m === "number" && <Hash className="w-3 h-3" />}
                    {m === "alpha" && <Type className="w-3 h-3" />}
                    {m === "image" && <Image className="w-3 h-3" />}
                    <span>{m === "number" ? "123" : m === "alpha" ? "ABC" : "🖼"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {!isCompleted && !isGameOver && availableModes.length === 1 && (
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">Difficulty</span>
              <Select
                value={game.puzzle?.difficulty ?? "easy"}
                onValueChange={(v) => handleQuickDifficultyChange(v as "easy" | "medium" | "hard" | "expert")}
                disabled={quickDifficultyLoading}
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibleDiffs.map((d) => (
                    <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          </div>{/* end hidden md:block — Mode switcher */}

          {/* New game switcher — desktop only (shown above board on mobile) */}
          <div className="hidden md:block">
          <div className="w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">New Game</span>
            <div className={`grid gap-1.5 ${visibleSizes.length === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {visibleSizes.map((s) => (
                <button
                  key={s}
                  disabled={newGameLoading}
                  onClick={() => { setNewSize(s); handleNewGame(s, newDiff); }}
                  className={[
                    "rounded-md py-1.5 text-xs font-bold transition-all leading-none disabled:opacity-50",
                    newSize === s
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {newGameLoading && newSize === s
                    ? <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                    : `${s}×${s}`}
                </button>
              ))}
            </div>
          </div>
          </div>{/* end hidden md:block — New game switcher */}

          {/* Controls */}
          {!isCompleted && (
            <div className="grid grid-cols-5 gap-1.5 w-full">
              <Button
                variant={notesMode ? "default" : "secondary"}
                className="flex-col h-12 gap-0.5"
                onClick={() => setNotesMode(!notesMode)}
              >
                <PenLine className="h-4 w-4" />
                <span className="text-[11px]">Notes</span>
              </Button>

              <div className={[
                "flex flex-col items-center justify-center h-12 rounded-md border gap-0.5 select-none",
                mistakes === 0
                  ? "bg-muted/50 border-border text-muted-foreground"
                  : mistakes === 1
                  ? "bg-orange-50 border-orange-200 text-orange-600"
                  : "bg-red-50 border-red-200 text-red-600",
              ].join(" ")}>
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[10px] font-semibold leading-none">{MAX_MISTAKES - mistakes} left</span>
              </div>

              <Button
                variant="secondary"
                className="flex-col h-12 gap-0.5 relative"
                onClick={handleHint}
                disabled={isGameOver || hints >= MAX_HINTS || selectedCell === null || grid[selectedCell] !== "0"}
              >
                <Lightbulb className={`h-4 w-4 ${hints >= MAX_HINTS ? "opacity-40" : ""}`} />
                <span className="text-[11px]">Hint</span>
                <span className={`text-[9px] font-bold leading-none ${hints >= MAX_HINTS ? "text-red-400" : "text-primary"}`}>
                  {MAX_HINTS - hints} left
                </span>
              </Button>

              <Button
                variant="secondary"
                className="flex-col h-12 gap-0.5"
                onClick={handleErase}
                disabled={isGameOver || selectedCell === null || initialGrid[selectedCell] !== "0"}
              >
                <Eraser className="h-4 w-4" />
                <span className="text-[11px]">Erase</span>
              </Button>

              <Button
                variant="secondary"
                className="flex-col h-12 gap-0.5"
                onClick={handleUndo}
                disabled={isGameOver || history.length === 0}
              >
                <Undo2 className="h-4 w-4" />
                <span className="text-[11px]">Undo</span>
              </Button>
            </div>
          )}

          {/* Input pad */}
          {!isCompleted && (
            <div
              className={`grid w-full ${
                gridSize === 16
                  ? "gap-1 grid-cols-8 md:grid-cols-8"
                  : gridSize === 4
                  ? "gap-1.5 grid-cols-4"
                  : gridSize === 3
                  ? "gap-1.5 grid-cols-3"
                  : "gap-1 grid-cols-9 md:gap-1.5 md:grid-cols-5"
              }`}
            >
              {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => {
                const encoded = encodeForGrid(num);
                const done = completedNumbers.has(encoded);
                const remaining = gridSize - (numberCounts.get(encoded) ?? 0);
                return (
                  <Button
                    key={num}
                    variant="outline"
                    disabled={done || isGameOver}
                    className={[
                      "flex flex-col items-center justify-center relative gap-0",
                      mode !== "number"
                        ? gridSize === 9 ? "h-10 md:h-12 p-0.5" : "h-12 p-0.5"
                        : gridSize === 16 ? "h-10"
                        : gridSize === 9 ? "h-10 md:h-12"
                        : "h-12",
                      done ? "opacity-30" : "",
                      highlightedNumber === encoded && !done ? "ring-2 ring-primary" : "",
                    ].join(" ")}
                    onClick={() => { setHighlightedNumber(encoded); handleNumberInput(encoded); }}
                  >
                    {mode === "image" ? (
                      <div className={`flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_img]:!w-full [&_img]:!h-full ${
                        gridSize === 16 ? "w-3.5 h-3.5" : gridSize === 9 ? "w-6 h-6" : "w-8 h-8"
                      }`}>
                        <ThemeIcon themeId={themeId} value={num} size={48} />
                      </div>
                    ) : mode === "alpha" ? (
                      <AlphaLetter value={num} size={gridSize === 3 ? 28 : gridSize === 4 ? 24 : gridSize === 16 ? 10 : 18} />
                    ) : (
                      <span className={gridSize === 16 ? "text-xs font-semibold leading-none" : gridSize === 9 ? "text-lg font-semibold leading-none" : "text-xl font-semibold leading-none"}>{num}</span>
                    )}
                    {!done && (
                      <span className="text-[9px] leading-none text-muted-foreground font-medium mt-0.5">{remaining}</span>
                    )}
                  </Button>
                );
              })}
            </div>
          )}

        </div>{/* end right sidebar */}
      </div>{/* end two-column */}
    </div>
  );
}
