import { Capacitor, registerPlugin } from "@capacitor/core";
import { apiUrl } from "./api-base-url";
import { getAdsConfiguration } from "./ad-configuration";

interface RewardedAdsPlugin {
  showForLoginReward(options: {
    profileId: string;
    rewardDate: string;
  }): Promise<{ earned: boolean }>;
}

interface LoginRewardDoubleStatus {
  doubled: boolean;
  gemsAwarded: number;
  totalGems: number;
}

const rewardedAds = registerPlugin<RewardedAdsPlugin>("RewardedAds");

export type LoginRewardAdResult =
  | { status: "confirmed"; gemsAwarded: number; totalGems: number }
  | { status: "not-earned" }
  | { status: "pending" };

export function canShowRewardedAds(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

async function getDoubleStatus(
  profileId: number,
  rewardDate: string,
): Promise<LoginRewardDoubleStatus> {
  const url = apiUrl(
    `/api/profiles/${profileId}/login-reward-double?date=${encodeURIComponent(rewardDate)}`,
  );
  const isCrossOrigin = url.startsWith("http");
  const response = await fetch(url, {
    credentials: isCrossOrigin ? "omit" : "include",
  });
  if (!response.ok) {
    throw new Error(
      `Could not check the login reward status (${response.status}).`,
    );
  }
  return response.json() as Promise<LoginRewardDoubleStatus>;
}

export async function showAdToDoubleLoginReward(
  profileId: number,
  rewardDate: string,
): Promise<LoginRewardAdResult> {
  if (!canShowRewardedAds() || !(await getAdsConfiguration()).rewarded) {
    return { status: "not-earned" };
  }

  const result = await rewardedAds.showForLoginReward({
    profileId: String(profileId),
    rewardDate,
  });
  if (!result.earned) {
    return { status: "not-earned" };
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const status = await getDoubleStatus(profileId, rewardDate);
    if (status.doubled) {
      return {
        status: "confirmed",
        gemsAwarded: status.gemsAwarded,
        totalGems: status.totalGems,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return { status: "pending" };
}
