export const PUBLIC_SITE_ORIGIN = "https://playbraingames.online";
export const NATIVE_APP_SCHEME = "online.playbraingames.app";

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
