import io

# ── achievements.ts ──────────────────────────────────────────────
path = "artifacts/api-server/src/routes/achievements.ts"
s = io.open(path, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, f"NOT FOUND: {old[:90]!r} (count={s.count(old)})"
    s = s.replace(old, new, count)

rep('oddImageGamesTable, game2048GamesTable, profilesTable } from "@workspace/db";',
    'oddImageGamesTable, game2048GamesTable, jumbleGamesTable, profilesTable } from "@workspace/db";')

rep('''  const hasFastGame2048 = (difficulty: string, maxTime: number) => game2048Wins.some((game) => game.difficulty === difficulty && game.elapsedSeconds < maxTime);
''',
    '''  const hasFastGame2048 = (difficulty: string, maxTime: number) => game2048Wins.some((game) => game.difficulty === difficulty && game.elapsedSeconds < maxTime);

  // ── Jumble Words data ────────────────────────────────────────────────────
  const completedJumble = await db.select({
    difficulty: jumbleGamesTable.difficulty,
    elapsedSeconds: jumbleGamesTable.elapsedSeconds,
    correct: jumbleGamesTable.correct,
    questions: jumbleGamesTable.questions,
    points: jumbleGamesTable.points,
    dailyDate: jumbleGamesTable.dailyDate,
  }).from(jumbleGamesTable).where(and(
    eq(jumbleGamesTable.profileId, profileId), eq(jumbleGamesTable.status, "completed"),
  ));
  const jumbleWins = completedJumble.filter((game) => (game.points ?? 0) > 0);
  const jumbleWinCount = jumbleWins.length;
  const jumbleDifficultyCount = new Set(jumbleWins.map(({ difficulty }) => difficulty)).size;
  const jumbleDailyCount = new Set(jumbleWins.map(({ dailyDate }) => dailyDate).filter((date): date is string => !!date)).size;
  const hasPerfectJumble = completedJumble.some((game) => game.questions > 0 && game.correct >= game.questions);
  const hasFastJumble = (difficulty: string, maxTime: number) => jumbleWins.some((game) => game.difficulty === difficulty && game.elapsedSeconds < maxTime);
''')

rep('''    game2048_daily_100: { unlocked: game2048DailyCount >= 100, progress: Math.min(game2048DailyCount, 100), total: 100 },
''',
    '''    game2048_daily_100: { unlocked: game2048DailyCount >= 100, progress: Math.min(game2048DailyCount, 100), total: 100 },

    // ── Jumble Words ────────────────────────────────────────────────────────
    jumble_first: { unlocked: jumbleWinCount >= 1, progress: Math.min(jumbleWinCount, 1), total: 1 },
    jumble_10: { unlocked: jumbleWinCount >= 10, progress: Math.min(jumbleWinCount, 10), total: 10 },
    jumble_50: { unlocked: jumbleWinCount >= 50, progress: Math.min(jumbleWinCount, 50), total: 50 },
    jumble_100: { unlocked: jumbleWinCount >= 100, progress: Math.min(jumbleWinCount, 100), total: 100 },
    jumble_all_levels: { unlocked: jumbleDifficultyCount === 4, progress: jumbleDifficultyCount, total: 4 },
    jumble_perfect: { unlocked: hasPerfectJumble, progress: hasPerfectJumble ? 1 : 0, total: 1 },
    jumble_speed_easy: { unlocked: hasFastJumble("easy", 180), progress: hasFastJumble("easy", 180) ? 1 : 0, total: 1 },
    jumble_speed_medium: { unlocked: hasFastJumble("medium", 300), progress: hasFastJumble("medium", 300) ? 1 : 0, total: 1 },
    jumble_speed_expert: { unlocked: hasFastJumble("expert", 600), progress: hasFastJumble("expert", 600) ? 1 : 0, total: 1 },
    jumble_daily_7: { unlocked: jumbleDailyCount >= 7, progress: Math.min(jumbleDailyCount, 7), total: 7 },
    jumble_daily_30: { unlocked: jumbleDailyCount >= 30, progress: Math.min(jumbleDailyCount, 30), total: 30 },
    jumble_daily_100: { unlocked: jumbleDailyCount >= 100, progress: Math.min(jumbleDailyCount, 100), total: 100 },
''')

io.open(path, "w", encoding="utf-8").write(s)
print("achievements.ts patched, delta:", len(s) - len(orig))

# ── achievement-utils.ts ─────────────────────────────────────────
path = "artifacts/sudoku-game/src/lib/achievement-utils.ts"
s = io.open(path, encoding="utf-8").read()
orig = s

rep("game: 'sudoku' | 'memory' | 'jigsaw' | 'word-search' | 'minesweeper' | 'slide-puzzle' | 'game-2048' | 'odd-images' | 'science-quiz' | 'maths-quiz' | 'gk-quiz';",
    "game: 'sudoku' | 'memory' | 'jigsaw' | 'word-search' | 'minesweeper' | 'slide-puzzle' | 'game-2048' | 'jumble' | 'odd-images' | 'science-quiz' | 'maths-quiz' | 'gk-quiz';")

rep("  { id: 'game2048_daily_100', game: 'game-2048', emoji: '🏅', title: 'Daily Merge Master', description: 'Complete 100 daily 2048 challenges', group: '2048 Daily' },",
    '''  { id: 'game2048_daily_100', game: 'game-2048', emoji: '🏅', title: 'Daily Merge Master', description: 'Complete 100 daily 2048 challenges', group: '2048 Daily' },

  // ── Jumble Words ──────────────────────────────────────────────────────────
  { id: 'jumble_first', game: 'jumble', emoji: '🔤', title: 'First Unscramble', description: 'Complete your first Jumble Words round', group: 'Jumble Words Milestones' },
  { id: 'jumble_10', game: 'jumble', emoji: '🎮', title: 'Word Regular', description: 'Complete 10 Jumble Words rounds', group: 'Jumble Words Milestones' },
  { id: 'jumble_50', game: 'jumble', emoji: '🏆', title: 'Word Veteran', description: 'Complete 50 Jumble Words rounds', group: 'Jumble Words Milestones' },
  { id: 'jumble_100', game: 'jumble', emoji: '🌟', title: 'Word Legend', description: 'Complete 100 Jumble Words rounds', group: 'Jumble Words Milestones' },
  { id: 'jumble_all_levels', game: 'jumble', emoji: '🌈', title: 'Vocabulary Explorer', description: 'Win a round on all four levels', group: 'Jumble Words Skills' },
  { id: 'jumble_perfect', game: 'jumble', emoji: '💯', title: 'Perfect Round', description: 'Unscramble every word in a round', group: 'Jumble Words Skills' },
  { id: 'jumble_speed_easy', game: 'jumble', emoji: '🐇', title: 'Speedy Sprinter', description: 'Finish an Easy round in under 3 minutes', group: 'Jumble Words Skills' },
  { id: 'jumble_speed_medium', game: 'jumble', emoji: '⚡', title: 'Quick Unscrambler', description: 'Finish a Medium round in under 5 minutes', group: 'Jumble Words Skills' },
  { id: 'jumble_speed_expert', game: 'jumble', emoji: '🚀', title: 'Expert Sprinter', description: 'Finish an Expert round in under 10 minutes', group: 'Jumble Words Skills' },
  { id: 'jumble_daily_7', game: 'jumble', emoji: '📅', title: 'Daily Jumbler', description: 'Complete 7 daily Jumble Words challenges', group: 'Jumble Words Daily' },
  { id: 'jumble_daily_30', game: 'jumble', emoji: '🗓️', title: 'Daily Word Solver', description: 'Complete 30 daily Jumble Words challenges', group: 'Jumble Words Daily' },
  { id: 'jumble_daily_100', game: 'jumble', emoji: '🏅', title: 'Daily Jumble Master', description: 'Complete 100 daily Jumble Words challenges', group: 'Jumble Words Daily' },''')

io.open(path, "w", encoding="utf-8").write(s)
print("achievement-utils.ts patched, delta:", len(s) - len(orig))

# ── tournaments.ts ───────────────────────────────────────────────
path = "artifacts/api-server/src/routes/tournaments.ts"
s = io.open(path, encoding="utf-8").read()
orig = s

rep('oddImageGamesTable, game2048GamesTable, badgesTable } from "@workspace/db";',
    'oddImageGamesTable, game2048GamesTable, jumbleGamesTable, badgesTable } from "@workspace/db";')

rep('''  const quizRows = gridSize === undefined
    ? await db.select({ profileId: quizGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,''',
    '''  const jumbleRows = gridSize === undefined
    ? await db.select({ profileId: jumbleGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
        xp: profilesTable.xp, points: jumbleGamesTable.points })
        .from(jumbleGamesTable).innerJoin(profilesTable, eq(jumbleGamesTable.profileId, profilesTable.id))
        .where(range ? and(eq(jumbleGamesTable.status, "completed"), gte(jumbleGamesTable.completedAt, range.start), lt(jumbleGamesTable.completedAt, range.end)) : eq(jumbleGamesTable.status, "completed"))
    : [];

  const quizRows = gridSize === undefined
    ? await db.select({ profileId: quizGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,''')

rep('      game2048GamesPlayed: number;\n      oddImageGamesPlayed: number;',
    '      game2048GamesPlayed: number;\n      jumbleGamesPlayed: number;\n      oddImageGamesPlayed: number;')
rep('slidePuzzleGamesPlayed: 0, game2048GamesPlayed: 0, oddImageGamesPlayed: 0,',
    'slidePuzzleGamesPlayed: 0, game2048GamesPlayed: 0, jumbleGamesPlayed: 0, oddImageGamesPlayed: 0,')

rep('''  for (const row of oddImageRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.oddImageGamesPlayed += 1;
  }''',
    '''  for (const row of jumbleRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.jumbleGamesPlayed += 1;
  }

  for (const row of oddImageRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.oddImageGamesPlayed += 1;
  }''')

rep('    game2048GamesPlayed: data.game2048GamesPlayed,',
    '    game2048GamesPlayed: data.game2048GamesPlayed,\n    jumbleGamesPlayed: data.jumbleGamesPlayed,')

# breakdown section
rep('''  const oddImageRows = await db.select({ level: oddImageGamesTable.level, points: oddImageGamesTable.points })''',
    '''  const jumbleRows2 = await db.select({ difficulty: jumbleGamesTable.difficulty, points: jumbleGamesTable.points })
    .from(jumbleGamesTable).where(range ? and(eq(jumbleGamesTable.status, "completed"), eq(jumbleGamesTable.profileId, profileId), gte(jumbleGamesTable.completedAt, range.start), lt(jumbleGamesTable.completedAt, range.end)) : and(eq(jumbleGamesTable.status, "completed"), eq(jumbleGamesTable.profileId, profileId)));

  const jumbleByDifficulty = new Map<string, { points: number; games: number }>();
  for (const row of jumbleRows2) {
    const current = jumbleByDifficulty.get(row.difficulty) ?? { points: 0, games: 0 };
    current.points += row.points ?? 0;
    current.games += 1;
    jumbleByDifficulty.set(row.difficulty, current);
  }

  const oddImageRows = await db.select({ level: oddImageGamesTable.level, points: oddImageGamesTable.points })''')

rep('''    game2048: (["3x3", "4x4", "5x5", "6x6"] as const).map((difficulty) => ({
      difficulty,
      points: game2048ByDifficulty.get(difficulty)?.points ?? 0,
      games: game2048ByDifficulty.get(difficulty)?.games ?? 0,
    })),''',
    '''    game2048: (["3x3", "4x4", "5x5", "6x6"] as const).map((difficulty) => ({
      difficulty,
      points: game2048ByDifficulty.get(difficulty)?.points ?? 0,
      games: game2048ByDifficulty.get(difficulty)?.games ?? 0,
    })),
    jumble: (["easy", "medium", "hard", "expert"] as const).map((difficulty) => ({
      difficulty,
      points: jumbleByDifficulty.get(difficulty)?.points ?? 0,
      games: jumbleByDifficulty.get(difficulty)?.games ?? 0,
    })),''')

io.open(path, "w", encoding="utf-8").write(s)
print("tournaments.ts patched, delta:", len(s) - len(orig))
