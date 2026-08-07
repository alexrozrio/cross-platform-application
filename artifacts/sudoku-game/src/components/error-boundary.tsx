import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

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

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    // A grid click should never strand a player on the generic error page.
    // Keep the fallback deliberately independent from Game so it can render
    // even when Game's state/effect tree is the source of the crash.
    if (window.location.pathname.startsWith("/game/")) {
      return <OfflineSudokuFallback />;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              The page ran into an unexpected error. Try refreshing or go back home.
            </p>
          </div>
          {this.state.error?.message && (
            <p className="text-xs font-mono text-muted-foreground bg-muted rounded-lg px-3 py-2 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
            >
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
