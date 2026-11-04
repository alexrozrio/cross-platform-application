import { Capacitor } from "@capacitor/core";

export const PUBLIC_SITE_ORIGIN = "https://playbraingames.online";
export const NATIVE_APP_SCHEME = "online.playbraingames.app";
const NATIVE_AUTH_CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const APP_LINK_PATHS = [
  /^\/$/,
  /^\/open$/,
  /^\/invite\/[^/]+$/,
  /^\/sudoku(?:\/[^/]+){0,2}$/,
  /^\/memory(?:\/[^/]+)?$/,
  /^\/game\/[^/]+$/,
  /^\/profile$/,
  /^\/players?\/[^/]+$/,
  /^\/badges\/[^/]+$/,
  /^\/daily-challenge$/,
  /^\/leaderboard(?:\/(?:sudoku|memory|jigsaw))?$/,
  /^\/challenges$/,
];

function isAppLinkPathname(pathname: string): boolean {
  return APP_LINK_PATHS.some((pattern) => pattern.test(pathname));
}

export function sanitizeAppLinkPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep the raw value when it is not percent-encoded.
  }
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, PUBLIC_SITE_ORIGIN);
    if (url.origin !== PUBLIC_SITE_ORIGIN) return null;
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    if (!isAppLinkPathname(pathname)) return null;
    return `${pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function nativeSchemeUrlForPath(path: string): string {
  const safe = sanitizeAppLinkPath(path) ?? "/challenges";
  const web = new URL(safe, PUBLIC_SITE_ORIGIN);
  const parts = (web.pathname.replace(/\/+$/, "") || "/").split("/").filter(Boolean);
  const native = new URL(`${NATIVE_APP_SCHEME}://x`);
  native.hostname = parts[0] ?? "";
  native.pathname = parts.length > 1 ? `/${parts.slice(1).join("/")}` : "";
  native.search = web.search;
  native.hash = web.hash;
  return native.toString();
}

export function androidIntentUrlForPath(path: string): string {
  const safe = sanitizeAppLinkPath(path) ?? "/challenges";
  const native = new URL(nativeSchemeUrlForPath(safe));
  const hostAndPath = `${native.host}${native.pathname === "/" ? "" : native.pathname}${native.search}`;
  const fallback = `${PUBLIC_SITE_ORIGIN}${safe}`;
  return `intent://${hostAndPath}#Intent;scheme=${NATIVE_APP_SCHEME};package=${NATIVE_APP_SCHEME};S.browser_fallback_url=${encodeURIComponent(fallback)};end`;
}

export function emailAppOpenUrl(path: string): string {
  const safe = sanitizeAppLinkPath(path) ?? "/challenges";
  return `${PUBLIC_SITE_ORIGIN}/open?to=${encodeURIComponent(safe)}`;
}

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
      if (!isAppLinkPathname(pathname)) return null;
      return `${pathname}${url.search}${url.hash}`;
    }

    if (url.protocol === `${NATIVE_APP_SCHEME}:`) {
      if (url.hostname === "auth") return null;
      const pathname =
        `/${url.hostname}${url.pathname === "/" ? "" : url.pathname}`.replace(/\/+$/, "") ||
        "/";
      if (!isAppLinkPathname(pathname)) return null;
      return `${pathname}${url.search}${url.hash}`;
    }

    return null;
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
