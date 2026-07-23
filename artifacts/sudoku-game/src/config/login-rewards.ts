/**
 * Login reward tier configuration — frontend copy.
 * Keep in sync with artifacts/api-server/src/config/login-rewards.ts
 *
 * Each tier has:
 *   daysInTier — how many consecutive login days this tier covers (Infinity for the final tier)
 *   gems       — gems awarded per day while in this tier
 *   label      — human-readable label shown in the UI
 */
export interface LoginRewardTier {
  label: string;
  daysInTier: number;
  gems: number;
}

export const LOGIN_REWARD_TIERS: LoginRewardTier[] = [
  { label: "Day 1", daysInTier: 1, gems: 1 },
  { label: "Days 2–7", daysInTier: 6, gems: 2 },
  { label: "Days 8–14", daysInTier: 7, gems: 3 },
  { label: "Days 15-30", daysInTier: 16, gems: 4 },
  { label: "Day 31", daysInTier: Infinity, gems: 5 },
];

/** Returns the gems awarded for a given consecutive login streak (1-based). */
export function gemsForLoginStreak(streak: number): number {
  let remaining = streak;
  for (const tier of LOGIN_REWARD_TIERS) {
    if (remaining <= tier.daysInTier) return tier.gems;
    remaining -= tier.daysInTier;
  }
  return LOGIN_REWARD_TIERS[LOGIN_REWARD_TIERS.length - 1].gems;
}

/** Returns the 0-based tier index for a given streak. */
export function tierIndexForStreak(streak: number): number {
  let remaining = streak;
  for (let i = 0; i < LOGIN_REWARD_TIERS.length; i++) {
    if (remaining <= LOGIN_REWARD_TIERS[i].daysInTier) return i;
    remaining -= LOGIN_REWARD_TIERS[i].daysInTier;
  }
  return LOGIN_REWARD_TIERS.length - 1;
}
