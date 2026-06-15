import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import {
  useGetGame,
  useSaveGame,
  useCompleteGame,
  useGetProfile,
  useGeneratePuzzle,
  useCreateGame,
  customFetch,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useGameTimer } from "@/hooks/use-game-logic";
import { useImageTheme } from "@/hooks/use-image-theme";
import { ThemeIcon } from "@/components/theme-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Pause,
  Play,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  const imgSize = gridSize === 3 ? 52 : gridSize === 4 ? 46 : gridSize === 16 ? 18 : 32;
  const alphaSize = gridSize === 3 ? 44 : gridSize === 4 ? 36 : gridSize === 16 ? 12 : 24;

  if (val !== "0") {
    const n = decodeFromGrid(val);
    if (mode === "image")
      return <ThemeIcon themeId={themeId} value={n} size={imgSize} />;
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
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const modeParam = params.get("mode");
  const mode: GameMode =
    modeParam === "image"
      ? "image"
      : modeParam === "alpha"
        ? "alpha"
        : "number";

  const switchMode = (newMode: GameMode) => {
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

  const [grid, setGrid] = useState<string[]>(Array(totalCells).fill("0"));
  const [initialGrid, setInitialGrid] = useState<string[]>(
    Array(totalCells).fill("0"),
  );
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Record<number, Set<string>>>({});
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wrongCells, setWrongCells] = useState<Set<number>>(new Set());

  const MAX_MISTAKES = 3;
  const MAX_HINTS = 3;
  const [isPaused, setIsPaused] = useState(false);

  // New-game switcher state — initialise to current game's grid size
  const [newSize, setNewSize] = useState<3 | 4 | 9 | 16>(9);
  const [newDiff, setNewDiff] = useState<"easy" | "medium" | "hard" | "expert">("easy");

  const generateNew = useGeneratePuzzle(
    { difficulty: newDiff, gridSize: newSize as any },
    { query: { enabled: false } },
  );
  const createNewGame = useCreateGame();
  const newGameLoading = generateNew.isFetching || createNewGame.isPending;

  const handleNewGame = async () => {
    if (!profileId || newGameLoading) return;
    try {
      const res = await generateNew.refetch();
      const puzzle = res.data;
      if (!puzzle) return;
      const game = await createNewGame.mutateAsync({
        data: { profileId, puzzleId: puzzle.id, difficulty: newDiff },
      });
      const modeQuery = mode !== "number" ? `?mode=${mode}` : "";
      setLocation(`/game/${game.id}${modeQuery}`);
    } catch (err) {
      console.error("Error starting new game:", err);
    }
  };

  const { seconds, formattedTime } = useGameTimer(
    game?.elapsedSeconds || 0,
    !isCompleted && !isGameOver && !isPaused && game?.status === "active",
  );
  const saveTimeoutRef = useRef<number | null>(null);

  // Sync new-game size pill to the current game's grid size
  useEffect(() => {
    if (gridSize && [3, 4, 9, 16].includes(gridSize)) {
      setNewSize(gridSize as 3 | 4 | 9 | 16);
    }
  }, [gridSize]);

  useEffect(() => {
    if (game && !isCompleted && !isGameOver) {
      if (game.status === "completed") setIsCompleted(true);
      const loadedGrid = game.currentGrid.split("");
      const loadedInitial = game.puzzle?.grid.split("") || Array(totalCells).fill("0");
      setGrid(loadedGrid);
      setInitialGrid(loadedInitial);
      const loadedMistakes = game.mistakeCount || 0;
      setMistakes(loadedMistakes);
      setHints(game.hintsUsed || 0);
      // Derive wrong cells from current grid vs solution
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
      if (loadedMistakes >= MAX_MISTAKES) setIsGameOver(true);
    }
  }, [game, isCompleted, isGameOver, totalCells]);

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

  const checkCompletion = useCallback(
    (currentGrid: string[], solution?: string) => {
      if (!solution) return;
      if (currentGrid.join("") === solution) {
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
              const pts = data.points ?? null;
              setPointsEarned(pts);
              toast.success("Puzzle Solved!", {
                description: pts
                  ? `+${pts.toLocaleString()} pts • ${formattedTime}`
                  : `Time: ${formattedTime} • Mistakes: ${mistakes}`,
              });

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

      if (notesMode) {
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
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setWrongCells((prev) => new Set([...prev, selectedCell]));
        if (newMistakes >= MAX_MISTAKES) {
          setIsGameOver(true);
          toast.error("Game Over! 3 mistakes reached.", { duration: 5000 });
        } else {
          toast.error(`Wrong! ${MAX_MISTAKES - newMistakes} mistake${MAX_MISTAKES - newMistakes !== 1 ? "s" : ""} left.`, { duration: 1200 });
        }
      } else {
        // Correct — remove from wrong cells if it was wrong before
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
    const newGrid = [...grid];
    newGrid[selectedCell] = "0";
    setGrid(newGrid);
    setWrongCells((prev) => {
      const s = new Set(prev);
      s.delete(selectedCell);
      return s;
    });
  }, [selectedCell, isCompleted, isGameOver, initialGrid, grid]);

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

  // Cell sizing
  const cellH =
    gridSize === 3 ? "h-20 w-20"
    : gridSize === 4 ? "h-[72px] w-[72px]"
    : gridSize === 16 ? "h-9 w-9"
    : "h-11 w-11";
  const cellText =
    mode === "number"
      ? gridSize === 3 ? "text-4xl"
        : gridSize === 4 ? "text-2xl"
        : gridSize === 16 ? "text-xs font-bold"
        : "text-base"
      : "";

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full gap-5 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/sudoku")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground flex-wrap justify-center">
          <span>{GRID_LABELS[gridSize] ?? `${gridSize}×${gridSize}`}</span>
          <span>•</span>
          <span className="capitalize">{game.puzzle?.difficulty}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          {profile?.showTimer !== false && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formattedTime}</span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 font-semibold ${
            mistakes === 0 ? "text-muted-foreground"
            : mistakes === 1 ? "text-orange-500"
            : "text-red-500"
          }`}>
            <AlertTriangle className="h-4 w-4" />
            <span>{mistakes}/{MAX_MISTAKES}</span>
          </div>
          {!isCompleted && !isGameOver && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsPaused((p) => !p)}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mode switcher */}
      {!isCompleted && (
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">Style</span>
          <div className="flex gap-1 flex-1">
            {(["number", "alpha", "image"] as GameMode[]).map((m) => (
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

      {/* New game switcher */}
      <div className="w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">New Game</span>
        <div className="flex gap-1 flex-1 min-w-0">
          {([3, 4, 9, 16] as const).map((s) => (
            <button
              key={s}
              onClick={() => setNewSize(s)}
              className={[
                "flex-1 rounded-md px-1 py-1 text-[10px] font-bold transition-all leading-none",
                newSize === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground",
              ].join(" ")}
            >
              {s}×{s}
            </button>
          ))}
        </div>
        <Select value={newDiff} onValueChange={(v) => setNewDiff(v as typeof newDiff)}>
          <SelectTrigger className="h-7 text-xs w-24 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-7 px-3 text-xs shrink-0 gap-1.5"
          onClick={handleNewGame}
          disabled={newGameLoading || !profileId}
        >
          {newGameLoading
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <RefreshCw className="w-3 h-3" />}
          Start
        </Button>
      </div>

      {/* Board */}
      <Card className="shadow-lg border-2 border-foreground/15 overflow-hidden relative">
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
        <div
          className="grid p-1"
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
            const isSameValue =
              selectedValue && val === selectedValue && !isSelected;
            const isInitial = initialGrid[index] !== "0";
            const isWrong = wrongCells.has(index);
            const rightBorder =
              boxSize > 0 && (col + 1) % boxSize === 0 && col !== gridSize - 1;
            const bottomBorder =
              boxSize > 0 && (row + 1) % boxSize === 0 && row !== gridSize - 1;

            return (
              <div
                key={index}
                onClick={() => !isCompleted && !isGameOver && setSelectedCell(index)}
                className={[
                  "flex items-center justify-center cursor-pointer select-none transition-colors",
                  cellH,
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
      </Card>

      {/* Game Over banner */}
      {isGameOver && (
        <Card className="bg-destructive text-destructive-foreground border-none w-full">
          <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
            <h2 className="text-2xl font-serif font-bold">Game Over 💀</h2>
            <p className="opacity-90 text-sm">
              You made {MAX_MISTAKES} mistakes — better luck next time!
            </p>
            <div className="flex gap-2 w-full mt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setLocation("/sudoku")}
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setLocation("/")}
              >
                Game Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed banner */}
      {isCompleted && (
        <Card className="bg-primary text-primary-foreground border-none w-full">
          <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
            <h2 className="text-2xl font-serif font-bold">Puzzle Solved! 🎉</h2>
            <p className="opacity-90 text-sm">
              {formattedTime} • {mistakes} mistake{mistakes !== 1 ? "s" : ""}
            </p>
            {pointsEarned !== null && (
              <div className="flex gap-6 items-end justify-center">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-4xl font-black tracking-tight">
                    +{pointsEarned.toLocaleString()}
                  </span>
                  <span className="text-sm opacity-80 uppercase tracking-widest font-semibold">
                    points
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-4xl font-black tracking-tight">
                    +{Math.max(1, Math.floor(pointsEarned / 5000))}
                  </span>
                  <span className="text-sm opacity-80 uppercase tracking-widest font-semibold">
                    💎 gems
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-2 w-full mt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setLocation("/sudoku")}
              >
                Play Again
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setLocation("/leaderboard")}
              >
                Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      {!isCompleted && (
        <div className="grid grid-cols-4 gap-2 w-full">
          <Button
            variant={notesMode ? "default" : "secondary"}
            className="flex-col h-16 gap-0.5"
            onClick={() => setNotesMode(!notesMode)}
          >
            <PenLine className="h-5 w-5" />
            <span className="text-xs">Notes</span>
          </Button>

          {/* Mistakes remaining */}
          <div className={[
            "flex flex-col items-center justify-center h-16 rounded-md border gap-0.5 select-none",
            mistakes === 0
              ? "bg-muted/50 border-border text-muted-foreground"
              : mistakes === 1
              ? "bg-orange-50 border-orange-200 text-orange-600"
              : "bg-red-50 border-red-200 text-red-600",
          ].join(" ")}>
            <AlertTriangle className="h-5 w-5" />
            <span className="text-[11px] font-semibold leading-none">
              {MAX_MISTAKES - mistakes} left
            </span>
          </div>

          {/* Hint button with remaining count */}
          <Button
            variant="secondary"
            className="flex-col h-16 gap-0.5 relative"
            onClick={handleHint}
            disabled={
              isGameOver ||
              hints >= MAX_HINTS ||
              selectedCell === null ||
              grid[selectedCell] !== "0"
            }
          >
            <Lightbulb className={`h-5 w-5 ${hints >= MAX_HINTS ? "opacity-40" : ""}`} />
            <span className="text-xs">Hint</span>
            <span className={`text-[10px] font-bold leading-none ${
              hints >= MAX_HINTS ? "text-red-400" : "text-primary"
            }`}>
              {MAX_HINTS - hints} left
            </span>
          </Button>

          <Button
            variant="secondary"
            className="flex-col h-16 gap-0.5"
            onClick={handleErase}
            disabled={
              isGameOver ||
              selectedCell === null ||
              initialGrid[selectedCell] !== "0"
            }
          >
            <Eraser className="h-5 w-5" />
            <span className="text-xs">Erase</span>
          </Button>
        </div>
      )}

      {/* Input pad */}
      {!isCompleted && (
        <div
          className="grid gap-1.5 w-full"
          style={{
            gridTemplateColumns: `repeat(${
              gridSize <= 4 ? gridSize : gridSize === 16 ? 8 : 5
            }, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => (
            <Button
              key={num}
              variant="outline"
              className={[
                "flex items-center justify-center",
                mode !== "number" ? "h-12 p-0.5" : gridSize === 16 ? "h-10" : "h-14",
              ].join(" ")}
              onClick={() => handleNumberInput(encodeForGrid(num))}
            >
              {mode === "image" ? (
                <ThemeIcon
                  themeId={themeId}
                  value={num}
                  size={gridSize <= 4 ? 46 : gridSize === 16 ? 22 : 34}
                />
              ) : mode === "alpha" ? (
                <AlphaLetter
                  value={num}
                  size={gridSize === 3 ? 36 : gridSize === 4 ? 28 : gridSize === 16 ? 14 : 22}
                />
              ) : (
                <span className={gridSize === 16 ? "text-sm font-semibold" : "text-xl font-medium"}>{num}</span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
