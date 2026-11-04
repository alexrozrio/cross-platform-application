import { describe, expect, it } from "vitest";
import { buildLegalHref } from "../lib/legal-navigation";

describe("legal navigation URLs", () => {
  it("uses the canonical trailing-slash path and encodes the return destination", () => {
    expect(buildLegalHref("/privacy", "/memory-challenge/")).toBe(
      "/privacy/?returnTo=%2Fmemory-challenge%2F",
    );
  });

  it("does not add a duplicate slash to an already canonical path", () => {
    expect(buildLegalHref("/terms/", "/")).toBe("/terms/?returnTo=%2F");
  });
});