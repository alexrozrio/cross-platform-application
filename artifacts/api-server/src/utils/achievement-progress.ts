export const SUDOKU_ACHIEVEMENT_TARGETS = {
  gridPerSize: 3,
  medium: 3,
  hard: 5,
  expert: 10,
  eachDifficulty: 3,
  perfectionist: 3,
  noHints: 5,
  flawlessDifficulty: 3,
  hintFreeDifficulty: 3,
  bigBrain: 3,
  comeback: 3,
  speedDemon: 3,
  lightning: 5,
  speedByGrid: 3,
} as const;

export interface CountAchievementProgress {
  unlocked: boolean;
  progress: number;
  total: number;
}

export function countAchievementProgress(count: number, target: number): CountAchievementProgress {
  const progress = Math.min(Math.max(0, count), target);
  return {
    unlocked: progress >= target,
    progress,
    total: target,
  };
}

export const JIGSAW_ACHIEVEMENT_TARGETS = {
  dedicated: 10,
  quarterCentury: 25,
  halfCentury: 50,
  century: 100,
  gridPerSize: 10,
  advanced: 10,
  dailyDevotion: 7,
  dailyCraft: 30,
  dailyMaster: 100,
} as const;

export interface JigsawAchievementGame {
  gridSize: number;
  level: number;
  elapsedSeconds: number;
  dailyDate: string | null;
}

export function getJigsawAchievementProgress(games: JigsawAchievementGame[]) {
  const gridCounts = new Map<number, number>();
  for (const game of games) {
    gridCounts.set(game.gridSize, (gridCounts.get(game.gridSize) ?? 0) + 1);
  }

  const gridSizes = [2, 3, 4, 5];
  const completedDailyDates = new Set(
    games.flatMap((game) => game.dailyDate ? [game.dailyDate] : []),
  );
  const gridProgress = gridSizes.filter((size) => (gridCounts.get(size) ?? 0) >= JIGSAW_ACHIEVEMENT_TARGETS.gridPerSize).length;
  const levelThreeCount = games.filter((game) => game.level === 3).length;
  const hasJigsawSpeedWin = games.some((game) => game.gridSize === 2 && game.elapsedSeconds <= 30);
  const hasJigsawMaster = games.some((game) => game.gridSize === 5 && game.level === 3);
  const hasJigsawNoReference = games.some((game) => game.level === 3);

  return {
    jigsaw_first_win: countAchievementProgress(games.length, 1),
    jigsaw_dedicated: countAchievementProgress(games.length, JIGSAW_ACHIEVEMENT_TARGETS.dedicated),
    jigsaw_quarter_century: countAchievementProgress(games.length, JIGSAW_ACHIEVEMENT_TARGETS.quarterCentury),
    jigsaw_half_century: countAchievementProgress(games.length, JIGSAW_ACHIEVEMENT_TARGETS.halfCentury),
    jigsaw_century: countAchievementProgress(games.length, JIGSAW_ACHIEVEMENT_TARGETS.century),
    jigsaw_all_sizes: countAchievementProgress(new Set(games.map((game) => game.gridSize)).size, gridSizes.length),
    jigsaw_grid_veteran: countAchievementProgress(gridProgress, gridSizes.length),
    jigsaw_speedster: countAchievementProgress(hasJigsawSpeedWin ? 1 : 0, 1),
    jigsaw_speed_3x3: countAchievementProgress(games.some((game) => game.gridSize === 3 && game.elapsedSeconds <= 60) ? 1 : 0, 1),
    jigsaw_speed_4x4: countAchievementProgress(games.some((game) => game.gridSize === 4 && game.elapsedSeconds <= 120) ? 1 : 0, 1),
    jigsaw_speed_5x5: countAchievementProgress(games.some((game) => game.gridSize === 5 && game.elapsedSeconds <= 180) ? 1 : 0, 1),
    jigsaw_advanced_10: countAchievementProgress(levelThreeCount, JIGSAW_ACHIEVEMENT_TARGETS.advanced),
    jigsaw_master: countAchievementProgress(hasJigsawMaster ? 1 : 0, 1),
    jigsaw_from_memory: countAchievementProgress(hasJigsawNoReference ? 1 : 0, 1),
    jigsaw_daily_7: countAchievementProgress(completedDailyDates.size, JIGSAW_ACHIEVEMENT_TARGETS.dailyDevotion),
    jigsaw_daily_30: countAchievementProgress(completedDailyDates.size, JIGSAW_ACHIEVEMENT_TARGETS.dailyCraft),
    jigsaw_daily_100: countAchievementProgress(completedDailyDates.size, JIGSAW_ACHIEVEMENT_TARGETS.dailyMaster),
  };
}

export const ODD_IMAGE_ACHIEVEMENT_TARGETS = {
  dedicated: 10,
  halfCentury: 50,
  century: 100,
  themeExplorer: 5,
  perfectGames: 5,
  dailyDevotion: 7,
  dailyCraft: 30,
  dailyMaster: 100,
} as const;

export interface OddImageAchievementGame {
  level: string;
  theme: string;
  elapsedSeconds: number;
  questions: number;
  correct: number;
  dailyDate: string | null;
}

