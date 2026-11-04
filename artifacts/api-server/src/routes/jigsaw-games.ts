import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db, jigsawGamesTable, profilesTable } from "@workspace/db";
import { calculateJigsawPoints, getJigsawGemsEarned, getJigsawXpEarned } from "@workspace/api-zod";

const router: IRouter = Router();
const GRID_SIZES = [2, 3, 4, 5] as const;
const LEVELS = [1, 2, 3] as const;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyConfig(date: string) {
  const seed = Number(date.replaceAll("-", ""));
  return {
    date,
    gridSize: GRID_SIZES[seed % GRID_SIZES.length],
    level: LEVELS[Math.floor(seed / 7) % LEVELS.length],
    imageKey: ((seed * 7) % 32) + 1,
  };
}

function validConfig(gridSize: unknown, level: unknown, imageKey: unknown): boolean {
  return Number.isInteger(gridSize) && GRID_SIZES.includes(gridSize as (typeof GRID_SIZES)[number])
    && Number.isInteger(level) && LEVELS.includes(level as (typeof LEVELS)[number])
    && Number.isInteger(imageKey) && Number(imageKey) >= 1 && Number(imageKey) <= 32;
}

router.post("/jigsaw-games", async (req, res): Promise<void> => {
  const body = req.body as {
    profileId?: number;
    gridSize?: number;
    level?: number;
    imageKey?: number;
    dailyDate?: string;
  };
  const gridSize = body.gridSize ?? 2;
  const level = body.level ?? 1;
  const imageKey = body.imageKey ?? 1;
  if (!validConfig(gridSize, level, imageKey)) {
    res.status(400).json({ error: "Choose a grid size from 2 to 5, level from 1 to 3, and image from 1 to 32." });
    return;
  }

  let dailyDate: string | null = null;
  if (body.dailyDate !== undefined) {
    const today = todayUtc();
    const daily = getDailyConfig(today);
    if (body.dailyDate !== today || daily.gridSize !== gridSize || daily.level !== level || daily.imageKey !== imageKey) {
      res.status(400).json({ error: "Daily challenge settings do not match today's puzzle." });
      return;
    }
    dailyDate = today;
  }

  const profileId = Number.isInteger(body.profileId) && Number(body.profileId) > 0 ? Number(body.profileId) : null;
  const [game] = await db.insert(jigsawGamesTable).values({
    profileId,
    gridSize,
    level,
    imageKey,
    dailyDate,
    status: "active",
  }).returning({ id: jigsawGamesTable.id, createdAt: jigsawGamesTable.createdAt });
  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

router.patch("/jigsaw-games/:id/progress", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const { elapsedSeconds, moves } = req.body as { elapsedSeconds?: number; moves?: number };
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id." });
    return;
  }
  if (!Number.isInteger(elapsedSeconds) || Number(elapsedSeconds) < 0 || Number(elapsedSeconds) > 86_400
    || !Number.isInteger(moves) || Number(moves) < 0 || Number(moves) > 100_000) {
    res.status(400).json({ error: "A valid elapsed time and move count are required." });
    return;
  }

  const [game] = await db.update(jigsawGamesTable)
    .set({
      elapsedSeconds: sql`GREATEST(${jigsawGamesTable.elapsedSeconds}, ${Number(elapsedSeconds)})`,
      moves: sql`GREATEST(${jigsawGamesTable.moves}, ${Number(moves)})`,
    })
    .where(and(eq(jigsawGamesTable.id, id), eq(jigsawGamesTable.status, "active")))
    .returning({ id: jigsawGamesTable.id });

  if (game) {
    res.json({ id: game.id, saved: true });
    return;
  }

  const [existing] = await db.select({ id: jigsawGamesTable.id, status: jigsawGamesTable.status })
    .from(jigsawGamesTable)
    .where(eq(jigsawGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found." });
    return;
  }
  if (existing.status === "completed") {
    res.json({ id: existing.id, saved: false, completed: true });
    return;
  }
  res.status(409).json({ error: "This game is no longer active." });
});

router.post("/jigsaw-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const { elapsedSeconds, moves } = req.body as { elapsedSeconds?: number; moves?: number };
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id." });
    return;
  }
  if (!Number.isInteger(elapsedSeconds) || Number(elapsedSeconds) < 0 || Number(elapsedSeconds) > 86_400
    || !Number.isInteger(moves) || Number(moves) < 0 || Number(moves) > 100_000) {
    res.status(400).json({ error: "A valid elapsed time and move count are required." });
    return;
  }

  const [existing] = await db.select().from(jigsawGamesTable).where(eq(jigsawGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found." });
    return;
  }
  if (existing.status === "completed") {
    res.json({
      id: existing.id,
      points: existing.points ?? 0,
      xpEarned: existing.xpEarned ?? 0,
      gemsEarned: existing.gemsEarned ?? 0,
      tipsUsed: existing.tipsUsed ?? 0,
      completedAt: existing.completedAt?.toISOString() ?? null,
    });
    return;
  }

  let isPersonalBest = false;
  if (existing.profileId) {
    const [previousBest] = await db.select({ elapsedSeconds: jigsawGamesTable.elapsedSeconds })
      .from(jigsawGamesTable)
      .where(and(
        eq(jigsawGamesTable.profileId, existing.profileId),
        eq(jigsawGamesTable.gridSize, existing.gridSize),
        eq(jigsawGamesTable.level, existing.level),
        eq(jigsawGamesTable.status, "completed"),
      ))
      .orderBy(asc(jigsawGamesTable.elapsedSeconds))
      .limit(1);
    isPersonalBest = !previousBest || Number(elapsedSeconds) < previousBest.elapsedSeconds;
  }

  const rawTipsUsed = (req.body as { tipsUsed?: unknown }).tipsUsed ?? 0;
  if (!Number.isInteger(rawTipsUsed) || Number(rawTipsUsed) < 0 || Number(rawTipsUsed) > 6) {
    res.status(400).json({ error: "A valid tip count is required (0 to 6)." });
    return;
  }
  const tipsUsed = Number(rawTipsUsed);
  const points = calculateJigsawPoints(existing.gridSize, existing.level, Number(elapsedSeconds), Number(moves), tipsUsed);
  const xpEarned = getJigsawXpEarned(existing.level);
  const gemsEarned = getJigsawGemsEarned(existing.gridSize);
  const completedAt = new Date();
  const [game] = await db.update(jigsawGamesTable)
    .set({
      status: "completed",
      elapsedSeconds: Number(elapsedSeconds),
      moves: Number(moves),
      tipsUsed,
      points,
      xpEarned,
      gemsEarned,
      completedAt,
    })
    .where(and(eq(jigsawGamesTable.id, id), eq(jigsawGamesTable.status, "active")))
    .returning();

  if (!game) {
    const [completed] = await db.select().from(jigsawGamesTable).where(eq(jigsawGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({
        id: completed.id,
        points: completed.points ?? 0,
        xpEarned: completed.xpEarned ?? 0,
        gemsEarned: completed.gemsEarned ?? 0,
        tipsUsed: completed.tipsUsed ?? 0,
        completedAt: completed.completedAt?.toISOString() ?? null,
      });
      return;
    }
    res.status(409).json({ error: "This game has already been closed." });
    return;
  }

  if (game.profileId) {
    await db.update(profilesTable).set({
      xp: sql`${profilesTable.xp} + ${xpEarned}`,
      gems: sql`${profilesTable.gems} + ${gemsEarned}`,
    }).where(eq(profilesTable.id, game.profileId));
  }

  const { resolveJigsawChallengeForGame } = await import("./jigsaw-challenges");
  await resolveJigsawChallengeForGame(game.id);
  res.json({ id: game.id, points, xpEarned, gemsEarned, tipsUsed, isPersonalBest, completedAt: completedAt.toISOString() });
});

router.get("/jigsaw-daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/jigsaw-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) {
    res.status(400).json({ error: "Invalid profile id." });
    return;
  }
  const date = todayUtc();
  const games = await db.select({
    points: jigsawGamesTable.points,
    elapsedSeconds: jigsawGamesTable.elapsedSeconds,
  }).from(jigsawGamesTable).where(and(
    eq(jigsawGamesTable.profileId, profileId),
    eq(jigsawGamesTable.dailyDate, date),
    eq(jigsawGamesTable.status, "completed"),
  ));
  const best = games.reduce<typeof games[number] | null>(
    (current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current,
    null,
  );
  res.json({ date, completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/jigsaw-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) {
    res.status(400).json({ error: "Invalid profile id." });
    return;
  }

  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    res.status(400).json({ error: "Invalid month. Use YYYY-MM format." });
    return;
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const monthStart = `${month}-01`;
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: jigsawGamesTable.dailyDate })
    .from(jigsawGamesTable)
    .where(and(
      eq(jigsawGamesTable.profileId, profileId),
      eq(jigsawGamesTable.status, "completed"),
      gte(jigsawGamesTable.dailyDate, monthStart),
      lt(jigsawGamesTable.dailyDate, monthEnd),
    ));

  res.json({ month, completedDates: [...new Set(rows.map((row) => row.date).filter((date): date is string => !!date))] });
});

