/**
 * Email poller — runs inside the Replit API server on a timer.
 *
 * Connects directly to the Neon DB (NEON_DATABASE_URL) that the Render API
 * also uses. Finds pending challenges with no notifiedAt, sends email
 * notifications via Resend, then stamps notifiedAt so they're not
 * re-processed.
 *
 * This lets email work without deploying any new code to Render.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, isNull, and } from "drizzle-orm";
import { challengesTable, profilesTable } from "@workspace/db";
import { sendChallengeNotification } from "../lib/email";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

function getNeonDb() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) return null;
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  return drizzle(pool);
}

async function pollAndNotify() {
  const neon = getNeonDb();
  if (!neon) return; // NEON_DATABASE_URL not configured — skip silently

  try {
    // Find pending challenges that haven't been emailed yet
    const pending = await neon
      .select()
      .from(challengesTable)
      .where(
        and(
          eq(challengesTable.status, "pending"),
          isNull(challengesTable.notifiedAt),
        ),
      );

    if (pending.length === 0) return;

    console.log(`[email-poller] found ${pending.length} unnotified challenge(s)`);

    for (const challenge of pending) {
      // Get challenger username
      const [challenger] = await neon
        .select({ username: profilesTable.username })
        .from(profilesTable)
        .where(eq(profilesTable.id, challenge.challengerId));

      if (!challenger) continue;

      // Stamp notifiedAt immediately (before sending) to prevent duplicate sends
      // even if the email call fails
      await neon
        .update(challengesTable)
        .set({ notifiedAt: new Date() })
        .where(eq(challengesTable.id, challenge.id));

      console.log(`[email-poller] challenge #${challenge.id} — triggering notification`);

      // sendChallengeNotification resolves the recipient from the app DB
      await sendChallengeNotification({
        challengedProfileId: challenge.challengedId,
        challengerUsername: challenger.username,
        difficulty: "medium", // puzzle difficulty not stored on challenge; use a generic label
        gridSize: 9,
        challengeId: challenge.id,
      });
    }
  } catch (err) {
    console.error("[email-poller] error during poll:", err);
  }
}

export function startEmailPoller() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    console.log("[email-poller] NEON_DATABASE_URL not set — email polling disabled");
    return;
  }
  console.log("[email-poller] started — polling every 30s for unnotified challenges");
  pollAndNotify(); // run immediately on startup
  setInterval(pollAndNotify, POLL_INTERVAL_MS);
}
