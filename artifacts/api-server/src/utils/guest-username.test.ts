import { describe, expect, it } from "vitest";
import { generateGuestUsername } from "./guest-username";

describe("generateGuestUsername", () => {
  it("combines a positive adjective and noun with a five-character suffix", () => {
    const username = generateGuestUsername(() => 0);

    expect(username).toBe("StrongBrainAAAAA");
    expect(username).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z0-9]{5}$/);
    expect(username.length).toBeLessThanOrEqual(30);
  });

  it("selects different name parts and suffix characters from the random source", () => {
    const values = [0.25, 0.75, 0.5, 0.75, 0.25, 0.5, 0.75];
    let index = 0;
    const username = generateGuestUsername(() => values[index++] ?? 0);

    expect(username).toBe("BraveGeniusS1JS1");
  });
});