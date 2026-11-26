// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const capacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => true),
  getPlatform: vi.fn(() => "android"),
  showAfterGame: vi.fn(async () => {}),
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
  registerPlugin: () => ({ showAfterGame: capacitor.showAfterGame }),
}));

vi.mock("../lib/ad-configuration", () => ({
  getAdsConfiguration: adsConfiguration.getAdsConfiguration,
}));

import { useInterstitialAfterGame } from "../lib/interstitial-ads";

afterEach(() => {
  capacitor.isNativePlatform.mockReturnValue(true);
  capacitor.getPlatform.mockReturnValue("android");
  capacitor.showAfterGame.mockClear();
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

describe("useInterstitialAfterGame", () => {
  it("requests one ad per transition into a completed game", async () => {
    const { rerender } = renderHook(
      ({ isComplete, isPlaying }) => useInterstitialAfterGame(isComplete, isPlaying),
      { initialProps: { isComplete: false, isPlaying: false } },
    );

    rerender({ isComplete: false, isPlaying: true });
    rerender({ isComplete: true, isPlaying: false });
    rerender({ isComplete: true, isPlaying: false });
    await waitFor(() => expect(capacitor.showAfterGame).toHaveBeenCalledTimes(1));

    rerender({ isComplete: false, isPlaying: false });
    rerender({ isComplete: false, isPlaying: true });
    rerender({ isComplete: true, isPlaying: false });
    await waitFor(() => expect(capacitor.showAfterGame).toHaveBeenCalledTimes(2));
  });

  it("does not show an ad for a result that was already complete at mount", () => {
    renderHook(() => useInterstitialAfterGame(true, false));

    expect(capacitor.showAfterGame).not.toHaveBeenCalled();
  });

  it("only requests ads on Android", async () => {
    const { rerender } = renderHook(
      ({ isComplete, isPlaying }) => useInterstitialAfterGame(isComplete, isPlaying),
      { initialProps: { isComplete: false, isPlaying: false } },
    );
    capacitor.getPlatform.mockReturnValue("ios");

    await act(async () => {
      rerender({ isComplete: false, isPlaying: true });
      rerender({ isComplete: true, isPlaying: false });
    });

    expect(capacitor.showAfterGame).not.toHaveBeenCalled();
  });

  it("does not request the native ad when interstitials are disabled", async () => {
    adsConfiguration.getAdsConfiguration.mockResolvedValue({
      banner: true,
      interstitial: false,
      rewarded: true,
      rewardedInterstitial: true,
      native: true,
      appOpen: false,
    });
    const { rerender } = renderHook(
      ({ isComplete, isPlaying }) => useInterstitialAfterGame(isComplete, isPlaying),
      { initialProps: { isComplete: false, isPlaying: false } },
    );

    rerender({ isComplete: false, isPlaying: true });
    rerender({ isComplete: true, isPlaying: false });
    await waitFor(() => expect(adsConfiguration.getAdsConfiguration).toHaveBeenCalledOnce());

    expect(capacitor.showAfterGame).not.toHaveBeenCalled();
  });
});
