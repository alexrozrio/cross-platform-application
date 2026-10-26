import { describe, expect, it } from "vitest";
import {
  appPathFromAppUrl,
  appShareUrlForPath,
  invitePathFromAppUrl,
  nativeAuthCallbackFromAppUrl,
  NATIVE_APP_SCHEME,
  PUBLIC_SITE_ORIGIN,
} from "../lib/app-links";

describe("native app links", () => {
  it("routes supported public share URLs into the app", () => {
    expect(
      appPathFromAppUrl(`${PUBLIC_SITE_ORIGIN}/sudoku/9/expert?mode=alpha#board`),
    ).toBe("/sudoku/9/expert?mode=alpha#board");
    expect(
      appPathFromAppUrl(`${PUBLIC_SITE_ORIGIN}/leaderboard/sudoku/`),
    ).toBe("/leaderboard/sudoku");
    expect(
      appPathFromAppUrl(`${PUBLIC_SITE_ORIGIN}/leaderboard/memory/?tab=alltime`),
    ).toBe("/leaderboard/memory?tab=alltime");
    expect(
      appPathFromAppUrl(`${PUBLIC_SITE_ORIGIN}/memory/hard/?start=1`),
    ).toBe("/memory/hard?start=1");
    expect(appPathFromAppUrl(`${PUBLIC_SITE_ORIGIN}/`)).toBe("/");
  });

  it("does not route static files or other domains into the app", () => {
    expect(appPathFromAppUrl(`${PUBLIC_SITE_ORIGIN}/opengraph.jpg`)).toBeNull();
    expect(appPathFromAppUrl("https://playbraingames.online.evil.test/invite/token")).toBeNull();
    expect(appPathFromAppUrl("https://example.com/sudoku/9/easy")).toBeNull();
  });

  it("uses the public website origin for native share links", () => {
    expect(appShareUrlForPath("/memory/easy?start=1", true, "http://localhost"))
      .toBe(`${PUBLIC_SITE_ORIGIN}/memory/easy?start=1`);
  });

  it("preserves the current web origin for browser share links", () => {
    expect(appShareUrlForPath("/invite/abc123", false, "https://preview.example"))
      .toBe("https://preview.example/invite/abc123");
  });

  it("rejects absolute external share paths", () => {
    expect(() => appShareUrlForPath("https://example.com/")).toThrow();
    expect(() => appShareUrlForPath("//example.com/")).toThrow();
  });

  it("accepts public HTTPS invite links", () => {
    expect(
      invitePathFromAppUrl(`${PUBLIC_SITE_ORIGIN}/invite/abc123?source=share`),
    ).toBe("/invite/abc123?source=share");
  });

  it("accepts invite links using the app scheme", () => {
    expect(
      invitePathFromAppUrl(`${NATIVE_APP_SCHEME}://invite/abc123`),
    ).toBe("/invite/abc123");
  });

  it("rejects links outside the app domains", () => {
    expect(invitePathFromAppUrl("https://example.com/invite/abc123")).toBeNull();
    expect(invitePathFromAppUrl(`${NATIVE_APP_SCHEME}://auth/google`)).toBeNull();
  });

  it("parses only well-formed native Google sign-in callbacks", () => {
    const code = "a".repeat(43);
    expect(
      nativeAuthCallbackFromAppUrl(
        `${NATIVE_APP_SCHEME}://auth/google?code=${code}`,
      ),
    ).toEqual({ code, error: null });
    expect(
      nativeAuthCallbackFromAppUrl(
        `${NATIVE_APP_SCHEME}://auth/google?error=cancelled`,
      ),
    ).toEqual({ code: null, error: "cancelled" });
    expect(
      nativeAuthCallbackFromAppUrl(
        "https://example.com/auth/google?code=not-a-code",
      ),
    ).toBeNull();
  });
});
