PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/api-server/src/routes/tournaments.ts"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. import
rep('game2048GamesTable, jumbleGamesTable, badgesTable } from "@workspace/db";',
    'game2048GamesTable, jumbleGamesTable, snakeGamesTable, badgesTable } from "@workspace/db";')

# 2. rows query after jumbleRows
rep('''  const quizRows = gridSize === undefined''',
    '''  const snakeRows = gridSize === undefined
    ? await db.select({ profileId: snakeGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
        xp: profilesTable.xp, points: snakeGamesTable.points })
        .from(snakeGamesTable).innerJoin(profilesTable, eq(snakeGamesTable.profileId, profilesTable.id))
        .where(range ? and(eq(snakeGamesTable.status, "completed"), gte(snakeGamesTable.completedAt, range.start), lt(snakeGamesTable.completedAt, range.end)) : eq(snakeGamesTable.status, "completed"))
    : [];

  const quizRows = gridSize === undefined''')

# 3. grouped type + ensureEntry + loop + entries
rep('''      game2048GamesPlayed: number;
      jumbleGamesPlayed: number;
      oddImageGamesPlayed: number;''',
    '''      game2048GamesPlayed: number;
      jumbleGamesPlayed: number;
      snakeGamesPlayed: number;
      oddImageGamesPlayed: number;''')
rep('game2048GamesPlayed: 0, jumbleGamesPlayed: 0, oddImageGamesPlayed: 0,',
    'game2048GamesPlayed: 0, jumbleGamesPlayed: 0, snakeGamesPlayed: 0, oddImageGamesPlayed: 0,')
rep('''  for (const row of jumbleRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.jumbleGamesPlayed += 1;
  }

  for (const row of oddImageRows) {''',
    '''  for (const row of jumbleRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.jumbleGamesPlayed += 1;
  }

  for (const row of snakeRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.snakeGamesPlayed += 1;
  }

  for (const row of oddImageRows) {''')
rep('''    jumbleGamesPlayed: data.jumbleGamesPlayed,
    oddImageGamesPlayed: data.oddImageGamesPlayed,''',
    '''    jumbleGamesPlayed: data.jumbleGamesPlayed,
    snakeGamesPlayed: data.snakeGamesPlayed,
    oddImageGamesPlayed: data.oddImageGamesPlayed,''')

# 4. breakdown query + map + response
rep('''  const oddImageRows = await db.select({ level: oddImageGamesTable.level, points: oddImageGamesTable.points })''',
    '''  const snakeRows2 = await db.select({ difficulty: snakeGamesTable.difficulty, points: snakeGamesTable.points })
    .from(snakeGamesTable).where(range ? and(eq(snakeGamesTable.status, "completed"), eq(snakeGamesTable.profileId, profileId), gte(snakeGamesTable.completedAt, range.start), lt(snakeGamesTable.completedAt, range.end)) : and(eq(snakeGamesTable.status, "completed"), eq(snakeGamesTable.profileId, profileId)));

  const snakeByDifficulty = new Map<string, { points: number; games: number }>();
  for (const row of snakeRows2) {
    const current = snakeByDifficulty.get(row.difficulty) ?? { points: 0, games: 0 };
    current.points += row.points ?? 0;
    current.games += 1;
    snakeByDifficulty.set(row.difficulty, current);
  }

  const oddImageRows = await db.select({ level: oddImageGamesTable.level, points: oddImageGamesTable.points })''')
rep('''    jumble: (["easy", "medium", "hard", "expert"] as const).map((difficulty) => ({
      difficulty,
      points: jumbleByDifficulty.get(difficulty)?.points ?? 0,
      games: jumbleByDifficulty.get(difficulty)?.games ?? 0,
    })),
    oddImages:''',
    '''    jumble: (["easy", "medium", "hard", "expert"] as const).map((difficulty) => ({
      difficulty,
      points: jumbleByDifficulty.get(difficulty)?.points ?? 0,
      games: jumbleByDifficulty.get(difficulty)?.games ?? 0,
    })),
    snake: (["easy", "medium", "hard", "expert"] as const).map((difficulty) => ({
      difficulty,
      points: snakeByDifficulty.get(difficulty)?.points ?? 0,
      games: snakeByDifficulty.get(difficulty)?.games ?? 0,
    })),
    oddImages:''')

open(PATH, "w", encoding="utf-8").write(src)
print("tournaments.ts patched OK")
