import { Capacitor, registerPlugin } from "@capacitor/core";
import { useEffect, useState } from "react";

export interface AdsConfiguration {
  banner: boolean;
  interstitial: boolean;
  rewarded: boolean;
  rewardedInterstitial: boolean;
  native: boolean;
  appOpen: boolean;
}

interface AdsConfigurationPlugin {
  getConfiguration(): Promise<AdsConfiguration>;
}

const adsConfigurationPlugin =
  registerPlugin<AdsConfigurationPlugin>("AdsConfiguration");

const DISABLED_ADS_CONFIGURATION: AdsConfiguration = {
  banner: false,
  interstitial: false,
  rewarded: false,
  rewardedInterstitial: false,
  native: false,
  appOpen: false,
};

function isAndroidAdsPlatform(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export async function getAdsConfiguration(): Promise<AdsConfiguration> {
  if (!isAndroidAdsPlatform()) {
    return DISABLED_ADS_CONFIGURATION;
  }

  const configuration = await adsConfigurationPlugin.getConfiguration();
  if (
    !configuration ||
    typeof configuration.banner !== "boolean" ||
    typeof configuration.interstitial !== "boolean" ||
    typeof configuration.rewarded !== "boolean" ||
    typeof configuration.rewardedInterstitial !== "boolean" ||
    typeof configuration.native !== "boolean" ||
    typeof configuration.appOpen !== "boolean"
  ) {
    throw new Error("The native ad configuration is invalid.");
  }

  return configuration;
}

export function useAdsConfiguration(): AdsConfiguration {
  const [configuration, setConfiguration] = useState(DISABLED_ADS_CONFIGURATION);

  useEffect(() => {
    let active = true;
    void getAdsConfiguration()
      .then((loadedConfiguration) => {
        if (active) setConfiguration(loadedConfiguration);
      })
      .catch((error: unknown) => {
        console.error("[Ads] Could not load ad configuration:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return configuration;
}
