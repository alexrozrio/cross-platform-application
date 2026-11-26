// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const capacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => true),
  getPlatform: vi.fn(() => "android"),
  showForExtraTip: vi.fn(async () => ({ earned: true })),
}));
const adsConfiguration = vi.hoisted(() => ({
  useAdsConfiguration: vi.fn(() => ({
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
  registerPlugin: () => ({ showForExtraTip: capacitor.showForExtraTip }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("../lib/ad-configuration", () => ({
  useAdsConfiguration: adsConfiguration.useAdsConfiguration,
}));

import { useRewardedInterstitialTip } from "../lib/rewarded-interstitial-tips";

afterEach(() => {
  capacitor.isNativePlatform.mockReturnValue(true);
  capacitor.getPlatform.mockReturnValue("android");
  capacitor.showForExtraTip.mockReset();
  capacitor.showForExtraTip.mockResolvedValue({ earned: true });
  adsConfiguration.useAdsConfiguration.mockReturnValue({
    banner: true,
    interstitial: true,
    rewarded: true,
    rewardedInterstitial: true,
    native: true,
    appOpen: false,
  });
});

describe("useRewardedInterstitialTip", () => {
  it("grants the extra tip only after the ad reports an earned reward", async () => {
    const onEarned = vi.fn();
    const { result } = renderHook(() => useRewardedInterstitialTip());

    await act(async () => {
      await result.current.showAdForExtraTip(onEarned);
    });

    expect(capacitor.showForExtraTip).toHaveBeenCalledOnce();
    expect(onEarned).toHaveBeenCalledOnce();
    expect(result.current.isShowingRewardedTip).toBe(false);
  });

  it("does not grant a tip when the ad is unavailable or not completed", async () => {
    capacitor.showForExtraTip.mockResolvedValue({ earned: false });
    const onEarned = vi.fn();
    const { result } = renderHook(() => useRewardedInterstitialTip());

    await act(async () => {
      await result.current.showAdForExtraTip(onEarned);
    });

    expect(onEarned).not.toHaveBeenCalled();
  });

  it("does not offer or request the ad when rewarded interstitials are disabled", async () => {
    adsConfiguration.useAdsConfiguration.mockReturnValue({
      banner: true,
      interstitial: true,
      rewarded: true,
      rewardedInterstitial: false,
      native: true,
      appOpen: false,
    });
    const onEarned = vi.fn();
    const { result } = renderHook(() => useRewardedInterstitialTip());

    await act(async () => {
      await result.current.showAdForExtraTip(onEarned);
    });

    expect(result.current.isEnabled).toBe(false);
    expect(capacitor.showForExtraTip).not.toHaveBeenCalled();
    expect(onEarned).not.toHaveBeenCalled();
  });
});
