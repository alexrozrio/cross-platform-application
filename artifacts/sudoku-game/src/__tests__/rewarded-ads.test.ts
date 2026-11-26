// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

const capacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => true),
  getPlatform: vi.fn(() => "android"),
  showForLoginReward: vi.fn(async () => ({ earned: true })),
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
  registerPlugin: () => ({ showForLoginReward: capacitor.showForLoginReward }),
}));

vi.mock("../lib/ad-configuration", () => ({
  getAdsConfiguration: adsConfiguration.getAdsConfiguration,
}));

import { showAdToDoubleLoginReward } from "../lib/rewarded-ads";

afterEach(() => {
  vi.unstubAllGlobals();
  capacitor.isNativePlatform.mockReturnValue(true);
  capacitor.getPlatform.mockReturnValue("android");
  capacitor.showForLoginReward.mockReset();
  capacitor.showForLoginReward.mockResolvedValue({ earned: true });
  adsConfiguration.getAdsConfiguration.mockResolvedValue({
    banner: true,
    interstitial: true,
    rewarded: true,
    rewardedInterstitial: true,
    native: true,
    appOpen: false,
  });
});

describe("showAdToDoubleLoginReward", () => {
  it("waits for the server to confirm the doubled reward", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ doubled: true, gemsAwarded: 3, totalGems: 12 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(showAdToDoubleLoginReward(17, "2025-01-03")).resolves.toEqual({
      status: "confirmed",
      gemsAwarded: 3,
      totalGems: 12,
    });
    expect(capacitor.showForLoginReward).toHaveBeenCalledWith({
      profileId: "17",
      rewardDate: "2025-01-03",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("does not query the server when the ad was not completed", async () => {
    capacitor.showForLoginReward.mockResolvedValue({ earned: false });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(showAdToDoubleLoginReward(17, "2025-01-03")).resolves.toEqual({
      status: "not-earned",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
