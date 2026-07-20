import { Router, type IRouter } from "express";
import { eq, and, gte, lt, inArray } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, profilesTable, memoryGamesTable, badgesTable } from "@workspace/db";
import {
  getWeekPeriod,
  getMonthPeriod,
  getWeekRange,
  getMonthRange,
  formatPeriodLabel,
  getNthPreviousWeekPeriod,
} from "../utils/periods";

const router: IRouter = Router();

const VALID_GRID_SIZES = new Set([3, 4, 6, 9, 16]);
const VALID_TYPES = new Set(["weekly", "monthly"]);

router.get("/tournaments/leaderboard", async (req, res): Promise<void> => {
  const rawType = String(req.query.type ?? "weekly");
  const type = VALID_TYPES.has(rawType) ? (rawType as "weekly" | "monthly") : "weekly";
  const rawGridSize = req.query.gridSize !== undefined ? Number(req.query.gridSize) : undefined;
  const gridSize = rawGridSize !== undefined && VALID_GRID_SIZES.has(rawGridSize)
    ? (rawGridSize as 3 | 4 | 6 | 9 | 16)
    : undefined;
  const rawPeriod = req.query.period ? String(req.query.period) : undefined;

  const now = new Date();
  const period = rawPeriod ?? (type === "weekly" ? getWeekPeriod(now) : getMonthPeriod(now));
  const range = type === "weekly" ? getWeekRange(period) : getMonthRange(period);

  // ── Sudoku games ──────────────────────────────────────────────────────────
  const sudokuRows = await db
    .select({
      profileId: gamesTable.profileId,
      username: profilesTable.username,
      avatar: profilesTable.avatar,
      xp: profilesTable.xp,
      points: gamesTable.points,
      gridSizeVal: puzzlesTable.gridSize,
    })
    .from(gamesTable)
    .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
    .innerJoin(profilesTable, eq(gamesTable.profileId, profilesTable.id))
    .where(
      and(
        eq(gamesTable.status, "completed"),
        gte(gamesTable.completedAt, range.start),
        lt(gamesTable.completedAt, range.end),
      ),
    );

  // ── Memory Match games (only included in "All" view, i.e. no gridSize filter) ──
  const memoryRows = gridSize === undefined
    ? await db
        .select({
          profileId: memoryGamesTable.profileId,
          username: profilesTable.username,
          avatar: profilesTable.avatar,
          xp: profilesTable.xp,
          points: memoryGamesTable.points,
        })
        .from(memoryGamesTable)
        .innerJoin(profilesTable, eq(memoryGamesTable.profileId, profilesTable.id))
        .where(
          and(
            eq(memoryGamesTable.status, "completed"),
            gte(memoryGamesTable.completedAt, range.start),
            lt(memoryGamesTable.completedAt, range.end),
          ),
        )
    : [];

  // ── Filter Sudoku by gridSize if requested ────────────────────────────────
  const filteredSudoku = gridSize !== undefined
    ? sudokuRows.filter((r) => r.gridSizeVal === gridSize)
    : sudokuRows;

  // ── Aggregate by profile ──────────────────────────────────────────────────
  const grouped = new Map<
    number,
    {
      username: string;
      avatar: string | null;
      xp: number;
      totalPoints: number;
      gamesPlayed: number;
      sudokuGamesPlayed: number;
      memoryGamesPlayed: number;
    }
  >();

  const ensureEntry = (profileId: number, username: string, avatar: string | null, xp: number) => {
    if (!grouped.has(profileId)) {
      grouped.set(profileId, { username, avatar, xp, totalPoints: 0, gamesPlayed: 0, sudokuGamesPlayed: 0, memoryGamesPlayed: 0 });
    }
    return grouped.get(profileId)!;
  };

  for (const row of filteredSudoku) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.sudokuGamesPlayed += 1;
  }

  for (const row of memoryRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null, row.xp ?? 0);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.memoryGamesPlayed += 1;
  }

  const sorted = Array.from(grouped.entries())
    .sort((a, b) => b[1].totalPoints - a[1].totalPoints)
    .slice(0, 25);

  // ── Batch-fetch streak data for top players (weekly only) ─────────────────
  const profileIds = sorted.map(([id]) => id);
  let streakMap = new Map<number, number>();

  if (type === "weekly" && profileIds.length > 0) {
    const STREAK_WEEKS = 12;
    const pastPeriods = Array.from({ length: STREAK_WEEKS }, (_, i) => getNthPreviousWeekPeriod(i + 1));

    const streakBadges = await db
      .select({ profileId: badgesTable.profileId, period: badgesTable.tournamentPeriod })
      .from(badgesTable)
      .where(and(
        inArray(badgesTable.profileId, profileIds),
        inArray(badgesTable.tournamentPeriod, pastPeriods),
      ));

    const badgeSet = new Set(streakBadges.map(b => `${b.profileId}::${b.period}`));

    for (const profileId of profileIds) {
      let streak = 0;
      for (let i = 1; i <= STREAK_WEEKS; i++) {
        if (badgeSet.has(`${profileId}::${getNthPreviousWeekPeriod(i)}`)) {
          streak++;
        } else {
          break;
        }
      }
      streakMap.set(profileId, streak);
    }
  }

  const entries = sorted.map(([profileId, data], i) => ({
    rank: i + 1,
    profileId,
    username: data.username,
    avatar: data.avatar,
    xp: data.xp,
    totalPoints: data.totalPoints,
    gamesPlayed: data.gamesPlayed,
    sudokuGamesPlayed: data.sudokuGamesPlayed,
    memoryGamesPlayed: data.memoryGamesPlayed,
    streak: streakMap.get(profileId) ?? 0,
  }));

  res.json({ period, periodLabel: formatPeriodLabel(period), type, entries });
});

