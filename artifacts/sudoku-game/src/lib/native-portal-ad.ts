import { Capacitor, registerPlugin } from "@capacitor/core";
import { useEffect } from "react";
import { getAdsConfiguration } from "./ad-configuration";

interface NativeAdsPlugin {
  setPortalAdVisible(options: { visible: boolean }): Promise<void>;
}

const nativeAds = registerPlugin<NativeAdsPlugin>("NativeAds");

export function usePortalNativeAd() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return;
    }

    let active = true;
    const setVisible = (visible: boolean) => {
      void nativeAds.setPortalAdVisible({ visible }).catch((error: unknown) => {
        console.error("[Ads] Could not update the portal native ad placement:", error);
      });
    };

    void getAdsConfiguration()
      .then((configuration) => {
        if (active && configuration.native) setVisible(true);
      })
      .catch((error: unknown) => {
        console.error("[Ads] Could not load native ad configuration:", error);
      });

    return () => {
      active = false;
      setVisible(false);
    };
  }, []);
}
