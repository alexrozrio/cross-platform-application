import {
  Bomb,
  Brain,
  Calculator,
  CircleHelp,
  FlaskConical,
  Globe,
  Grid2x2,
  Grid3x3,
  Puzzle,
  WholeWord,
  type LucideIcon,
} from "lucide-react";

/**
 * Shared game icons used across the app (challenges, leaderboards, home).
 * Keys are game IDs — the three quiz games each get their own icon.
 */
export const GAME_ICONS: Record<string, LucideIcon> = {
  sudoku: Grid3x3,
  memory: Brain,
  jigsaw: Puzzle,
  "word-search": WholeWord,
  minesweeper: Bomb,
  "slide-puzzle": Grid2x2,
  "science-quiz": FlaskConical,
  "maths-quiz": Calculator,
  "gk-quiz": Globe,
};

export function gameIcon(id: string | null | undefined): LucideIcon {
  return (id && GAME_ICONS[id]) || CircleHelp;
}

/** Accent text color per game, matching each game's theme across the app. */
export const GAME_ICON_COLORS: Record<string, string> = {
  sudoku: "text-primary",
  memory: "text-violet-500",
  jigsaw: "text-amber-500",
  "word-search": "text-violet-600",
  minesweeper: "text-emerald-600",
  "slide-puzzle": "text-sky-600",
  "science-quiz": "text-violet-600",
  "maths-quiz": "text-sky-600",
  "gk-quiz": "text-amber-600",
};

export function gameIconColor(id: string | null | undefined): string {
  return (id && GAME_ICON_COLORS[id]) || "text-muted-foreground";
}
