import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/api-server/src/routes/achievements.ts"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Import table
rep(
  'slidePuzzleGamesTable, quizGamesTable, oddImageGamesTable, profilesTable } from "@workspace/db";',
  'slidePuzzleGamesTable, quizGamesTable, oddImageGamesTable, game2048GamesTable, profilesTable } from "@workspace/db";'
)

# 2. Data query — after slide puzzle block, before odd images block
rep(
  '''  // ── Odd Images data ───────────────────────────────────────────────────────''',
  '''  // ── 2048 data ────────────────────────────────────────────────────────────
  const completedGame2048 = await db.select({
    difficulty: game2048GamesTable.difficulty,
    elapsedSeconds: game2048GamesTable.elapsedSeconds,
    moves: game2048GamesTable.moves,
    maxTile: game2048GamesTable.maxTile,
    points: game2048GamesTable.points,
    dailyDate: game2048GamesTable.dailyDate,
  }).from(game2048GamesTable).where(and(
    eq(game2048GamesTable.profileId, profileId), eq(game2048GamesTable.status, "completed"),
  ));
  const game2048Wins = completedGame2048.filter((game) => (game.points ?? 0) > 0);
  const game2048WinCount = game2048Wins.length;
  const game2048DifficultyCount = new Set(game2048Wins.map(({ difficulty }) => difficulty)).size;
  const game2048DailyCount = new Set(game2048Wins.map(({ dailyDate }) => dailyDate).filter((date): date is string => !!date)).size;
  const hasTile2048 = (tile: number) => completedGame2048.some((game) => (game.maxTile ?? 0) >= tile);
  const hasFastGame2048 = (difficulty: string, maxTime: number) => game2048Wins.some((game) => game.difficulty === difficulty && game.elapsedSeconds < maxTime);

  // ── Odd Images data ───────────────────────────────────────────────────────'''
)

# 3. Badge entries — after slide puzzle block, before odd images spread
rep(
  '''    // ── Odd Images ──────────────────────────────────────────────────────────
    ...getOddImageAchievementProgress(completedOddImages),''',
  '''    // ── 2048 ────────────────────────────────────────────────────────────────
    game2048_first: { unlocked: game2048WinCount >= 1, progress: Math.min(game2048WinCount, 1), total: 1 },
    game2048_10: { unlocked: game2048WinCount >= 10, progress: Math.min(game2048WinCount, 10), total: 10 },
    game2048_50: { unlocked: game2048WinCount >= 50, progress: Math.min(game2048WinCount, 50), total: 50 },
    game2048_100: { unlocked: game2048WinCount >= 100, progress: Math.min(game2048WinCount, 100), total: 100 },
    game2048_all_boards: { unlocked: game2048DifficultyCount === 4, progress: game2048DifficultyCount, total: 4 },
    game2048_tile_512: { unlocked: hasTile2048(512), progress: hasTile2048(512) ? 1 : 0, total: 1 },
    game2048_tile_1024: { unlocked: hasTile2048(1024), progress: hasTile2048(1024) ? 1 : 0, total: 1 },
    game2048_tile_2048: { unlocked: hasTile2048(2048), progress: hasTile2048(2048) ? 1 : 0, total: 1 },
    game2048_speed_3x3: { unlocked: hasFastGame2048("3x3", 300), progress: hasFastGame2048("3x3", 300) ? 1 : 0, total: 1 },
    game2048_speed_4x4: { unlocked: hasFastGame2048("4x4", 900), progress: hasFastGame2048("4x4", 900) ? 1 : 0, total: 1 },
    game2048_daily_7: { unlocked: game2048DailyCount >= 7, progress: Math.min(game2048DailyCount, 7), total: 7 },
    game2048_daily_30: { unlocked: game2048DailyCount >= 30, progress: Math.min(game2048DailyCount, 30), total: 30 },
    game2048_daily_100: { unlocked: game2048DailyCount >= 100, progress: Math.min(game2048DailyCount, 100), total: 100 },

    // ── Odd Images ──────────────────────────────────────────────────────────
    ...getOddImageAchievementProgress(completedOddImages),'''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("achievements.ts patched OK")
