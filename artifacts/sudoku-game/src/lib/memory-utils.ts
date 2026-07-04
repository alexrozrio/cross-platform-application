// ─── Extracted pure helpers for Memory Match ─────────────────────────────────
// Shared by the game page and unit tests.

export type GridSize = 2 | 4 | 6 | 8;
export type DisplayMode = 'image' | 'number' | 'alpha';

export interface Card {
  id: number;
  value: number; // 1-based symbol index
  flipped: boolean;
  matched: boolean;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getPairs(gridSize: GridSize): number {
  if (gridSize === 2) return 4;  // 2×4  = 8 cards  = 4 pairs
  if (gridSize === 4) return 8;  // 4×4  = 16 cards = 8 pairs
  if (gridSize === 6) return 16; // 4×8  = 32 cards = 16 pairs
  return 32;                     // 8×8  = 64 cards = 32 pairs
}

export function buildDeck(gridSize: GridSize): Card[] {
  const pairs = getPairs(gridSize);
  const values = Array.from({ length: pairs }, (_, i) => i + 1);
  const doubled = [...values, ...values];
  return shuffle(doubled).map((value, id) => ({ id, value, flipped: false, matched: false }));
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export const ALPHA_LABELS: string[] = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'a','b','c','d','e','f',
];

export function getCardLabel(value: number, mode: DisplayMode): string {
  if (mode === 'number') return String(value);
  if (mode === 'alpha') return ALPHA_LABELS[value - 1] ?? String(value);
  return '';
}
