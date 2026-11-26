import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyAdMobSsvQuery } from "../lib/admob-ssv";

describe("verifyAdMobSsvQuery", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const trustedKeys = new Map<string, KeyObject>([["12345", publicKey]]);
  const signedContent =
    "ad_network=123&ad_unit=456&reward_amount=2&reward_item=gems&timestamp=1700000000000&transaction_id=abc123&user_id=12&custom_data=2025-01-03";

  function makeQuery(content = signedContent): string {
    const signature = sign("sha256", Buffer.from(content), privateKey).toString(
      "base64url",
    );
    return `${content}&signature=${signature}&key_id=12345`;
  }

  it("verifies the exact signed callback query and returns its parameters", async () => {
    const params = await verifyAdMobSsvQuery(makeQuery(), trustedKeys);

    expect(params.get("user_id")).toBe("12");
    expect(params.get("custom_data")).toBe("2025-01-03");
  });

  it("rejects a callback whose signed values were changed", async () => {
    await expect(
      verifyAdMobSsvQuery(
        makeQuery().replace("reward_amount=2", "reward_amount=9"),
        trustedKeys,
      ),
    ).rejects.toThrow("signature verification failed");
  });
});
