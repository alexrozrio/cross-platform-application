// Snake engine: classic Nokia-style snake on a bounded grid. The food
// sequence is deterministic given (seed, difficulty) so daily challenges
// and duels produce identical food placement for every player.

export type SnakeDifficulty = "easy" | "medium" | "hard" | "expert";

export interface SnakeLevel {
  id: SnakeDifficulty;
  label: string;
  /** Grid is gridSize x gridSize cells. */
  gridSize: number;
  /** Movement speed in cells per second. */
  speed: number;
  /** Food items to eat to complete the round. */
  foods: number;
  mode: "baby" | "adult";
  parSeconds: number;
  basePoints: number;
  xp: number;
  gems: number;
}

export const SNAKE_LEVELS: Record<SnakeDifficulty, SnakeLevel> = {
  easy: { id: "easy", label: "Easy", gridSize: 12, speed: 4, foods: 8, mode: "baby", parSeconds: 180, basePoints: 300, xp: 1, gems: 1 },
  medium: { id: "medium", label: "Medium", gridSize: 14, speed: 6, foods: 12, mode: "baby", parSeconds: 300, basePoints: 650, xp: 2, gems: 2 },
  hard: { id: "hard", label: "Hard", gridSize: 16, speed: 9, foods: 16, mode: "adult", parSeconds: 420, basePoints: 1300, xp: 3, gems: 3 },
  expert: { id: "expert", label: "Expert", gridSize: 18, speed: 12, foods: 20, mode: "adult", parSeconds: 600, basePoints: 2400, xp: 4, gems: 5 },
};

export const SNAKE_DIFFICULTIES = Object.keys(SNAKE_LEVELS) as SnakeDifficulty[];

export interface SnakeCell { x: number; y: number }
export type SnakeDirection = "up" | "down" | "left" | "right";

const DIRS: Record<SnakeDirection, SnakeCell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function isOpposite(a: SnakeDirection, b: SnakeDirection): boolean {
  return (a === "up" && b === "down") || (a === "down" && b === "up")
    || (a === "left" && b === "right") || (a === "right" && b === "left");
}

/** Deterministic PRNG value in [0,1) for (seed, index, salt). */
function rand(seed: number, index: number, salt: number): number {
  let a = (seed >>> 0) ^ Math.imul(index + 1, 0x9E3779B1) ^ Math.imul(salt + 1, 0x85EBCA6B);
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function cellKey(c: SnakeCell, size: number): number {
  return c.y * size + c.x;
}

function sameCell(a: SnakeCell, b: SnakeCell): boolean {
  return a.x === b.x && a.y === b.y;
}

export interface SnakeGameState {
  difficulty: SnakeDifficulty;
  gridSize: number;
  /** Head-first list of occupied cells. */
  snake: SnakeCell[];
  direction: SnakeDirection;
  /** Index into the deterministic food sequence. */
  foodIndex: number;
  food: SnakeCell;
  score: number;
  foodsEaten: number;
  moves: number;
  alive: boolean;
}

/** Deterministic food candidate for a given index in the food sequence. */
export function snakeFoodCell(difficulty: SnakeDifficulty, seed: number, index: number): SnakeCell {
  const level = SNAKE_LEVELS[difficulty];
  const size = level.gridSize;
  // Two independent draws keep x and y decorrelated.
  const x = Math.floor(rand(seed, index, 17) * size);
  const y = Math.floor(rand(seed, index, 91) * size);
  return { x, y };
}

/** Advance the food sequence until a cell not occupied by the snake is found. */
function nextFreeFood(
  difficulty: SnakeDifficulty,
  seed: number,
  startIndex: number,
  snake: SnakeCell[],
): { cell: SnakeCell; index: number } {
  const size = SNAKE_LEVELS[difficulty].gridSize;
  const occupied = new Set(snake.map((c) => cellKey(c, size)));
  // Scan forward; the sequence is effectively inexhaustible for real games.
  for (let i = startIndex; i < startIndex + size * size * 4; i++) {
    const cell = snakeFoodCell(difficulty, seed, i);
    if (!occupied.has(cellKey(cell, size))) return { cell, index: i + 1 };
  }
  // Extremely defensive fallback — should never happen on normal grids.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = { x, y };
      if (!occupied.has(cellKey(cell, size))) return { cell, index: startIndex + 1 };
    }
  }
  return { cell: { x: 0, y: 0 }, index: startIndex + 1 };
}