export function getOddImageAchievementProgress(games: OddImageAchievementGame[]) {
  const wins = games.filter((game) => game.correct > 0);
  const levelCount = new Set(wins.map((game) => game.level)).size;
  const themeCount = new Set(wins.map((game) => game.theme)).size;
  const perfectCount = wins.filter((game) => game.questions > 0 && game.correct === game.questions).length;
  const dailyDates = new Set(wins.flatMap((game) => game.dailyDate ? [game.dailyDate] : []));
  const hasFastWin = (level: string, maxSeconds: number) => wins.some((game) => game.level === level && game.elapsedSeconds < maxSeconds);

  return {
    odd_images_first: countAchievementProgress(wins.length, 1),
    odd_images_dedicated: countAchievementProgress(wins.length, ODD_IMAGE_ACHIEVEMENT_TARGETS.dedicated),
    odd_images_half_century: countAchievementProgress(wins.length, ODD_IMAGE_ACHIEVEMENT_TARGETS.halfCentury),
    odd_images_century: countAchievementProgress(wins.length, ODD_IMAGE_ACHIEVEMENT_TARGETS.century),
    odd_images_all_levels: countAchievementProgress(levelCount, 4),
    odd_images_theme_explorer: countAchievementProgress(themeCount, ODD_IMAGE_ACHIEVEMENT_TARGETS.themeExplorer),
    odd_images_perfect_5: countAchievementProgress(perfectCount, ODD_IMAGE_ACHIEVEMENT_TARGETS.perfectGames),
    odd_images_speed_easy: countAchievementProgress(hasFastWin("easy", 90) ? 1 : 0, 1),
    odd_images_speed_medium: countAchievementProgress(hasFastWin("medium", 150) ? 1 : 0, 1),
    odd_images_speed_hard: countAchievementProgress(hasFastWin("hard", 240) ? 1 : 0, 1),
    odd_images_speed_expert: countAchievementProgress(hasFastWin("expert", 360) ? 1 : 0, 1),
    odd_images_daily_7: countAchievementProgress(dailyDates.size, ODD_IMAGE_ACHIEVEMENT_TARGETS.dailyDevotion),
    odd_images_daily_30: countAchievementProgress(dailyDates.size, ODD_IMAGE_ACHIEVEMENT_TARGETS.dailyCraft),
    odd_images_daily_100: countAchievementProgress(dailyDates.size, ODD_IMAGE_ACHIEVEMENT_TARGETS.dailyMaster),
  };
}

export const MEMORY_ORDER_ACHIEVEMENT_TARGETS = {
  dedicated: 10,
  halfCentury: 50,
  century: 100,
  themeExplorer: 5,
  perfectGames: 5,
  dailyDevotion: 7,
  dailyCraft: 30,
  dailyMaster: 100,
} as const;

export interface MemoryOrderAchievementGame {
  level: string;
  theme: string;
  elapsedSeconds: number;
  questions: number;
  correct: number;
  dailyDate: string | null;
}

export function getMemoryOrderAchievementProgress(games: MemoryOrderAchievementGame[]) {
  const wins = games.filter((game) => game.correct > 0);
  const levelCount = new Set(wins.map((game) => game.level)).size;
  const themeCount = new Set(wins.map((game) => game.theme)).size;
  const perfectCount = wins.filter((game) => game.questions > 0 && game.correct === game.questions).length;
  const dailyDates = new Set(wins.flatMap((game) => game.dailyDate ? [game.dailyDate] : []));
  const hasFastWin = (level: string, maxSeconds: number) => wins.some((game) => game.level === level && game.elapsedSeconds < maxSeconds);

  return {
    memory_order_first: countAchievementProgress(wins.length, 1),
    memory_order_dedicated: countAchievementProgress(wins.length, MEMORY_ORDER_ACHIEVEMENT_TARGETS.dedicated),
    memory_order_half_century: countAchievementProgress(wins.length, MEMORY_ORDER_ACHIEVEMENT_TARGETS.halfCentury),
    memory_order_century: countAchievementProgress(wins.length, MEMORY_ORDER_ACHIEVEMENT_TARGETS.century),
    memory_order_all_levels: countAchievementProgress(levelCount, 4),
    memory_order_theme_explorer: countAchievementProgress(themeCount, MEMORY_ORDER_ACHIEVEMENT_TARGETS.themeExplorer),
    memory_order_perfect_5: countAchievementProgress(perfectCount, MEMORY_ORDER_ACHIEVEMENT_TARGETS.perfectGames),
    memory_order_speed_easy: countAchievementProgress(hasFastWin("easy", 90) ? 1 : 0, 1),
    memory_order_speed_medium: countAchievementProgress(hasFastWin("medium", 150) ? 1 : 0, 1),
    memory_order_speed_hard: countAchievementProgress(hasFastWin("hard", 240) ? 1 : 0, 1),
    memory_order_speed_expert: countAchievementProgress(hasFastWin("expert", 360) ? 1 : 0, 1),
    memory_order_daily_7: countAchievementProgress(dailyDates.size, MEMORY_ORDER_ACHIEVEMENT_TARGETS.dailyDevotion),
    memory_order_daily_30: countAchievementProgress(dailyDates.size, MEMORY_ORDER_ACHIEVEMENT_TARGETS.dailyCraft),
    memory_order_daily_100: countAchievementProgress(dailyDates.size, MEMORY_ORDER_ACHIEVEMENT_TARGETS.dailyMaster),
  };
}