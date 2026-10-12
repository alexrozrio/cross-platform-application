const PRODUCTION_WEB_ORIGINS = ["https://playbraingames.online"];
const CAPACITOR_WEBVIEW_ORIGINS = [
  "https://localhost",
  "capacitor://localhost",
];
const LOCAL_DEVELOPMENT_ORIGINS = [
  "http://localhost:19093",
  "http://127.0.0.1:19093",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export interface OriginPolicyEnvironment {
  CORS_ALLOWED_ORIGINS?: string;
  FRONTEND_URL?: string;
  NODE_ENV?: string;
  REPLIT_DEV_DOMAIN?: string;
  REPLIT_DOMAINS?: string;
}

export interface OriginPolicy {
  corsOrigins: Set<string>;
  authReturnOrigins: Set<string>;
}

function normalizeWebOrigin(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function normalizeFrontendUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function originFromConfiguredHost(value: string): string | null {
  const hostOrUrl = value.trim();
  if (!hostOrUrl) return null;
  const candidate = /^https?:\/\//i.test(hostOrUrl)
    ? hostOrUrl
    : `https://${hostOrUrl}`;
  return normalizeWebOrigin(candidate);
}

export function createOriginPolicy(
  environment: OriginPolicyEnvironment,
): OriginPolicy {
  const authReturnOrigins = new Set(PRODUCTION_WEB_ORIGINS);

  for (const value of (environment.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)) {
    const origin = normalizeWebOrigin(value);
    if (!origin) {
      throw new Error(
        `Invalid CORS_ALLOWED_ORIGINS entry "${value}". Use an exact HTTP(S) origin without a path or wildcard.`,
      );
    }
    authReturnOrigins.add(origin);
  }

  if (environment.FRONTEND_URL) {
    const origin = normalizeFrontendUrl(environment.FRONTEND_URL);
    if (origin) authReturnOrigins.add(origin);
  }

  const replitHosts = [
    environment.REPLIT_DEV_DOMAIN,
    ...(environment.REPLIT_DOMAINS ?? "").split(","),
  ];
  for (const host of replitHosts) {
    const origin = host ? originFromConfiguredHost(host) : null;
    if (origin) authReturnOrigins.add(origin);
  }

  if (environment.NODE_ENV !== "production") {
    for (const origin of LOCAL_DEVELOPMENT_ORIGINS) {
      authReturnOrigins.add(origin);
    }
  }

  const corsOrigins = new Set([
    ...authReturnOrigins,
    ...CAPACITOR_WEBVIEW_ORIGINS,
  ]);

  return { corsOrigins, authReturnOrigins };
}

export const originPolicy = createOriginPolicy(process.env);

export function getAllowedAuthReturnOrigin(
  value: string | undefined,
  allowedOrigins = originPolicy.authReturnOrigins,
): string | null {
  if (!value) return null;
  const origin = normalizeWebOrigin(value);
  return origin && allowedOrigins.has(origin) ? origin : null;
}

export function getSafeAuthReturnUrl(
  encodedState: string | undefined,
  fallback: string,
  allowedOrigins = originPolicy.authReturnOrigins,
): string {
  if (!encodedState) return fallback;
  try {
    const decoded = Buffer.from(encodedState, "base64url").toString("utf8");
    return getAllowedAuthReturnOrigin(decoded, allowedOrigins) ?? fallback;
  } catch {
    return fallback;
  }
}
