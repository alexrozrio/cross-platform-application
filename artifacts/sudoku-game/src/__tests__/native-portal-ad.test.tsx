// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const capacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => true),
  getPlatform: vi.fn(() => "android"),
  setPortalAdVisible: vi.fn(async () => undefined),
}));
const adsConfiguration = vi.hoisted(() => ({
  getAdsConfiguration: vi.fn(async () => ({
    banner: true,
    interstitial: true,
    rewarded: true,
    rewardedInterstitial: true,
    native: true,
    appOpen: false,
  })),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: capacitor.isNativePlatform,
    getPlatform: capacitor.getPlatform,
  },
  registerPlugin: () => ({ setPortalAdVisible: capacitor.setPortalAdVisible }),
}));

vi.mock("../lib/ad-configuration", () => ({
  getAdsConfiguration: adsConfiguration.getAdsConfiguration,
}));

import { usePortalNativeAd } from "../lib/native-portal-ad";

afterEach(() => {
  capacitor.isNativePlatform.mockReturnValue(true);
  capacitor.getPlatform.mockReturnValue("android");
  capacitor.setPortalAdVisible.mockReset();
  capacitor.setPortalAdVisible.mockResolvedValue(undefined);
  adsConfiguration.getAdsConfiguration.mockClear();
  adsConfiguration.getAdsConfiguration.mockResolvedValue({
    banner: true,
    interstitial: true,
    rewarded: true,
    rewardedInterstitial: true,
    native: true,
    appOpen: false,
  });
});

describe("usePortalNativeAd", () => {
  it("shows the native placement on portal mount and hides it on unmount", async () => {
    const { unmount } = renderHook(() => usePortalNativeAd());

    await waitFor(() =>
      expect(capacitor.setPortalAdVisible).toHaveBeenCalledWith({ visible: true }),
    );
    unmount();
    expect(capacitor.setPortalAdVisible).toHaveBeenLastCalledWith({ visible: false });
  });

  it("does not control a native placement on web", () => {
    capacitor.isNativePlatform.mockReturnValue(false);
    renderHook(() => usePortalNativeAd());

    expect(capacitor.setPortalAdVisible).not.toHaveBeenCalled();
  });

  it("does not show the placement when native ads are disabled", async () => {
    adsConfiguration.getAdsConfiguration.mockResolvedValue({
      banner: true,
      interstitial: true,
      rewarded: true,
      rewardedInterstitial: true,
      native: false,
      appOpen: false,
    });
    const { unmount } = renderHook(() => usePortalNativeAd());

    await waitFor(() => expect(adsConfiguration.getAdsConfiguration).toHaveBeenCalledOnce());
    expect(capacitor.setPortalAdVisible).not.toHaveBeenCalledWith({ visible: true });
    unmount();
    expect(capacitor.setPortalAdVisible).toHaveBeenLastCalledWith({ visible: false });
  });
});
