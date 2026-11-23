import { challengesTable, memoryDuelsTable } from "@workspace/db";
import { expireChallengeIfDue, expireChallengesForProfile } from "./challenge-lifecycle";

type ChallengeInvitation =
  | { type: "sudoku"; record: typeof challengesTable.$inferSelect }
  | { type: "memory"; record: typeof memoryDuelsTable.$inferSelect };

export async function expireInvitationIfDue(
  invitation: ChallengeInvitation,
  now = new Date(),
): Promise<boolean> {
  const table = invitation.type === "sudoku" ? challengesTable : memoryDuelsTable;
  return expireChallengeIfDue(table, invitation.record, now);
}

export async function expirePendingInvitationsForProfile(profileId: number, now = new Date()) {
  const [sudoku, memory] = await Promise.all([
    expireChallengesForProfile(challengesTable, profileId, now),
    expireChallengesForProfile(memoryDuelsTable, profileId, now),
  ]);

  return { sudoku, memory };
}
