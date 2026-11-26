import { Capacitor, registerPlugin } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { getAdsConfiguration } from "./ad-configuration";

interface InterstitialAdsPlugin {
  showAfterGame(): Promise<void>;
}

const interstitialAds = registerPlugin<InterstitialAdsPlugin>("InterstitialAds");

export async function showInterstitialAfterGame() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return;
  }

  const configuration = await getAdsConfiguration();
  if (!configuration.interstitial) return;

  await interstitialAds.showAfterGame();
}

export function useInterstitialAfterGame(isComplete: boolean, isPlaying: boolean) {
  const initialized = useRef(false);
  const wasComplete = useRef(false);
  const playedThisSession = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      wasComplete.current = isComplete;
      playedThisSession.current = isPlaying;
      return;
    }

    if (isPlaying) {
      playedThisSession.current = true;
    }

    if (isComplete && !wasComplete.current && playedThisSession.current) {
      void showInterstitialAfterGame().catch((error: unknown) => {
        console.error("[Ads] Could not show interstitial after game:", error);
      });
    }

    if (!isComplete && !isPlaying) {
      playedThisSession.current = false;
    }
    wasComplete.current = isComplete;
  }, [isComplete, isPlaying]);
}