export function createSnakeGame(difficulty: SnakeDifficulty, seed: number): SnakeGameState {
  const level = SNAKE_LEVELS[difficulty];
  const size = level.gridSize;
  // Snake starts in the middle, three cells long, heading right.
  const cy = Math.floor(size / 2);
  const cx = Math.floor(size / 2) - 1;
  const snake: SnakeCell[] = [
    { x: cx + 2, y: cy },
    { x: cx + 1, y: cy },
    { x: cx, y: cy },
  ];
  const food = nextFreeFood(difficulty, seed, 0, snake);
  return {
    difficulty,
    gridSize: size,
    snake,
    direction: "right",
    foodIndex: food.index,
    food: food.cell,
    score: 0,
    foodsEaten: 0,
    moves: 0,
    alive: true,
  };
}

export interface SnakeStepResult {
  state: SnakeGameState;
  ate: boolean;
  died: boolean;
}

/**
 * Advance the snake one cell in `direction` (or its current direction when
 * null). Opposite directions within the same tick are ignored so the snake
 * can never reverse into itself.
 */
export function stepSnake(state: SnakeGameState, direction: SnakeDirection | null, seed: number): SnakeStepResult {
  if (!state.alive) return { state, ate: false, died: false };
  const dir = direction && !isOpposite(direction, state.direction) ? direction : state.direction;
  const delta = DIRS[dir];
  const head = state.snake[0];
  const next: SnakeCell = { x: head.x + delta.x, y: head.y + delta.y };
  const size = state.gridSize;

  const hitWall = next.x < 0 || next.y < 0 || next.x >= size || next.y >= size;
  // The tail cell frees up this tick unless we are about to eat.
  const willEat = sameCell(next, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((c) => sameCell(c, next));

  if (hitWall || hitSelf) {
    return { state: { ...state, alive: false }, ate: false, died: true };
  }

  const snake = [next, ...state.snake];
  let { food, foodIndex, foodsEaten, score } = state;
  if (willEat) {
    foodsEaten += 1;
    score += 100 + state.snake.length * 10;
    const spawned = nextFreeFood(state.difficulty, seed, foodIndex, snake);
    food = spawned.cell;
    foodIndex = spawned.index;
  } else {
    snake.pop();
  }

  // Endless mode: apples never end the round — only a crash does.
  return {
    state: {
      ...state,
      snake,
      direction: dir,
      food,
      foodIndex,
      score,
      foodsEaten,
      moves: state.moves + 1,
      alive: state.alive,
    },
    ate: willEat,
    died: false,
  };
}

/** Snake ends the round only when it crashes (or the player ends it early). */
export function isSnakeRoundOver(state: SnakeGameState): boolean {
  return !state.alive;
}

/**
 * Revive a crashed snake for a rewarded continue. Picks a direction that is
 * safe for the next tick (never a 180° turn) and trims tail segments until one
 * exists, so the resumed run cannot die on the very next step.
 */
export function reviveSnake(state: SnakeGameState): SnakeGameState | null {
  if (state.alive || !state.snake.length) return state.alive ? state : null;
  const size = state.gridSize;
  const dirs: SnakeDirection[] = ["up", "down", "left", "right"];
  const snake = [...state.snake];

  const safeDirection = (cells: SnakeCell[]): SnakeDirection | null => {
    for (const dir of dirs) {
      if (isOpposite(dir, state.direction)) continue;
      const delta = DIRS[dir];
      const head = cells[0];
      const next: SnakeCell = { x: head.x + delta.x, y: head.y + delta.y };
      if (next.x < 0 || next.y < 0 || next.x >= size || next.y >= size) continue;
      const willEat = sameCell(next, state.food);
      const body = willEat ? cells : cells.slice(0, -1);
      if (body.some((c) => sameCell(c, next))) continue;
      return dir;
    }
    return null;
  };

  while (snake.length) {
    const dir = safeDirection(snake);
    if (dir) return { ...state, snake, direction: dir, alive: true };
    snake.pop();
  }
  return null;
}

/** Serialize a live game for localStorage resume. */
export function serializeSnakeGame(state: SnakeGameState): string {
  return JSON.stringify(state);
}

export function parseSnakeGame(raw: string | null, difficulty: SnakeDifficulty): SnakeGameState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SnakeGameState;
    const level = SNAKE_LEVELS[difficulty];
    if (!parsed || parsed.difficulty !== difficulty || parsed.gridSize !== level.gridSize) return null;
    if (!Array.isArray(parsed.snake) || !parsed.snake.length) return null;
    if (typeof parsed.food?.x !== "number" || typeof parsed.food?.y !== "number") return null;
    if (!["up", "down", "left", "right"].includes(parsed.direction)) return null;
    return {
      ...parsed,
      score: Number.isFinite(parsed.score) ? parsed.score : 0,
      foodsEaten: Number.isFinite(parsed.foodsEaten) ? parsed.foodsEaten : 0,
      moves: Number.isFinite(parsed.moves) ? parsed.moves : 0,
      foodIndex: Number.isFinite(parsed.foodIndex) ? parsed.foodIndex : 0,
      alive: parsed.alive !== false,
    };
  } catch {
    return null;
  }
}
