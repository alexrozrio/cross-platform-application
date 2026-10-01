import { describe, expect, it } from "vitest";
import {
  CHALLENGE_INVITATION_TTL_MS,
  getChallengeExpiryCutoff,
  isChallengeInvitationExpired,
} from "../utils/challenge-expiry-policy";

describe("challenge invitation expiry policy", () => {
  const now = new Date("2026-10-01T12:00:00.000Z");

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