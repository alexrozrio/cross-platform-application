export type ConsentPreferences = {
  analytics: boolean;
  ads: boolean;
};

export const CONSENT_STORAGE_KEY = "brain-games-consent-v1";
export const CONSENT_CHANGED_EVENT = "brain-games-consent-changed";

const GOOGLE_ANALYTICS_ID = "G-V8KGSQYF43";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __brainGamesGoogleAnalyticsLoaded?: boolean;
  }
}

function ensureGtag() {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
}

export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.ads !== "boolean") {
      return null;
    }

    return {
      analytics: parsed.analytics,
      ads: parsed.ads,
    };
  } catch {
    return null;
  }
}

function clearGoogleAnalyticsCookies() {
  if (typeof document === "undefined") return;

  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  }
}

export function applyGoogleConsent(preferences: ConsentPreferences) {
  if (typeof window === "undefined") return;

  ensureGtag();
  window.gtag?.("consent", "update", {
    analytics_storage: preferences.analytics ? "granted" : "denied",
    ad_storage: preferences.ads ? "granted" : "denied",
    ad_user_data: preferences.ads ? "granted" : "denied",
    ad_personalization: preferences.ads ? "granted" : "denied",
  });
}

export function loadGoogleAnalytics() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__brainGamesGoogleAnalyticsLoaded) return;

  ensureGtag();
  window.gtag?.("js", new Date());
  window.gtag?.("config", GOOGLE_ANALYTICS_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  script.dataset.brainGamesGoogleAnalytics = "true";
  document.head.appendChild(script);
  window.__brainGamesGoogleAnalyticsLoaded = true;
}

export function setConsent(preferences: ConsentPreferences) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  applyGoogleConsent(preferences);

  if (preferences.analytics) {
    loadGoogleAnalytics();
  } else {
    clearGoogleAnalyticsCookies();
  }

  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: preferences }));
}