---
name: OAuth dynamic return URL
description: Pattern for redirecting back to any frontend origin after Google OAuth, without hardcoding FRONTEND_URL per environment.
---

# OAuth dynamic return URL

## The rule
Frontend passes `window.location.origin` as a `?from=` query param on `/api/login` and `/api/logout`. Server encodes it as base64url OAuth state, then decodes it in the callback to redirect back to the right origin.

**Why:** A single API server (e.g. on Render.com) may serve multiple frontends: localhost:19093, Replit dev domain, production URL. Hardcoding `FRONTEND_URL` requires a config change per environment; the state-based approach is zero-config.

**How to apply:** Any time OAuth or external auth is wired up and the frontend/backend run on different origins.

## Frontend side (layout.tsx / profile.tsx)
```ts
const from = encodeURIComponent(window.location.origin);
window.location.href = apiUrl(`/api/login?from=${from}`);
```

## Server side (replitAuth.ts)
```ts
// Login — encode origin as OAuth state
app.get("/api/login", (req, res, next) => {
  const from = req.query.from as string | undefined;
  const state = from ? Buffer.from(from).toString("base64url") : undefined;
  passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
    ...(state ? { state } : {}),
  })(req, res, next);
});

// Callback — decode state, validate, redirect
app.get("/api/callback/google",
  passport.authenticate("google", { failureRedirect: defaultRedirectTo }),
  (req: any, res) => {
    const redirectTo = safeReturnUrl(req.query.state, defaultRedirectTo);
    req.session.save((err) => {
      res.redirect(redirectTo);
    });
  }
);
```

## safeReturnUrl helper
Validates the decoded URL only allows http/https protocols (prevents javascript: injection):
```ts
function safeReturnUrl(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const url = new URL(decoded);
    if (url.protocol === "http:" || url.protocol === "https:") return decoded;
  } catch {}
  return fallback;
}
```

## Cross-origin cookie requirement
When frontend and API are on different origins, session cookie must have `SameSite=None; Secure` or browsers silently block it on fetch requests:
```ts
cookie: {
  secure: isSecure,
  sameSite: isSecure ? "none" : "lax",
}
```
`isSecure = !!process.env.REPLIT_DEV_DOMAIN || process.env.NODE_ENV === "production"`

## Session save race condition
Always call `req.session.save(cb)` before `res.redirect()` after OAuth. Without it, the async DB write races the redirect and `/api/auth/user` returns 401 on the next request.
