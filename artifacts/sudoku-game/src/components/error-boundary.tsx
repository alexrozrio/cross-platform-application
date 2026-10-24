import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Grid3X3, Brain } from "lucide-react";

const OFFLINE_PUZZLE =
  "530070000" +
  "600195000" +
  "098000060" +
  "800060003" +
  "400803001" +
  "700020006" +
  "060000280" +
  "000419005" +
  "000080079";
const OFFLINE_SOLUTION =
  "534678912" +
  "672195348" +
  "198342567" +
  "859761423" +
  "426853791" +
  "713924856" +
  "961537284" +
  "287419635" +
  "345286179";

interface State {
  hasError: boolean;
  error: Error | null;
  recoveryGame: "sudoku" | "memory" | null;
}

function OfflineSudokuFallback() {
  const [grid, setGrid] = React.useState(() => OFFLINE_PUZZLE.split(""));
  const [selectedCell, setSelectedCell] = React.useState<number | null>(null);
  const [completed, setCompleted] = React.useState(false);

  const placeNumber = (value: string) => {
    if (selectedCell === null || OFFLINE_PUZZLE[selectedCell] !== "0") return;
    const next = [...grid];
    next[selectedCell] = value;
    setGrid(next);
    setCompleted(next.join("") === OFFLINE_SOLUTION);
  };

  const erase = () => {
    if (selectedCell === null || OFFLINE_PUZZLE[selectedCell] !== "0") return;
    const next = [...grid];
    next[selectedCell] = "0";
    setGrid(next);
    setCompleted(false);
  };

  return (
    <div className="min-h-[70vh] w-full max-w-lg mx-auto px-3 py-4 space-y-4">
      <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 px-4 py-3 text-center">
        <p className="font-bold text-amber-900 dark:text-amber-200">Offline Sudoku</p>
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
          The connection dropped, so you’re playing a local puzzle. Your progress stays on this device.
        </p>
      </div>

      <div
        role="grid"
        aria-label="Offline Sudoku grid"
        className="grid grid-cols-9 aspect-square w-full max-w-[min(92vw,30rem)] mx-auto gap-px rounded-lg border-2 border-foreground bg-foreground overflow-hidden"
      >
        {grid.map((value, index) => {
          const isClue = OFFLINE_PUZZLE[index] !== "0";
          const isSelected = selectedCell === index;
          const row = Math.floor(index / 9);
          const col = index % 9;
          const thickRight = col === 2 || col === 5;
          const thickBottom = row === 2 || row === 5;
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={`Row ${row + 1}, column ${col + 1}${value !== "0" ? `, ${value}` : ", empty"}`}
              onClick={() => !isClue && setSelectedCell(index)}
              className={[
                "flex items-center justify-center bg-card text-lg sm:text-2xl font-semibold select-none",
                isClue ? "text-foreground" : "text-primary",
                isSelected ? "bg-primary/20 ring-2 ring-inset ring-primary" : "hover:bg-muted",
                thickRight ? "border-r-2 border-r-foreground" : "",
                thickBottom ? "border-b-2 border-b-foreground" : "",
              ].join(" ")}
            >
              {value === "0" ? "" : value}
            </button>
          );
        })}
      </div>

      {completed ? (
        <p className="text-center font-bold text-emerald-600 dark:text-emerald-400">
          Puzzle complete — nice work!
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Select an empty cell, then choose a number.
        </p>
      )}

      <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => placeNumber(value)}
            disabled={selectedCell === null}
            className="h-11 rounded-lg border border-border bg-card text-lg font-semibold hover:bg-muted disabled:opacity-40"
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          onClick={erase}
          disabled={selectedCell === null}
          className="col-span-5 h-10 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-40"
        >
          Clear selected cell
        </button>
      </div>
    </div>
  );
}

const MEMORY_SYMBOLS = ["🍀", "🍋", "⭐", "🎧", "🌙", "🐚", "🍓", "🎈"];

function createOfflineMemoryDeck() {
  const cards = MEMORY_SYMBOLS.flatMap((symbol, pair) => [
    { symbol, pair },
    { symbol, pair },
  ]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function OfflineMemoryFallback() {
  const [cards, setCards] = React.useState(createOfflineMemoryDeck);
  const [revealed, setRevealed] = React.useState<number[]>([]);
  const [matched, setMatched] = React.useState<number[]>([]);
  const [locked, setLocked] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const startNewGame = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setCards(createOfflineMemoryDeck());
    setRevealed([]);
    setMatched([]);
    setLocked(false);
  };

  const revealCard = (index: number) => {
    if (locked || matched.includes(index) || revealed.includes(index)) return;
    if (revealed.length === 0) {
      setRevealed([index]);
      return;
    }

    const firstIndex = revealed[0];
    setRevealed([firstIndex, index]);
    if (cards[firstIndex].pair === cards[index].pair) {
      setMatched((current) => [...current, firstIndex, index]);
      setRevealed([]);
      return;
    }

    setLocked(true);
    timeoutRef.current = window.setTimeout(() => {
      setRevealed([]);
      setLocked(false);
      timeoutRef.current = null;
    }, 700);
  };

  const isComplete = matched.length === cards.length;

  return (
    <div className="min-h-[70vh] w-full max-w-md mx-auto px-4 py-6 space-y-5">
      <div className="rounded-xl border border-primary/20 bg-card px-4 py-3 text-center">
        <p className="font-bold">Offline Memory Match</p>
        <p className="text-sm text-muted-foreground">
          Match all 8 pairs. This local game does not need an account or database.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {isComplete ? "All pairs matched!" : `${matched.length / 2} of 8 pairs`}
        </p>
        <Button variant="outline" size="sm" onClick={startNewGame}>
          New game
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card, index) => {
          const isVisible = revealed.includes(index) || matched.includes(index);
          return (
            <button
              key={`${card.pair}-${index}`}
              type="button"
              aria-label={isVisible ? `Card ${index + 1}: ${card.symbol}` : `Card ${index + 1}, hidden`}
              aria-pressed={isVisible}
              onClick={() => revealCard(index)}
              disabled={locked || matched.includes(index)}
              className={[
                "aspect-square rounded-xl border-2 text-3xl sm:text-4xl transition-colors",
                isVisible
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50",
                matched.includes(index) ? "opacity-70" : "",
              ].join(" ")}
            >
              {isVisible ? card.symbol : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, recoveryGame: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, recoveryGame: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.state.recoveryGame === "sudoku") return <OfflineSudokuFallback />;
    if (this.state.recoveryGame === "memory") return <OfflineMemoryFallback />;

    // A grid click should never strand a player on the generic error page.
    // Keep the fallback deliberately independent from Game so it can render
    // even when Game's state/effect tree is the source of the crash.
    if (window.location.pathname.startsWith("/game/")) {
      return <OfflineSudokuFallback />;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Grid3X3 className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Choose a game to keep playing</h2>
            <p className="text-sm text-muted-foreground">
              Play Brain Games remains playable offline. Online profiles and rewards may be unavailable.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              className="w-full gap-2"
              onClick={() => this.setState({ recoveryGame: "sudoku" })}
            >
              <Grid3X3 className="w-4 h-4" /> Play Sudoku
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => this.setState({ recoveryGame: "memory" })}
            >
              <Brain className="w-4 h-4" /> Play Memory Match
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" /> Reload app
          </Button>
        </div>
      </div>
    );
  }
}
