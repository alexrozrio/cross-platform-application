import { eq, and, gte, lt, sql } from "drizzle-orm";
import { db, gamesTable, badgesTable, memoryGamesTable, profilesTable } from "@workspace/db";
import {
  getWeekRange,
  getMonthRange,
  getPreviousWeekPeriod,
  getPreviousMonthPeriod,
} from "./periods";
import { logger } from "../lib/logger";

const WEEKLY_GEMS = [20, 10, 5];
const MONTHLY_GEMS = [50, 30, 15];
let lastAwardsCheckDate: string | null = null;
let awardsCheckInFlight: Promise<void> | null = null;

async function awardBadgesForPeriod(
  period: string,
  type: "weekly" | "monthly",
): Promise<number> {
  const range = type === "weekly" ? getWeekRange(period) : getMonthRange(period);
  const gemRewards = type === "weekly" ? WEEKLY_GEMS : MONTHLY_GEMS;

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

  if (totals.size === 0) return 0;

  const ranked = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const BADGE_TYPES = [`${type}_1st`, `${type}_2nd`, `${type}_3rd`];
  let awarded = 0;

  for (let i = 0; i < ranked.length; i++) {
    const [profileId, totalPoints] = ranked[i];

    const result = await db
      .insert(badgesTable)
      .values({
        profileId,
        badgeType: BADGE_TYPES[i],
        tournamentPeriod: period,
        totalPoints,
        shareToken: crypto.randomUUID(),
      })
      .onConflictDoNothing()
      .returning({ id: badgesTable.id });

    if (result.length > 0) {
      awarded++;
      const gems = gemRewards[i] ?? 0;
      if (gems > 0) {
        await db
          .update(profilesTable)
          .set({ gems: sql`${profilesTable.gems} + ${gems}` })
          .where(eq(profilesTable.id, profileId));
      }
      logger.info(
        { period, type, place: i + 1, profileId, totalPoints, gems },
        "Tournament badge awarded",
      );
    }
  }

  return awarded;
}

export async function awardPreviousPeriodBadges(): Promise<void> {
  const prevWeek = getPreviousWeekPeriod();
  const weeklyExists = await db
    .select({ id: badgesTable.id })
    .from(badgesTable)
    .where(eq(badgesTable.tournamentPeriod, prevWeek))
    .limit(1);

  if (weeklyExists.length === 0) {
    const count = await awardBadgesForPeriod(prevWeek, "weekly");
    if (count > 0) {
      logger.info({ period: prevWeek, count }, "Weekly tournament badges awarded");
    }
  }

  const prevMonth = getPreviousMonthPeriod();
  const monthlyExists = await db
    .select({ id: badgesTable.id })
    .from(badgesTable)
    .where(eq(badgesTable.tournamentPeriod, prevMonth))
    .limit(1);

  if (monthlyExists.length === 0) {
    const count = await awardBadgesForPeriod(prevMonth, "monthly");
    if (count > 0) {
      logger.info({ period: prevMonth, count }, "Monthly tournament badges awarded");
    }
  }
}

/**
 * Run the idempotent awards check only when a user requests tournament/badge
 * data. This avoids scheduled database queries while the app is idle.
 */
export function ensureTournamentAwards(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  if (lastAwardsCheckDate === today) return Promise.resolve();
  if (awardsCheckInFlight) return awardsCheckInFlight;

  awardsCheckInFlight = awardPreviousPeriodBadges()
    .then(() => {
      lastAwardsCheckDate = today;
    })
    .catch((err) => {
      logger.error({ err }, "Tournament award check failed on request");
    })
    .finally(() => {
      awardsCheckInFlight = null;
    });

  return awardsCheckInFlight;
}
