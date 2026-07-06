// Central place that decides which API server the frontend talks to.
//
// By default (no VITE_API_BASE_URL set) all requests stay relative
// (e.g. "/api/...") and go to whatever origin served the page — in dev
// that's proxied to the local API server by Vite (see vite.config.ts),
// and in production it's the same host the frontend is deployed on.
//
// Set VITE_API_BASE_URL to point the frontend at a different API server
// instead, e.g.:
//   VITE_API_BASE_URL=https://cross-platform-application.onrender.com
//   VITE_API_BASE_URL=http://localhost:8080
//
// This must be set at build/dev-start time (Vite inlines VITE_* env vars),
// so restart the dev server / rebuild after changing it.
export function getConfiguredApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw) return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed === "" ? null : trimmed;
}

/**
 * Prefixes a relative API path (e.g. "/api/foo") with the configured base
 * URL, for the few call sites that use the raw `fetch` API instead of the
 * generated `customFetch` client (which applies the base URL automatically
 * once `setBaseUrl` has been called).
 */
export function apiUrl(path: string): string {
  const base = getConfiguredApiBaseUrl();
  return base ? `${base}${path}` : path;
}
