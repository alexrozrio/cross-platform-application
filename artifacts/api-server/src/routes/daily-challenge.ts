import { Router, type IRouter } from "express";
import { eq, and, asc, gte, lt } from "drizzle-orm";
import { db, puzzlesTable, gamesTable, profilesTable, dailyChallengesTable } from "@workspace/db";
import { generatePuzzle } from "../lib/sudoku";

const router: IRouter = Router();

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getOrCreateTodaysChallenge() {
  const today = todayDateString();

  const [existing] = await db
    .select()
    .from(dailyChallengesTable)
    .where(eq(dailyChallengesTable.date, today));

  if (existing) {
    const [puzzle] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.id, existing.puzzleId));
    return { challenge: existing, puzzle };
  }

  const { grid, solution } = generatePuzzle("medium", 9);
  const [puzzle] = await db
    .insert(puzzlesTable)
    .values({ difficulty: "medium", gridSize: 9, grid, solution })
    .returning();

  const [challenge] = await db
    .insert(dailyChallengesTable)
    .values({ date: today, puzzleId: puzzle.id })
    .returning();

  return { challenge, puzzle };
}

router.get("/daily-challenge", async (req, res): Promise<void> => {
  try {
    const { challenge, puzzle } = await getOrCreateTodaysChallenge();
    res.json({
      puzzleId: puzzle.id,
      date: challenge.date,
      difficulty: puzzle.difficulty,
      gridSize: puzzle.gridSize,
      grid: puzzle.grid,
      solution: puzzle.solution,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get daily challenge" });
  }
});

router.get("/daily-challenge/leaderboard", async (req, res): Promise<void> => {
  try {
    const { puzzle } = await getOrCreateTodaysChallenge();
    const today = todayDateString();

    const entries = await db
      .select({
        profileId: gamesTable.profileId,
        elapsedSeconds: gamesTable.elapsedSeconds,
        mistakeCount: gamesTable.mistakeCount,
        completedAt: gamesTable.completedAt,
        username: profilesTable.username,
        avatar: profilesTable.avatar,
      })
      .from(gamesTable)
      .innerJoin(profilesTable, eq(gamesTable.profileId, profilesTable.id))
      .where(
        and(
          eq(gamesTable.puzzleId, puzzle.id),
          eq(gamesTable.status, "completed"),
        ),
      )
      .orderBy(asc(gamesTable.elapsedSeconds))
      .limit(20);

    const filtered = entries.filter((e) => {
      if (!e.completedAt) return false;
      return e.completedAt.toISOString().slice(0, 10) === today;
    });

    res.json(
      filtered.map((e, i) => ({
        rank: i + 1,
        profileId: e.profileId!,
        username: e.username,
        avatar: e.avatar ?? null,
        elapsedSeconds: e.elapsedSeconds,
        mistakeCount: e.mistakeCount,
        completedAt: e.completedAt!.toISOString(),
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

router.get("/daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number(req.params.profileId);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  // month param: "YYYY-MM", defaults to current month
  const monthParam = typeof req.query.month === "string" ? req.query.month : todayDateString().slice(0, 7);
  const [year, mon] = monthParam.split("-").map(Number);
  if (!year || !mon) { res.status(400).json({ error: "Invalid month" }); return; }

  const monthStart = `${year}-${String(mon).padStart(2, "0")}-01`;
  const nextYear = mon === 12 ? year + 1 : year;
  const nextMon = mon === 12 ? 1 : mon + 1;
  const monthEnd = `${nextYear}-${String(nextMon).padStart(2, "0")}-01`;

  const rows = await db
    .select({ date: dailyChallengesTable.date })
    .from(gamesTable)
    .innerJoin(dailyChallengesTable, eq(gamesTable.puzzleId, dailyChallengesTable.puzzleId))
    .where(
      and(
        eq(gamesTable.profileId, profileId),
        eq(gamesTable.status, "completed"),
        gte(dailyChallengesTable.date, monthStart),
        lt(dailyChallengesTable.date, monthEnd),
      )
    );

  const dates = [...new Set(rows.map(r => r.date))];
  res.json({ month: monthParam, completedDates: dates });
});

router.get("/daily-challenge/streak/:profileId", async (req, res): Promise<void> => {
  const profileId = Number(req.params.profileId);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const today = todayDateString();
  const completedToday = profile.lastChallengeDate === today;

  res.json({
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastChallengeDate: profile.lastChallengeDate ?? null,
    completedToday,
  });
});

export default router;
