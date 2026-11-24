import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/api-server/src/routes/tournaments.ts"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Import
rep(
  'slidePuzzleGamesTable, quizGamesTable, oddImageGamesTable, badgesTable } from "@workspace/db";',
  'slidePuzzleGamesTable, quizGamesTable, oddImageGamesTable, game2048GamesTable, badgesTable } from "@workspace/db";'
)

# 2. Leaderboard rows query — after slidePuzzleRows, before quizRows
rep(
  '''  const quizRows = gridSize === undefined''',
  '''  const game2048Rows = gridSize === undefined
    ? await db.select({ profileId: game2048GamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
        xp: profilesTable.xp, points: game2048GamesTable.points })
        .from(game2048GamesTable).innerJoin(profilesTable, eq(game2048GamesTable.profileId, profilesTable.id))
        .where(range ? and(eq(game2048GamesTable.status, "completed"), gte(game2048GamesTable.completedAt, range.start), lt(game2048GamesTable.completedAt, range.end)) : eq(game2048GamesTable.status, "completed"))
    : [];

  const quizRows = gridSize === undefined'''
)

# 3. Grouped type + ensureEntry
rep(
  '      slidePuzzleGamesPlayed: number;\n      oddImageGamesPlayed: number;',
  '      slidePuzzleGamesPlayed: number;\n      game2048GamesPlayed: number;\n      oddImageGamesPlayed: number;'
)
rep(
  'slidePuzzleGamesPlayed: 0, oddImageGamesPlayed: 0,',
  'slidePuzzleGamesPlayed: 0, game2048GamesPlayed: 0, oddImageGamesPlayed: 0,'
)

# 4. Aggregation loop — after slidePuzzleRows loop
rep(
  '''  for (const row of oddImageRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.oddImageGamesPlayed += 1;
  }''',
  '''  for (const row of game2048Rows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.game2048GamesPlayed += 1;
  }

  for (const row of oddImageRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.oddImageGamesPlayed += 1;
  }'''
)

# 5. Output entry field
rep(
  '    slidePuzzleGamesPlayed: data.slidePuzzleGamesPlayed,\n    oddImageGamesPlayed: data.oddImageGamesPlayed,',
  '    slidePuzzleGamesPlayed: data.slidePuzzleGamesPlayed,\n    game2048GamesPlayed: data.game2048GamesPlayed,\n    oddImageGamesPlayed: data.oddImageGamesPlayed,'
)

# 6. Breakdown query + map — after slidePuzzleByDifficulty block
rep(
  '''  const oddImageRows = await db.select({ level: oddImageGamesTable.level, points: oddImageGamesTable.points })''',
  '''  const game2048Rows2 = await db.select({ difficulty: game2048GamesTable.difficulty, points: game2048GamesTable.points })
    .from(game2048GamesTable).where(range ? and(eq(game2048GamesTable.status, "completed"), eq(game2048GamesTable.profileId, profileId), gte(game2048GamesTable.completedAt, range.start), lt(game2048GamesTable.completedAt, range.end)) : and(eq(game2048GamesTable.status, "completed"), eq(game2048GamesTable.profileId, profileId)));

  const game2048ByDifficulty = new Map<string, { points: number; games: number }>();
  for (const row of game2048Rows2) {
    const current = game2048ByDifficulty.get(row.difficulty) ?? { points: 0, games: 0 };
    current.points += row.points ?? 0;
    current.games += 1;
    game2048ByDifficulty.set(row.difficulty, current);
  }

  const oddImageRows = await db.select({ level: oddImageGamesTable.level, points: oddImageGamesTable.points })'''
)

# 7. Breakdown output — after slidePuzzle array
rep(
  '''    oddImages: (["easy", "medium", "hard", "expert"] as const).map((level) => ({''',
  '''    game2048: (["3x3", "4x4", "5x5", "6x6"] as const).map((difficulty) => ({
      difficulty,
      points: game2048ByDifficulty.get(difficulty)?.points ?? 0,
      games: game2048ByDifficulty.get(difficulty)?.games ?? 0,
    })),
    oddImages: (["easy", "medium", "hard", "expert"] as const).map((level) => ({'''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("tournaments.ts patched OK")
