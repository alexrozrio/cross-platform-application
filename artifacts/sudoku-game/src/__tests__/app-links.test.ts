import { describe, expect, it } from "vitest";
import {
  invitePathFromAppUrl,
  nativeAuthCallbackFromAppUrl,
  NATIVE_APP_SCHEME,
  PUBLIC_SITE_ORIGIN,
} from "../lib/app-links";

describe("native app links", () => {
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
