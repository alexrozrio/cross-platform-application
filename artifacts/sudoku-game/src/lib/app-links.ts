export const PUBLIC_SITE_ORIGIN = "https://playbraingames.online";
export const NATIVE_APP_SCHEME = "online.playbraingames.app";
const NATIVE_AUTH_CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type NativeAuthCallback =
  | { code: string; error: null }
  | { code: null; error: "cancelled" | "failed" };

export function challengeInviteUrl(token: string, isNative: boolean): string {
  const origin = isNative ? PUBLIC_SITE_ORIGIN : window.location.origin;
  return `${origin}/invite/${encodeURIComponent(token)}`;
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
