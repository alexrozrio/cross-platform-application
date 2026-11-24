// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

const capacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => false),
}));

vi.mock("@capacitor/core", () => ({ Capacitor: capacitor }));

import { getConfiguredApiBaseUrl } from "../lib/api-base-url";

afterEach(() => {
  vi.unstubAllEnvs();
  capacitor.isNativePlatform.mockReturnValue(false);
});

describe("configured API base URL", () => {
  it("uses the local API for production builds opened on localhost", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_BASE_URL_LOCAL", "");
    vi.stubEnv("VITE_API_BASE_URL", "https://cross-platform-application.onrender.com");

    expect(getConfiguredApiBaseUrl()).toBe("http://localhost:8080");
  });

  it("keeps an explicitly configured API URL for local production builds", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_BASE_URL_LOCAL", "https://api.example.test/");

    expect(getConfiguredApiBaseUrl()).toBe("https://api.example.test");
  });

  it("keeps the deployed API default for native builds on localhost", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_BASE_URL_LOCAL", "");
    vi.stubEnv("VITE_API_BASE_URL", "");
    capacitor.isNativePlatform.mockReturnValue(true);

    expect(getConfiguredApiBaseUrl()).toBe(
      "https://cross-platform-application.onrender.com",
    );
  });
});