// ─── GET /tournaments/breakdown ──────────────────────────────────────────────
// Returns one user's per-grid-size / per-memory-size breakdown for the period.

router.get("/tournaments/breakdown", async (req, res): Promise<void> => {
  const profileId = parseInt(String(req.query.profileId ?? ""), 10);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  const rawType = String(req.query.type ?? "weekly");
  const type = VALID_TYPES.has(rawType) ? (rawType as "weekly" | "monthly") : "weekly";

  const now = new Date();
  const period = req.query.period ? String(req.query.period)
    : (type === "weekly" ? getWeekPeriod(now) : getMonthPeriod(now));
  const range = type === "weekly" ? getWeekRange(period) : getMonthRange(period);

  // Sudoku breakdown by grid size
  const sudokuRows = await db
    .select({
      gridSizeVal: puzzlesTable.gridSize,
      points: gamesTable.points,
    })
    .from(gamesTable)
    .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
    .where(
      and(
        eq(gamesTable.status, "completed"),
        eq(gamesTable.profileId, profileId),
        gte(gamesTable.completedAt, range.start),
        lt(gamesTable.completedAt, range.end),
      ),
    );

  // Memory breakdown by grid size
  const memoryRows = await db
    .select({
      gridSize: memoryGamesTable.gridSize,
      points: memoryGamesTable.points,
    })
    .from(memoryGamesTable)
    .where(
      and(
        eq(memoryGamesTable.status, "completed"),
        eq(memoryGamesTable.profileId, profileId),
        gte(memoryGamesTable.completedAt, range.start),
        lt(memoryGamesTable.completedAt, range.end),
      ),
    );

  // Aggregate sudoku by grid size
  const sudokuByGrid = new Map<number, { points: number; games: number }>();
  for (const row of sudokuRows) {
    const gs = row.gridSizeVal;
    const cur = sudokuByGrid.get(gs) ?? { points: 0, games: 0 };
    cur.points += row.points ?? 0;
    cur.games += 1;
    sudokuByGrid.set(gs, cur);
  }

  // Aggregate memory by grid size
  const memoryByGrid = new Map<number, { points: number; games: number }>();
  for (const row of memoryRows) {
    const gs = row.gridSize;
    const cur = memoryByGrid.get(gs) ?? { points: 0, games: 0 };
    cur.points += row.points ?? 0;
    cur.games += 1;
    memoryByGrid.set(gs, cur);
  }

  res.json({
    profileId,
    period,
    sudoku: [3, 4, 6, 9, 16].map(gs => ({
      gridSize: gs,
      points: sudokuByGrid.get(gs)?.points ?? 0,
      games: sudokuByGrid.get(gs)?.games ?? 0,
    })),
    memory: [2, 4, 6, 8].map(gs => ({
      gridSize: gs,
      points: memoryByGrid.get(gs)?.points ?? 0,
      games: memoryByGrid.get(gs)?.games ?? 0,
    })),
  });
});

// ─── GET /tournaments/streak/:profileId ──────────────────────────────────────

router.get("/tournaments/streak/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId, 10);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  const STREAK_WEEKS = 26;
  const pastPeriods = Array.from({ length: STREAK_WEEKS }, (_, i) => getNthPreviousWeekPeriod(i + 1));

  const badges = await db
    .select({ period: badgesTable.tournamentPeriod, badgeType: badgesTable.badgeType })
    .from(badgesTable)
    .where(and(
      eq(badgesTable.profileId, profileId),
      inArray(badgesTable.tournamentPeriod, pastPeriods),
    ));

  const periodSet = new Set(badges.map(b => b.period));

  let currentStreak = 0;
  let bestStreak = 0;
  let run = 0;
  for (let i = 1; i <= STREAK_WEEKS; i++) {
    const p = getNthPreviousWeekPeriod(i);
    if (periodSet.has(p)) {
      run++;
      if (i === currentStreak + 1 || currentStreak === 0) currentStreak = run;
      bestStreak = Math.max(bestStreak, run);
    } else {
      if (currentStreak === 0) currentStreak = 0;
      run = 0;
    }
  }

  // Recalculate currentStreak properly (consecutive from most recent)
  currentStreak = 0;
  for (let i = 1; i <= STREAK_WEEKS; i++) {
    if (periodSet.has(getNthPreviousWeekPeriod(i))) currentStreak++;
    else break;
  }

  res.json({ profileId, currentStreak, bestStreak, totalTop3Finishes: periodSet.size });
});

export default router;
