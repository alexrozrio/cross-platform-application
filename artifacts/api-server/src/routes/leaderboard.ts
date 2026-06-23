import { Router, type IRouter } from "express";
import { eq, asc, and } from "drizzle-orm";
import { db, gamesTable, puzzlesTable, profilesTable } from "@workspace/db";
import { GetLeaderboardResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  // Parse gridSize directly from req.query BEFORE Zod applies its default of 9.
  // When gridSize is absent from the URL, we want undefined (= all grids).
  const rawGridSize = req.query.gridSize !== undefined ? Number(req.query.gridSize) : undefined;
  const gridSize: number | undefined =
    rawGridSize !== undefined && [3, 4, 9, 16].includes(rawGridSize)
      ? rawGridSize
      : undefined;

  const rawLimit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const limit = (rawLimit && rawLimit > 0) ? rawLimit : 10;

  const completedGames = await db
    .select({
      gameId: gamesTable.id,
      profileId: gamesTable.profileId,
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
    .where(
      gridSize !== undefined
        ? and(eq(gamesTable.status, "completed"), eq(puzzlesTable.gridSize, gridSize))
        : eq(gamesTable.status, "completed"),
    )
    .orderBy(asc(gamesTable.elapsedSeconds))
    .limit(limit);

  const filtered = completedGames;

  const entries = filtered.slice(0, limit).map((g, i) => ({
    rank: i + 1,
    profileId: g.profileId!,
    username: g.username,
    avatar: g.avatar ?? null,
    xp: g.xp ?? 0,
    difficulty: g.difficulty as "easy" | "medium" | "hard" | "expert",
    gridSize: g.gridSize as 3 | 4 | 9 | 16,
    elapsedSeconds: g.elapsedSeconds,
    mistakeCount: g.mistakeCount,
    completedAt: g.completedAt!.toISOString(),
  }));

  res.json(GetLeaderboardResponse.parse(entries));
});

export default router;
