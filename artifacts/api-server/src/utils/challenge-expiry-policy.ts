export const CHALLENGE_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CHALLENGE_ACTIVE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const CHALLENGE_EXPIRED_VISIBLE_MS = 7 * 24 * 60 * 60 * 1000;

export type ChallengeRecord = {
  id: number;
  status: string;
  createdAt: Date;
  expiresAt?: Date | null;
  challengerGameId?: number | null;
  challengedGameId?: number | null;
};

export function getChallengeExpiryCutoff(now = new Date()): Date {
  return new Date(now.getTime() - CHALLENGE_INVITATION_TTL_MS);
}

export function isChallengeInvitationExpired(
  createdAt: Date,
  now = new Date(),
): boolean {
  return now.getTime() - createdAt.getTime() >= CHALLENGE_INVITATION_TTL_MS;
}

function pendingExpiry(record: ChallengeRecord): Date {
  return record.expiresAt ?? new Date(record.createdAt.getTime() + CHALLENGE_INVITATION_TTL_MS);
}

function activeExpiry(record: ChallengeRecord): Date {
  return new Date(record.createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS);
}

export function isPendingChallengeExpired(record: ChallengeRecord, now = new Date()): boolean {
  return record.status === "pending" && now.getTime() >= pendingExpiry(record).getTime();
}

export function isActiveChallengeExpired(record: ChallengeRecord, now = new Date()): boolean {
  return record.status === "accepted" && now.getTime() >= activeExpiry(record).getTime();
}

export function isChallengeRecordHidden(record: ChallengeRecord, now = new Date()): boolean {
  if (record.status !== "expired") return false;
  const accepted = Boolean(record.challengedGameId);
  const expiry = accepted ? activeExpiry(record) : pendingExpiry(record);
  const visibleMs = accepted ? 0 : CHALLENGE_EXPIRED_VISIBLE_MS;
  return now.getTime() >= expiry.getTime() + visibleMs;
}
