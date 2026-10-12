import { describe, expect, it } from "vitest";
import {
  createOriginPolicy,
  getAllowedAuthReturnOrigin,
  getSafeAuthReturnUrl,
} from "./origin-policy";

describe("origin policy", () => {
  it("allows the production website and Capacitor Android/iOS origins", () => {
    const policy = createOriginPolicy({ NODE_ENV: "production" });

    expect(policy.corsOrigins.has("https://playbraingames.online")).toBe(true);
    expect(policy.corsOrigins.has("https://localhost")).toBe(true);
    expect(policy.corsOrigins.has("capacitor://localhost")).toBe(true);
  });

  it("does not reflect arbitrary origins or allow local dev origins in production", () => {
    const policy = createOriginPolicy({ NODE_ENV: "production" });

    expect(policy.corsOrigins.has("https://attacker.example")).toBe(false);
    expect(policy.corsOrigins.has("http://localhost:19093")).toBe(false);
  });

  it("adds explicitly configured origins and exact Replit dev hosts", () => {
    const policy = createOriginPolicy({
      NODE_ENV: "production",
      CORS_ALLOWED_ORIGINS: "https://staging.playbraingames.online",
      REPLIT_DEV_DOMAIN: "sudoku-example.replit.dev",
      REPLIT_DOMAINS: "games-example.replit.app",
    });

    expect(
      policy.corsOrigins.has("https://staging.playbraingames.online"),
    ).toBe(true);
    expect(policy.corsOrigins.has("https://sudoku-example.replit.dev")).toBe(
      true,
    );
    expect(policy.corsOrigins.has("https://games-example.replit.app")).toBe(
      true,
    );
  });

  it("rejects wildcard, path, and non-web origins in the explicit allowlist", () => {
    for (const value of [
      "*",
      "https://example.com/path",
      "capacitor://localhost",
    ]) {
      expect(() =>
        createOriginPolicy({
          NODE_ENV: "production",
          CORS_ALLOWED_ORIGINS: value,
        }),
      ).toThrow(/exact HTTP\(S\) origin/);
    }
  });
});

describe("OAuth return origins", () => {
  const allowed = new Set([
    "https://playbraingames.online",
    "http://localhost:19093",
  ]);

  it("accepts only an exact configured HTTP(S) origin", () => {
    expect(
      getAllowedAuthReturnOrigin(
        "https://playbraingames.online",
        allowed,
      ),
    ).toBe("https://playbraingames.online");
    expect(
      getAllowedAuthReturnOrigin(
        "https://playbraingames.online/path",
        allowed,
      ),
    ).toBeNull();
    expect(
      getAllowedAuthReturnOrigin("https://attacker.example", allowed),
    ).toBeNull();
    expect(
      getAllowedAuthReturnOrigin("capacitor://localhost", allowed),
    ).toBeNull();
  });

  it("falls back rather than redirecting to an unapproved state origin", () => {
    const fallback = "https://playbraingames.online";
    const invalidState = Buffer.from(
      "https://attacker.example",
    ).toString("base64url");

    expect(getSafeAuthReturnUrl(invalidState, fallback, allowed)).toBe(
      fallback,
    );
  });
});
