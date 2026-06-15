import { Router, type IRouter } from "express";
import { eq, and, gte, lt } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, profilesTable } from "@workspace/db";
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

  const rows = await db
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

  const filtered =
    gridSize !== undefined ? rows.filter((r) => r.gridSizeVal === gridSize) : rows;

  const grouped = new Map<
    number,
    { username: string; avatar: string | null; totalPoints: number; gamesPlayed: number }
  >();
  for (const row of filtered) {
    if (!row.profileId) continue;
    const existing = grouped.get(row.profileId);
    const pts = row.points ?? 0;
    if (existing) {
      existing.totalPoints += pts;
      existing.gamesPlayed += 1;
    } else {
      grouped.set(row.profileId, {
        username: row.username,
        avatar: row.avatar ?? null,
        totalPoints: pts,
        gamesPlayed: 1,
      });
    }
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
    }));

  res.json({ period, periodLabel: formatPeriodLabel(period), type, entries });
});

export default router;
