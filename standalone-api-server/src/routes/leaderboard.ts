import { Router, type IRouter } from "express";
import { eq, desc, asc, and } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, profilesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  const rawGridSize = req.query.gridSize !== undefined ? Number(req.query.gridSize) : undefined;
  const gridSize: number | undefined =
    rawGridSize !== undefined && [3, 4, 9, 16].includes(rawGridSize)
      ? rawGridSize
      : undefined;

  const rawLimit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const limit = (rawLimit && rawLimit > 0) ? rawLimit : 10;

  if (gridSize === undefined) {
    // ── "All" tab: one aggregated row per player ──────────────────────────────
    const rows = await db
      .select({
        profileId: gamesTable.profileId,
        username: profilesTable.username,
        avatar: profilesTable.avatar,
        xp: profilesTable.xp,
        points: gamesTable.points,
      })
      .from(gamesTable)
      .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
      .innerJoin(profilesTable, eq(gamesTable.profileId, profilesTable.id))
      .where(eq(gamesTable.status, "completed"))
      .orderBy(desc(gamesTable.points));

    const agg = new Map<number, {
      username: string;
      avatar: string | null;
      xp: number;
      totalPoints: number;
      gamesPlayed: number;
    }>();

    for (const row of rows) {
      if (!row.profileId) continue;
      const cur = agg.get(row.profileId) ?? {
        username: row.username,
        avatar: row.avatar ?? null,
        xp: row.xp ?? 0,
        totalPoints: 0,
        gamesPlayed: 0,
      };
      cur.totalPoints += row.points ?? 0;
      cur.gamesPlayed += 1;
      agg.set(row.profileId, cur);
    }

    const sorted = Array.from(agg.entries())
      .sort((a, b) => b[1].totalPoints - a[1].totalPoints)
      .slice(0, limit)
      .map(([profileId, d], i) => ({
        rank: i + 1,
        profileId,
        username: d.username,
        avatar: d.avatar,
        xp: d.xp,
        totalPoints: d.totalPoints,
        gamesPlayed: d.gamesPlayed,
        // null fields not applicable for aggregate view
        points: d.totalPoints,
        difficulty: null,
        gridSize: null,
        elapsedSeconds: null,
        mistakeCount: null,
        completedAt: null,
      }));

    res.json(sorted);
    return;
  }

  // ── Single grid size: fastest time per game ───────────────────────────────
  const rows = await db
    .select({
      gameId: gamesTable.id,
      profileId: gamesTable.profileId,
      points: gamesTable.points,
      elapsedSeconds: gamesTable.elapsedSeconds,
      mistakeCount: gamesTable.mistakeCount,
      completedAt: gamesTable.completedAt,
      difficulty: puzzlesTable.difficulty,
      gridSize: puzzlesTable.gridSize,
      username: profilesTable.username,
      avatar: profilesTable.avatar,
      xp: profilesTable.xp,
    })
    .from(gamesTable)
    .innerJoin(puzzlesTable, eq(gamesTable.puzzleId, puzzlesTable.id))
    .innerJoin(profilesTable, eq(gamesTable.profileId, profilesTable.id))
    .where(and(eq(gamesTable.status, "completed"), eq(puzzlesTable.gridSize, gridSize)))
    .orderBy(asc(gamesTable.elapsedSeconds))
    .limit(limit);

  res.json(rows.map((g, i) => ({
    rank: i + 1,
    profileId: g.profileId!,
    username: g.username,
    avatar: g.avatar ?? null,
    xp: g.xp ?? 0,
    difficulty: g.difficulty,
    gridSize: g.gridSize,
    points: g.points ?? 0,
    totalPoints: null,
    gamesPlayed: null,
    elapsedSeconds: g.elapsedSeconds,
    mistakeCount: g.mistakeCount,
    completedAt: g.completedAt?.toISOString() ?? null,
  })));
});

export default router;
