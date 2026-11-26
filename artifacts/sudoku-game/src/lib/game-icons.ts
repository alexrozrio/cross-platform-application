import {
  Bomb,
  Box,
  Brain,
  Calculator,
  CircleHelp,
  FlaskConical,
  Globe,
  Grid2x2,
  Images,
  Grid3x3,
  LayoutGrid,
  ListOrdered,
  Puzzle,
  WholeWord,
  LetterText,
  type LucideIcon,
} from "lucide-react";
import { Snake as SnakeIcon } from "@/components/snake-icon";

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
  "game-2048": LayoutGrid,
  jumble: LetterText,
  snake: SnakeIcon,
  rubiks: Box,
  "science-quiz": FlaskConical,
  "maths-quiz": Calculator,
  "gk-quiz": Globe,
  "odd-images": Images,
  "memory-order": ListOrdered,
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
  "game-2048": "text-orange-600",
  jumble: "text-cyan-600",
  snake: "text-green-600",
  rubiks: "text-rose-600",
  "science-quiz": "text-violet-600",
  "maths-quiz": "text-sky-600",
  "gk-quiz": "text-amber-600",
  "odd-images": "text-teal-600",
  "memory-order": "text-fuchsia-600",
};

export function gameIconColor(id: string | null | undefined): string {
  return (id && GAME_ICON_COLORS[id]) || "text-muted-foreground";
}
