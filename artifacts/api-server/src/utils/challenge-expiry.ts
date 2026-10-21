import { and, eq, lte, or } from "drizzle-orm";
import { db, challengesTable, memoryDuelsTable } from "@workspace/db";
import { getChallengeExpiryCutoff, isChallengeInvitationExpired } from "./challenge-expiry-policy";

type ChallengeInvitation =
  | { type: "sudoku"; record: typeof challengesTable.$inferSelect }
  | { type: "memory"; record: typeof memoryDuelsTable.$inferSelect };

export async function expireInvitationIfDue(
  invitation: ChallengeInvitation,
  now = new Date(),
): Promise<boolean> {
  const { record } = invitation;
  if (record.status === "expired") return true;
  if (
    record.status !== "pending" ||
    !isChallengeInvitationExpired(record.createdAt, now)
  ) {
    return false;
  }

  const cutoff = getChallengeExpiryCutoff(now);
  if (invitation.type === "sudoku") {
    await db
      .update(challengesTable)
      .set({ status: "expired" })
      .where(
        and(
          eq(challengesTable.id, record.id),
          eq(challengesTable.status, "pending"),
          lte(challengesTable.createdAt, cutoff),
        ),
      );
  } else {
    await db
      .update(memoryDuelsTable)
      .set({ status: "expired" })
      .where(
        and(
          eq(memoryDuelsTable.id, record.id),
          eq(memoryDuelsTable.status, "pending"),
          lte(memoryDuelsTable.createdAt, cutoff),
        ),
      );
  }

  return true;
}

export async function expirePendingInvitationsForProfile(profileId: number, now = new Date()) {
  const cutoff = getChallengeExpiryCutoff(now);
  const [expiredSudoku, expiredMemory] = await Promise.all([
    db
      .update(challengesTable)
      .set({ status: "expired" })
      .where(
        and(
          eq(challengesTable.status, "pending"),
          lte(challengesTable.createdAt, cutoff),
          or(
            eq(challengesTable.challengerId, profileId),
            eq(challengesTable.challengedId, profileId),
          ),
        ),
      )
      .returning({ id: challengesTable.id }),
    db
      .update(memoryDuelsTable)
      .set({ status: "expired" })
      .where(
        and(
          eq(memoryDuelsTable.status, "pending"),
          lte(memoryDuelsTable.createdAt, cutoff),
          or(
            eq(memoryDuelsTable.challengerId, profileId),
            eq(memoryDuelsTable.challengedId, profileId),
          ),
        ),
      )
      .returning({ id: memoryDuelsTable.id }),
  ]);

  return { sudoku: expiredSudoku.length, memory: expiredMemory.length };
}