import { awardPreviousPeriodBadges } from "./awards";
import { logger } from "../lib/logger";
import { expirePendingInvitations } from "./challenge-expiry";

const HOUR_MS = 60 * 60 * 1000;

async function runAwards() {
  try {
    await awardPreviousPeriodBadges();
  } catch (err) {
    logger.error({ err }, "Tournament scheduler error");
  }
}

async function runChallengeExpiry() {
  try {
    const expired = await expirePendingInvitations();
    if (expired.sudoku > 0 || expired.memory > 0) {
      logger.info(expired, "Expired pending challenge invitations");
    }
  } catch (err) {
    logger.error({ err }, "Challenge invitation expiry cleanup failed");
  }
}

export function startTournamentScheduler() {
  logger.info("Tournament scheduler started");

  // Run immediately on startup to catch any missed periods
  runAwards();
  runChallengeExpiry();

  // Then check every hour — awardPreviousPeriodBadges is fully idempotent
  // (uses onConflictDoNothing) so running it frequently is safe
  setInterval(runAwards, HOUR_MS);
  setInterval(runChallengeExpiry, HOUR_MS);
}
