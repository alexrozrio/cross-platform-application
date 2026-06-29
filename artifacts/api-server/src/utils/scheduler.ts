import { awardPreviousPeriodBadges } from "./awards";
import { logger } from "../lib/logger";

const HOUR_MS = 60 * 60 * 1000;

async function runAwards() {
  try {
    await awardPreviousPeriodBadges();
  } catch (err) {
    logger.error({ err }, "Tournament scheduler error");
  }
}

export function startTournamentScheduler() {
  logger.info("Tournament scheduler started");

  // Run immediately on startup to catch any missed periods
  runAwards();

  // Then check every hour — awardPreviousPeriodBadges is fully idempotent
  // (uses onConflictDoNothing) so running it frequently is safe
  setInterval(runAwards, HOUR_MS);
}