router.get("/jigsaw-daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({
    profileId: jigsawGamesTable.profileId,
    username: profilesTable.username,
    avatar: profilesTable.avatar,
    points: jigsawGamesTable.points,
    elapsedSeconds: jigsawGamesTable.elapsedSeconds,
  }).from(jigsawGamesTable)
    .innerJoin(profilesTable, eq(jigsawGamesTable.profileId, profilesTable.id))
    .where(and(eq(jigsawGamesTable.dailyDate, date), eq(jigsawGamesTable.status, "completed")))
    .orderBy(desc(jigsawGamesTable.points), asc(jigsawGamesTable.elapsedSeconds));

  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) {
    if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  }
  const entries = Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({
    rank: index + 1,
    profileId: row.profileId,
    username: row.username,
    avatar: row.avatar,
    points: row.points ?? 0,
    elapsedSeconds: row.elapsedSeconds,
  }));
  res.json({ date, entries });
});

router.get("/jigsaw-games/leaderboard", async (req, res): Promise<void> => {
  const gridSize = req.query.gridSize === undefined || req.query.gridSize === "all" ? undefined : Number(req.query.gridSize);
  if (gridSize !== undefined && !GRID_SIZES.includes(gridSize as (typeof GRID_SIZES)[number])) {
    res.status(400).json({ error: "gridSize must be 2, 3, 4, 5, or all." });
    return;
  }
  const conditions = [eq(jigsawGamesTable.status, "completed")];
  if (gridSize !== undefined) conditions.push(eq(jigsawGamesTable.gridSize, gridSize));
  const rows = await db.select({
    profileId: jigsawGamesTable.profileId,
    username: profilesTable.username,
    avatar: profilesTable.avatar,
    gridSize: jigsawGamesTable.gridSize,
    level: jigsawGamesTable.level,
    points: jigsawGamesTable.points,
    elapsedSeconds: jigsawGamesTable.elapsedSeconds,
  }).from(jigsawGamesTable)
    .innerJoin(profilesTable, eq(jigsawGamesTable.profileId, profilesTable.id))
    .where(and(...conditions))
    .orderBy(desc(jigsawGamesTable.points));

  const grouped = new Map<number, {
    profileId: number; username: string; avatar: string | null; totalPoints: number;
    gamesPlayed: number; bestTime: number; sizes: Record<number, { points: number; games: number }>;
  }>();
  for (const row of rows) {
    if (!row.profileId) continue;
    const entry = grouped.get(row.profileId) ?? {
      profileId: row.profileId, username: row.username, avatar: row.avatar ?? null,
      totalPoints: 0, gamesPlayed: 0, bestTime: row.elapsedSeconds, sizes: {},
    };
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.bestTime = Math.min(entry.bestTime, row.elapsedSeconds);
    const size = entry.sizes[row.gridSize] ?? { points: 0, games: 0 };
    size.points += row.points ?? 0;
    size.games += 1;
    entry.sizes[row.gridSize] = size;
    grouped.set(row.profileId, entry);
  }
  const entries = Array.from(grouped.values())
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 100)
    .map((entry, index) => ({ rank: index + 1, ...entry }));
  res.json({ gridSize: gridSize ?? "all", entries });
});

export default router;
