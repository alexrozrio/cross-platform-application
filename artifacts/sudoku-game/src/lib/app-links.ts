import { Capacitor } from "@capacitor/core";

export const PUBLIC_SITE_ORIGIN = "https://playbraingames.online";
export const NATIVE_APP_SCHEME = "online.playbraingames.app";
const NATIVE_AUTH_CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const APP_LINK_PATHS = [
  /^\/$/,
  /^\/invite\/[^/]+$/,
  /^\/sudoku(?:\/[^/]+){0,2}$/,
  /^\/memory(?:\/[^/]+)?$/,
  /^\/game\/[^/]+$/,
  /^\/profile$/,
  /^\/players?\/[^/]+$/,
  /^\/badges\/[^/]+$/,
  /^\/daily-challenge$/,
  /^\/leaderboard$/,
  /^\/challenges$/,
];

export type NativeAuthCallback =
  | { code: string; error: null }
  | { code: null; error: "cancelled" | "failed" };

export function appShareUrlForPath(
  path: string,
  isNative = Capacitor.isNativePlatform(),
  webOrigin?: string,
): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("App share URLs must use an internal absolute path.");
  }

  const origin = isNative
    ? PUBLIC_SITE_ORIGIN
    : webOrigin ?? (typeof window !== "undefined" ? window.location.origin : PUBLIC_SITE_ORIGIN);
  const url = new URL(path, origin);
  if (url.origin !== origin) {
    throw new Error("App share URLs must stay on the selected website origin.");
  }
  return url.toString();
}

export function challengeInviteUrl(token: string, isNative: boolean): string {
  return appShareUrlForPath(`/invite/${encodeURIComponent(token)}`, isNative);
}

export function invitePathFromAppUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.origin === PUBLIC_SITE_ORIGIN && /^\/invite\/[^/]+\/?$/.test(url.pathname)) {
      return `${url.pathname.replace(/\/$/, "")}${url.search}${url.hash}`;
    }

    // Custom-scheme fallback for installed apps when HTTPS App Links /
    // Universal Links are not verified by the OS yet.
    if (
      url.protocol === `${NATIVE_APP_SCHEME}:` &&
      url.hostname === "invite" &&
      /^\/[^/]+\/?$/.test(url.pathname)
    ) {
      return `/invite${url.pathname.replace(/\/$/, "")}${url.search}${url.hash}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function appPathFromAppUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    if (url.protocol === "https:" && url.origin === PUBLIC_SITE_ORIGIN) {
      const pathname = url.pathname.replace(/\/+$/, "") || "/";
      if (!APP_LINK_PATHS.some((pattern) => pattern.test(pathname))) return null;
      return `${pathname}${url.search}${url.hash}`;
    }

    // Preserve the existing custom-scheme fallback for challenge invites.
    return invitePathFromAppUrl(rawUrl);
  } catch {
    return null;
  }
}

export function nativeAuthCallbackFromAppUrl(
  rawUrl: string,
): NativeAuthCallback | null {
  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== `${NATIVE_APP_SCHEME}:` ||
      url.hostname !== "auth" ||
      url.pathname !== "/google"
    ) {
      return null;
    }

    const code = url.searchParams.get("code");
    if (code && NATIVE_AUTH_CODE_PATTERN.test(code)) {
      return { code, error: null };
    }

    const error = url.searchParams.get("error");
    if (error === "cancelled" || error === "failed") {
      return { code: null, error };
    }

    return null;
  } catch {
    return null;
  }
}
