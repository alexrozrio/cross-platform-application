import { eq, and, gte, lt } from "drizzle-orm";
import { db, gamesTable, badgesTable, memoryGamesTable } from "@workspace/db";
import {
  getWeekRange,
  getMonthRange,
  getPreviousWeekPeriod,
  getPreviousMonthPeriod,
} from "./periods";

async function awardBadgesForPeriod(
  period: string,
  type: "weekly" | "monthly",
): Promise<void> {
  const range = type === "weekly" ? getWeekRange(period) : getMonthRange(period);

  const [sudokuRows, memoryRows] = await Promise.all([
    db.select({ profileId: gamesTable.profileId, points: gamesTable.points })
      .from(gamesTable)
      .where(and(
        eq(gamesTable.status, "completed"),
        gte(gamesTable.completedAt, range.start),
        lt(gamesTable.completedAt, range.end),
      )),
    db.select({ profileId: memoryGamesTable.profileId, points: memoryGamesTable.points })
      .from(memoryGamesTable)
      .where(and(
        eq(memoryGamesTable.status, "completed"),
        gte(memoryGamesTable.completedAt, range.start),
        lt(memoryGamesTable.completedAt, range.end),
      )),
  ]);

  const totals = new Map<number, number>();
  for (const row of [...sudokuRows, ...memoryRows]) {
    if (!row.profileId) continue;
    totals.set(row.profileId, (totals.get(row.profileId) ?? 0) + (row.points ?? 0));
  }

  if (totals.size === 0) return;

  const ranked = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const TYPES = [`${type}_1st`, `${type}_2nd`, `${type}_3rd`];

  for (let i = 0; i < ranked.length; i++) {
    const [profileId, totalPoints] = ranked[i];
    await db
      .insert(badgesTable)
      .values({
        profileId,
        badgeType: TYPES[i],
        tournamentPeriod: period,
        totalPoints,
        shareToken: crypto.randomUUID(),
      })
      .onConflictDoNothing();
  }
}

export async function awardPreviousPeriodBadges(): Promise<void> {
  const prevWeek = getPreviousWeekPeriod();
  const weeklyExists = await db
    .select({ id: badgesTable.id })
    .from(badgesTable)
    .where(eq(badgesTable.tournamentPeriod, prevWeek))
    .limit(1);
  if (weeklyExists.length === 0) {
    await awardBadgesForPeriod(prevWeek, "weekly");
  }

  const prevMonth = getPreviousMonthPeriod();
  const monthlyExists = await db
    .select({ id: badgesTable.id })
    .from(badgesTable)
    .where(eq(badgesTable.tournamentPeriod, prevMonth))
    .limit(1);
  if (monthlyExists.length === 0) {
    await awardBadgesForPeriod(prevMonth, "monthly");
  }
}
