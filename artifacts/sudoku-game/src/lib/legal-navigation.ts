const LEGAL_PATHS = ["/about", "/privacy", "/terms"];

export function buildLegalHref(path: string, returnTo: string): string {
  return `${path}?returnTo=${encodeURIComponent(returnTo || "/")}`;
}

export function getLegalReturnPath(search: string): string {
  const returnTo = new URLSearchParams(search).get("returnTo");

  if (
    !returnTo ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//") ||
    returnTo.includes("\\") ||
    LEGAL_PATHS.some((path) => returnTo === path || returnTo.startsWith(`${path}?`))
  ) {
    return "/";
  }

  return returnTo;
}