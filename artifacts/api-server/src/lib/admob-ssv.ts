import { createPublicKey, verify, type KeyObject } from "node:crypto";

const ADMOB_VERIFIER_KEYS_URL =
  "https://www.gstatic.com/admob/reward/verifier-keys.json";
const KEY_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface AdMobVerifierKeysResponse {
  keys: Array<{ keyId: number; base64: string }>;
}

let cachedKeys: Map<string, KeyObject> | undefined;
let cachedKeysAt = 0;

async function loadVerifierKeys(
  forceRefresh = false,
): Promise<Map<string, KeyObject>> {
  if (
    !forceRefresh &&
    cachedKeys &&
    Date.now() - cachedKeysAt < KEY_CACHE_MAX_AGE_MS
  ) {
    return cachedKeys;
  }

  const response = await fetch(ADMOB_VERIFIER_KEYS_URL, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(
      `AdMob verifier keys request failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as AdMobVerifierKeysResponse;
  if (!Array.isArray(data.keys) || data.keys.length === 0) {
    throw new Error("AdMob verifier keys response was empty or malformed");
  }

  const keys = new Map<string, KeyObject>();
  for (const entry of data.keys) {
    if (
      !Number.isSafeInteger(entry.keyId) ||
      typeof entry.base64 !== "string"
    ) {
      throw new Error("AdMob verifier keys response contained an invalid key");
    }
    keys.set(
      String(entry.keyId),
      createPublicKey({
        key: Buffer.from(entry.base64, "base64"),
        format: "der",
        type: "spki",
      }),
    );
  }

  cachedKeys = keys;
  cachedKeysAt = Date.now();
  return keys;
}

function oneParameter(params: URLSearchParams, name: string): string {
  const values = params.getAll(name);
  if (values.length !== 1 || values[0] === "") {
    throw new Error(
      `AdMob SSV callback must contain exactly one ${name} parameter`,
    );
  }
  return values[0];
}

function decodeSignature(value: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("AdMob SSV signature is not valid base64url");
  }
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(
    base64 + "=".repeat((4 - (base64.length % 4)) % 4),
    "base64",
  );
}

export async function verifyAdMobSsvQuery(
  rawQuery: string,
  trustedKeys?: ReadonlyMap<string, KeyObject>,
): Promise<URLSearchParams> {
  const signatureMarker = rawQuery.lastIndexOf("&signature=");
  if (signatureMarker < 0) {
    throw new Error("AdMob SSV callback is missing its signature");
  }

  const signedContent = rawQuery.slice(0, signatureMarker);
  const signatureAndKeyId = rawQuery.slice(signatureMarker + 1);
  const keyIdMarker = signatureAndKeyId.indexOf("&key_id=");
  if (
    !signedContent ||
    keyIdMarker < 0 ||
    signatureAndKeyId.indexOf("&", keyIdMarker + 1) >= 0
  ) {
    throw new Error("AdMob SSV signature parameters are malformed");
  }

  const params = new URLSearchParams(rawQuery);
  const signature = decodeSignature(oneParameter(params, "signature"));
  const keyId = oneParameter(params, "key_id");
  if (!/^\d+$/.test(keyId)) {
    throw new Error("AdMob SSV key_id is invalid");
  }

  let keys = trustedKeys ?? (await loadVerifierKeys());
  let publicKey = keys.get(keyId);
  if (!publicKey && !trustedKeys) {
    keys = await loadVerifierKeys(true);
    publicKey = keys.get(keyId);
  }
  if (!publicKey) {
    throw new Error(`No trusted AdMob verifier key found for key_id ${keyId}`);
  }

  const isValid = verify(
    "sha256",
    Buffer.from(signedContent, "utf8"),
    { key: publicKey, dsaEncoding: "der" },
    signature,
  );
  if (!isValid) {
    throw new Error("AdMob SSV signature verification failed");
  }

  return params;
}
