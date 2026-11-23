import { and, eq, or } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  isActiveChallengeExpired,
  isPendingChallengeExpired,
  type ChallengeRecord,
} from "./challenge-expiry-policy";

export {
  CHALLENGE_ACTIVE_TTL_MS,
  CHALLENGE_EXPIRED_VISIBLE_MS,
  CHALLENGE_INVITATION_TTL_MS,
  isChallengeRecordHidden,
  type ChallengeRecord,
} from "./challenge-expiry-policy";

async function markExpired(table: any, id: number): Promise<void> {
  await db.update(table).set({ status: "expired" }).where(and(
    eq(table.id, id),
    or(eq(table.status, "pending"), eq(table.status, "accepted")),
  ));
}

export async function expireChallengeIfDue(table: any, record: ChallengeRecord, now = new Date()): Promise<boolean> {
  if (record.status === "expired") return true;
  if (isPendingChallengeExpired(record, now) || isActiveChallengeExpired(record, now)) {
    await markExpired(table, record.id);
    record.status = "expired";
    return true;
  }
  return false;
}

export async function expireChallengesForProfile(table: any, profileId: number, now = new Date()): Promise<number> {
  const records = await db.select().from(table).where(or(
    eq(table.challengerId, profileId),
    eq(table.challengedId, profileId),
  ));

  let expired = 0;
  for (const record of records as ChallengeRecord[]) {
    if (await expireChallengeIfDue(table, record, now)) expired += 1;
  }
  return expired;
}
