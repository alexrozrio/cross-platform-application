import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { apiUrl } from "@/lib/api-base-url";
import { NATIVE_APP_SCHEME } from "@/lib/app-links";

const PENDING_NATIVE_AUTH_KEY = "pbg-native-auth-pkce";
const NATIVE_AUTH_TTL_MS = 10 * 60 * 1000;

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const random = crypto.getRandomValues(new Uint8Array(32));
  const verifier = encodeBase64Url(random);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return {
    verifier,
    challenge: encodeBase64Url(new Uint8Array(digest)),
  };
}

export async function startGoogleSignIn(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    const from = encodeURIComponent(window.location.origin);
    window.location.href = apiUrl(`/api/login?from=${from}`);
    return;
  }

  const { verifier, challenge } = await createPkcePair();
  localStorage.setItem(
    PENDING_NATIVE_AUTH_KEY,
    JSON.stringify({ verifier, createdAt: Date.now() }),
  );

  const url = new URL(apiUrl("/api/native/login"), window.location.href);
  url.searchParams.set("code_challenge", challenge);

  try {
    await Browser.open({ url: url.toString() });
  } catch (error) {
    localStorage.removeItem(PENDING_NATIVE_AUTH_KEY);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    const from = encodeURIComponent(window.location.origin);
    window.location.href = apiUrl(`/api/logout?from=${from}`);
    return;
  }

  const response = await fetch(apiUrl("/api/native/logout"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) {
    throw new Error("Could not sign out. Please try again.");
  }
  window.location.reload();
}

export async function completeNativeGoogleSignIn(code: string): Promise<void> {
  const pendingRaw = localStorage.getItem(PENDING_NATIVE_AUTH_KEY);
  if (!pendingRaw) {
    throw new Error("This sign-in expired. Please try again.");
  }

  let pending: { verifier?: unknown; createdAt?: unknown };
  try {
    pending = JSON.parse(pendingRaw) as typeof pending;
  } catch {
    localStorage.removeItem(PENDING_NATIVE_AUTH_KEY);
    throw new Error("This sign-in could not be verified. Please try again.");
  }

  if (
    typeof pending.verifier !== "string" ||
    typeof pending.createdAt !== "number" ||
    Date.now() - pending.createdAt > NATIVE_AUTH_TTL_MS ||
    Date.now() < pending.createdAt
  ) {
    localStorage.removeItem(PENDING_NATIVE_AUTH_KEY);
    throw new Error("This sign-in expired. Please try again.");
  }

  const response = await fetch(apiUrl("/api/native-auth/exchange"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, verifier: pending.verifier }),
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    localStorage.removeItem(PENDING_NATIVE_AUTH_KEY);
    throw new Error(result?.message ?? "Google sign-in failed. Please try again.");
  }

  localStorage.removeItem(PENDING_NATIVE_AUTH_KEY);
  await Browser.close().catch(() => undefined);
  window.location.reload();
}

export async function cancelNativeGoogleSignIn(): Promise<void> {
  localStorage.removeItem(PENDING_NATIVE_AUTH_KEY);
  await Browser.close().catch(() => undefined);
}

