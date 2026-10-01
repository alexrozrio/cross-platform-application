export const CHALLENGE_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getChallengeExpiryCutoff(now = new Date()): Date {
  return new Date(now.getTime() - CHALLENGE_INVITATION_TTL_MS);
}

export function isChallengeInvitationExpired(
  createdAt: Date,
  now = new Date(),
): boolean {
  return now.getTime() - createdAt.getTime() >= CHALLENGE_INVITATION_TTL_MS;
}