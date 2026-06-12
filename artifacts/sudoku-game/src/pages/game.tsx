import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import {
  useGetGame,
  useSaveGame,
  useCompleteGame,
  useGetProfile,
} from "@workspace/api-client-react";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

  const { seconds, formattedTime } = useGameTimer(
    game?.elapsedSeconds || 0,
    !isCompleted && game?.status === "active",
  );
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (game && !isCompleted) {
      if (game.status === "completed") setIsCompleted(true);
      setGrid(game.currentGrid.split(""));
      setInitialGrid(
        game.puzzle?.grid.split("") || Array(totalCells).fill("0"),
      );
      setMistakes(game.mistakeCount || 0);
      setHints(game.hintsUsed || 0);
    }
  }, [game, isCompleted, totalCells]);

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
            onSuccess: (data) => {
              const pts = data.points ?? null;
              setPointsEarned(pts);
              toast.success("Puzzle Solved!", {
                description: pts
                  ? `+${pts.toLocaleString()} pts • ${formattedTime}`
                  : `Time: ${formattedTime} • Mistakes: ${mistakes}`,
              });
            },
          },
        );
      }
    },
    [gameId, seconds, mistakes, hints, formattedTime, completeGame],
  );

  const handleNumberInput = useCallback(
    (num: string) => {
      if (selectedCell === null || isCompleted) return;
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
      if (solution && solution[selectedCell] !== num) {
        setMistakes((m) => m + 1);
        if (profile?.highlightErrors !== false)
          toast.error("Incorrect!", { duration: 700 });
        return;
      }

      const newGrid = [...grid];
      newGrid[selectedCell] = num;
      setGrid(newGrid);
      setNotes((prev) => {
        const n = { ...prev };
        delete n[selectedCell!];
        return n;
      });
      checkCompletion(newGrid, solution);
    },
    [
      selectedCell,
      isCompleted,
      initialGrid,
      notesMode,
      game,
      grid,
      profile,
      checkCompletion,
    ],
  );

  const handleErase = useCallback(() => {
    if (
      selectedCell === null ||
      isCompleted ||
      initialGrid[selectedCell] !== "0"
    )
      return;
    const newGrid = [...grid];
    newGrid[selectedCell] = "0";
    setGrid(newGrid);
  }, [selectedCell, isCompleted, initialGrid, grid]);

  const handleHint = () => {
    if (
      selectedCell === null ||
      isCompleted ||
      initialGrid[selectedCell] !== "0" ||
      grid[selectedCell] !== "0"
    )
      return;
    const solution = game?.puzzle?.solution;
    if (solution) {
      setHints((h) => h + 1);
      const newGrid = [...grid];
      newGrid[selectedCell] = solution[selectedCell];
      setGrid(newGrid);
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
        <div className="flex items-center gap-3 text-sm font-medium">
          {profile?.showTimer !== false && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formattedTime}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>{mistakes}</span>
          </div>
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

      {/* Board */}
      <Card className="shadow-lg border-2 border-foreground/15 overflow-hidden">
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
            const rightBorder =
              boxSize > 0 && (col + 1) % boxSize === 0 && col !== gridSize - 1;
            const bottomBorder =
              boxSize > 0 && (row + 1) % boxSize === 0 && row !== gridSize - 1;

            return (
              <div
                key={index}
                onClick={() => !isCompleted && setSelectedCell(index)}
                className={[
                  "flex items-center justify-center cursor-pointer select-none transition-colors",
                  cellH,
                  cellText,
                  rightBorder ? "border-r-2 border-r-foreground/40" : "",
                  bottomBorder ? "border-b-2 border-b-foreground/40" : "",
                  isSelected
                    ? "bg-primary/20 ring-2 ring-inset ring-primary"
                    : "",
                  !isSelected && isSameValue ? "bg-primary/15" : "",
                  !isSelected && !isSameValue && isRelated
                    ? "bg-primary/5"
                    : "",
                  !isSelected && !isRelated && !isSameValue
                    ? "bg-background"
                    : "",
                  isInitial && !isSelected ? "font-bold text-foreground" : "",
                  !isInitial && val !== "0" && !isSelected && mode === "number"
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
        <div className="grid grid-cols-3 gap-2 w-full">
          <Button
            variant={notesMode ? "default" : "secondary"}
            className="flex-col h-16 gap-1"
            onClick={() => setNotesMode(!notesMode)}
          >
            <PenLine className="h-5 w-5" />
            <span className="text-xs">Notes</span>
          </Button>
          <Button
            variant="secondary"
            className="flex-col h-16 gap-1"
            onClick={handleHint}
            disabled={selectedCell === null || grid[selectedCell] !== "0"}
          >
            <Lightbulb className="h-5 w-5" />
            <span className="text-xs">Hint</span>
          </Button>
          <Button
            variant="secondary"
            className="flex-col h-16 gap-1"
            onClick={handleErase}
            disabled={
              selectedCell === null || initialGrid[selectedCell] !== "0"
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
