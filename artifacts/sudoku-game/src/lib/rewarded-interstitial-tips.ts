import { useCallback, useRef, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { toast } from "sonner";
import { useAdsConfiguration } from "./ad-configuration";

interface RewardedAdsPlugin {
  showForExtraTip(): Promise<{ earned: boolean }>;
}

const rewardedAds = registerPlugin<RewardedAdsPlugin>("RewardedAds");

export function canShowRewardedInterstitialTips(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export function useRewardedInterstitialTip() {
  const [isShowingRewardedTip, setIsShowingRewardedTip] = useState(false);
  const requestInProgress = useRef(false);
  const configuration = useAdsConfiguration();
  const isEnabled =
    canShowRewardedInterstitialTips() && configuration.rewardedInterstitial;

  const showAdForExtraTip = useCallback(async (onEarned: () => void, successMessage = "You unlocked one extra tip!"): Promise<boolean> => {
    if (!isEnabled || requestInProgress.current) {
      return false;
    }

    requestInProgress.current = true;
    setIsShowingRewardedTip(true);
    try {
      const { earned } = await rewardedAds.showForExtraTip();
      if (!earned) {
        toast.error("The ad wasn't completed or isn't available. Try again shortly.");
        return false;
      }

      onEarned();
      toast.success(successMessage);
      return true;
    } catch (error) {
      console.error("[Ads] Could not show rewarded interstitial for an extra tip:", error);
      toast.error("The rewarded ad couldn't be shown. Please try again.");
      return false;
    } finally {
      requestInProgress.current = false;
      setIsShowingRewardedTip(false);
    }
  }, [isEnabled]);

  return { isShowingRewardedTip, showAdForExtraTip, isEnabled };
}
