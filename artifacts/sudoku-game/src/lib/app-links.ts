export const PUBLIC_SITE_ORIGIN = "https://playbraingames.online";

export function challengeInviteUrl(token: string, isNative: boolean): string {
  const origin = isNative ? PUBLIC_SITE_ORIGIN : window.location.origin;
  return `${origin}/invite/${encodeURIComponent(token)}`;
}

export function invitePathFromAppUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.origin !== PUBLIC_SITE_ORIGIN) return null;
    if (!/^\/invite\/[^/]+\/?$/.test(url.pathname)) return null;
    return `${url.pathname.replace(/\/$/, "")}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
