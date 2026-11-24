import { Capacitor } from "@capacitor/core";

const DEPLOYED_API_BASE_URL = "https://cross-platform-application.onrender.com";

// Central place that decides which API server the frontend talks to.
//
// Browser development requests stay relative and use Vite's /api proxy. In
// production, VITE_API_BASE_URL can point at a separate API host.
//
// Set VITE_API_BASE_URL to point the frontend at a different API server
// instead, e.g.:
//   VITE_API_BASE_URL=https://cross-platform-application.onrender.com
//   VITE_API_BASE_URL=http://localhost:8080
//
// This must be set at build/dev-start time (Vite inlines VITE_* env vars),
// so restart the dev server / rebuild after changing it.
export function getConfiguredApiBaseUrl(): string | null {
  const isNative = Capacitor.isNativePlatform();

  // In a browser dev session, keep requests same-origin so Vite can proxy
  // them. This avoids browser CORS and cookie issues when the UI talks to a
  // remotely hosted API. The proxy target is configured in vite.config.ts.
  if (import.meta.env.DEV && !isNative) return null;

  // An explicit local override is useful for pointing a local UI at a chosen
  // API. Native builds call the configured API directly because they have no
  // browser dev-server proxy.
  const localOverride = import.meta.env.VITE_API_BASE_URL_LOCAL;
  if (localOverride) {
    const trimmed = localOverride.trim().replace(/\/+$/, "");
    if (trimmed) return trimmed;
  }

  if (
    !isNative &&
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    // Production/preview builds opened locally do not have Vite's /api proxy.
    return `http://${window.location.hostname}:8080`;
  }

  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) {
    const trimmed = configured.trim().replace(/\/+$/, "");
    if (trimmed) return trimmed;
  }

  // Production builds call the deployed API directly so static hosts
  // (Cloudflare Pages, etc.) without an /api proxy still reach it.
  return DEPLOYED_API_BASE_URL;
}

/**
 * Prefixes a relative API path (e.g. "/api/foo") with the configured base
 * URL, for the few call sites that use the raw `fetch` API instead of the
 * generated `customFetch` client (which applies the base URL automatically
 * once `setBaseUrl` has been called).
 */
export function apiUrl(path: string): string {
  const base = getConfiguredApiBaseUrl();
  if (!base) return path;
  // If base URL already includes /api, don't duplicate it
  if (base.endsWith('/api')) {
    return path.startsWith('/api') ? `${base}${path.slice(4)}` : `${base}${path}`;
  }
  return `${base}${path}`;
}
