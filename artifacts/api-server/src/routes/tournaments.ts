import { Router, type IRouter } from "express";
import { eq, and, gte, lt } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, profilesTable, memoryGamesTable } from "@workspace/db";
import {
  getWeekPeriod,
  getMonthPeriod,
  getWeekRange,
  getMonthRange,
  formatPeriodLabel,
} from "../utils/periods";

const router: IRouter = Router();

const VALID_GRID_SIZES = new Set([3, 4, 9, 16]);
const VALID_TYPES = new Set(["weekly", "monthly"]);

router.get("/tournaments/leaderboard", async (req, res): Promise<void> => {
  const rawType = String(req.query.type ?? "weekly");
  const type = VALID_TYPES.has(rawType) ? (rawType as "weekly" | "monthly") : "weekly";
  const rawGridSize = req.query.gridSize !== undefined ? Number(req.query.gridSize) : undefined;
  const gridSize = rawGridSize !== undefined && VALID_GRID_SIZES.has(rawGridSize)
    ? (rawGridSize as 3 | 4 | 9)
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
      totalPoints: number;
      gamesPlayed: number;
      sudokuGamesPlayed: number;
      memoryGamesPlayed: number;
    }
  >();

  const ensureEntry = (profileId: number, username: string, avatar: string | null) => {
    if (!grouped.has(profileId)) {
      grouped.set(profileId, { username, avatar, totalPoints: 0, gamesPlayed: 0, sudokuGamesPlayed: 0, memoryGamesPlayed: 0 });
    }
    return grouped.get(profileId)!;
  };

  for (const row of filteredSudoku) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.sudokuGamesPlayed += 1;
  }

  for (const row of memoryRows) {
    if (!row.profileId) continue;
    const entry = ensureEntry(row.profileId, row.username, row.avatar ?? null);
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    entry.memoryGamesPlayed += 1;
  }

  const entries = Array.from(grouped.entries())
    .sort((a, b) => b[1].totalPoints - a[1].totalPoints)
    .slice(0, 25)
    .map(([profileId, data], i) => ({
      rank: i + 1,
      profileId,
      username: data.username,
      avatar: data.avatar,
      totalPoints: data.totalPoints,
      gamesPlayed: data.gamesPlayed,
      sudokuGamesPlayed: data.sudokuGamesPlayed,
      memoryGamesPlayed: data.memoryGamesPlayed,
    }));

  res.json({ period, periodLabel: formatPeriodLabel(period), type, entries });
});

export default router;
