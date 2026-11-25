PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/api-server/src/routes/achievements.ts"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. import
rep('game2048GamesTable, jumbleGamesTable, profilesTable } from "@workspace/db";',
    'game2048GamesTable, jumbleGamesTable, snakeGamesTable, profilesTable } from "@workspace/db";')

# 2. data query after jumble block
rep('''  const hasFastJumble = (difficulty: string, maxTime: number) => jumbleWins.some((game) => game.difficulty === difficulty && game.elapsedSeconds < maxTime);

  // ── Odd Images data''',
    '''  const hasFastJumble = (difficulty: string, maxTime: number) => jumbleWins.some((game) => game.difficulty === difficulty && game.elapsedSeconds < maxTime);

  // ── Snake data ──────────────────────────────────────────────────────────
  const completedSnake = await db.select({
    difficulty: snakeGamesTable.difficulty,
    foods: snakeGamesTable.foods,
    foodEaten: snakeGamesTable.foodEaten,
    elapsedSeconds: snakeGamesTable.elapsedSeconds,
    points: snakeGamesTable.points,
    dailyDate: snakeGamesTable.dailyDate,
  }).from(snakeGamesTable).where(and(
    eq(snakeGamesTable.profileId, profileId), eq(snakeGamesTable.status, "completed"),
  ));
  const snakeWins = completedSnake.filter((game) => (game.points ?? 0) > 0);
  const snakeWinCount = snakeWins.length;
  const snakeDifficultyCount = new Set(snakeWins.map(({ difficulty }) => difficulty)).size;
  const snakeDailyCount = new Set(snakeWins.map(({ dailyDate }) => dailyDate).filter((date): date is string => !!date)).size;
  const hasCleanSnake = completedSnake.some((game) => game.foods > 0 && game.foodEaten >= game.foods);
  const hasFastSnake = (difficulty: string, maxTime: number) => snakeWins.some((game) => game.difficulty === difficulty && game.elapsedSeconds < maxTime);

  // ── Odd Images data''')

# 3. achievements after jumble block
rep('''    jumble_daily_100: { unlocked: jumbleDailyCount >= 100, progress: Math.min(jumbleDailyCount, 100), total: 100 },

    // ── Odd Images''',
    '''    jumble_daily_100: { unlocked: jumbleDailyCount >= 100, progress: Math.min(jumbleDailyCount, 100), total: 100 },

    // ── Snake ──────────────────────────────────────────────────────────────
    snake_first: { unlocked: snakeWinCount >= 1, progress: Math.min(snakeWinCount, 1), total: 1 },
    snake_10: { unlocked: snakeWinCount >= 10, progress: Math.min(snakeWinCount, 10), total: 10 },
    snake_50: { unlocked: snakeWinCount >= 50, progress: Math.min(snakeWinCount, 50), total: 50 },
    snake_100: { unlocked: snakeWinCount >= 100, progress: Math.min(snakeWinCount, 100), total: 100 },
    snake_all_levels: { unlocked: snakeDifficultyCount === 4, progress: snakeDifficultyCount, total: 4 },
    snake_clean_sweep: { unlocked: hasCleanSnake, progress: hasCleanSnake ? 1 : 0, total: 1 },
    snake_speed_easy: { unlocked: hasFastSnake("easy", 180), progress: hasFastSnake("easy", 180) ? 1 : 0, total: 1 },
    snake_speed_medium: { unlocked: hasFastSnake("medium", 300), progress: hasFastSnake("medium", 300) ? 1 : 0, total: 1 },
    snake_speed_expert: { unlocked: hasFastSnake("expert", 600), progress: hasFastSnake("expert", 600) ? 1 : 0, total: 1 },
    snake_daily_7: { unlocked: snakeDailyCount >= 7, progress: Math.min(snakeDailyCount, 7), total: 7 },
    snake_daily_30: { unlocked: snakeDailyCount >= 30, progress: Math.min(snakeDailyCount, 30), total: 30 },
    snake_daily_100: { unlocked: snakeDailyCount >= 100, progress: Math.min(snakeDailyCount, 100), total: 100 },

    // ── Odd Images''')

open(PATH, "w", encoding="utf-8").write(src)
print("achievements.ts patched OK")
