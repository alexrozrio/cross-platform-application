import { describe, expect, it } from "vitest";
import {
  CHALLENGE_ACTIVE_TTL_MS,
  CHALLENGE_EXPIRED_VISIBLE_MS,
  CHALLENGE_INVITATION_TTL_MS,
  getChallengeExpiryCutoff,
  isActiveChallengeExpired,
  isChallengeInvitationExpired,
  isChallengeRecordHidden,
  isPendingChallengeExpired,
  type ChallengeRecord,
} from "../utils/challenge-expiry-policy";

const now = new Date("2026-10-01T12:00:00.000Z");

function challenge(overrides: Partial<ChallengeRecord> = {}): ChallengeRecord {
  return {
    id: 1,
    status: "pending",
    createdAt: now,
    expiresAt: null,
    challengedGameId: null,
    ...overrides,
  };
}

describe("challenge invitation expiry policy", () => {
  it("sets the cutoff exactly seven days before now", () => {
    expect(getChallengeExpiryCutoff(now).toISOString()).toBe(
      "2026-09-24T12:00:00.000Z",
    );
  });

  it("keeps invitations active until they reach seven days old", () => {
    expect(
      isChallengeInvitationExpired(
        new Date(now.getTime() - CHALLENGE_INVITATION_TTL_MS + 1),
        now,
      ),
    ).toBe(false);
  });

  it("expires invitations at seven days and afterward", () => {
    expect(
      isChallengeInvitationExpired(
        new Date(now.getTime() - CHALLENGE_INVITATION_TTL_MS),
        now,
      ),
    ).toBe(true);
    expect(
      isChallengeInvitationExpired(
        new Date(now.getTime() - CHALLENGE_INVITATION_TTL_MS - 1),
        now,
      ),
    ).toBe(true);
  });
});

describe("challenge lifecycle policy", () => {
  it("expires pending challenges at the seven-day invitation deadline", () => {
    const createdAt = new Date(now.getTime() - CHALLENGE_INVITATION_TTL_MS);
    const pending = challenge({
      createdAt,
      expiresAt: new Date(createdAt.getTime() + CHALLENGE_INVITATION_TTL_MS),
    });

    expect(isPendingChallengeExpired(pending, now)).toBe(true);
    expect(isPendingChallengeExpired(pending, new Date(now.getTime() - 1))).toBe(false);
  });

  it("keeps expired pending challenges visible for seven more days", () => {
    const createdAt = new Date(
      now.getTime() - CHALLENGE_INVITATION_TTL_MS - CHALLENGE_EXPIRED_VISIBLE_MS + 1,
    );
    const pending = challenge({
      status: "expired",
      createdAt,
      expiresAt: new Date(createdAt.getTime() + CHALLENGE_INVITATION_TTL_MS),
    });

    expect(isChallengeRecordHidden(pending, now)).toBe(false);
  });

  it("hides expired pending challenges after fourteen days total", () => {
    const createdAt = new Date(
      now.getTime() - CHALLENGE_INVITATION_TTL_MS - CHALLENGE_EXPIRED_VISIBLE_MS,
    );
    const pending = challenge({
      status: "expired",
      createdAt,
      expiresAt: new Date(createdAt.getTime() + CHALLENGE_INVITATION_TTL_MS),
    });

    expect(isChallengeRecordHidden(pending, now)).toBe(true);
  });

  it("expires accepted challenges at fourteen days from creation", () => {
    const createdAt = new Date(now.getTime() - CHALLENGE_ACTIVE_TTL_MS);
    const accepted = challenge({
      status: "accepted",
      createdAt,
      challengedGameId: 42,
      expiresAt: new Date(createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS),
    });

    expect(isActiveChallengeExpired(accepted, now)).toBe(true);
    expect(isActiveChallengeExpired(accepted, new Date(now.getTime() - 1))).toBe(false);
    expect(isPendingChallengeExpired(accepted, now)).toBe(false);
  });

  it("hides expired accepted challenges immediately at the fourteen-day deadline", () => {
    const createdAt = new Date(now.getTime() - CHALLENGE_ACTIVE_TTL_MS);
    const accepted = challenge({
      status: "expired",
      createdAt,
      challengedGameId: 42,
      expiresAt: new Date(createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS),
    });

    expect(isChallengeRecordHidden(accepted, now)).toBe(true);
    expect(isChallengeRecordHidden(accepted, new Date(now.getTime() - 1))).toBe(false);
  });

  it("does not expire or hide completed challenges because of age", () => {
    const completed = challenge({
      status: "completed",
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      challengedGameId: 42,
    });

    expect(isPendingChallengeExpired(completed, now)).toBe(false);
    expect(isActiveChallengeExpired(completed, now)).toBe(false);
    expect(isChallengeRecordHidden(completed, now)).toBe(false);
  });
});
