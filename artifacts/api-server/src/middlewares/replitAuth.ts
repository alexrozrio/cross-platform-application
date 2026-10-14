import { createHash, randomBytes } from "node:crypto";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db, profilesTable, sessions, users } from "@workspace/db";
import { and, eq, gt, sql } from "drizzle-orm";
import {
  getAllowedAuthReturnOrigin,
  getSafeAuthReturnUrl,
} from "../lib/origin-policy";

// Secure cookies when running on Replit or in production
const isSecure =
  !!process.env.REPLIT_DEV_DOMAIN || process.env.NODE_ENV === "production";
const NATIVE_AUTH_SCHEME = "online.playbraingames.app";
const NATIVE_AUTH_TTL_MS = 10 * 60 * 1000;
const NATIVE_AUTH_HANDOFF_TTL_MS = 5 * 60 * 1000;
const PKCE_CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const PKCE_VERIFIER_PATTERN = /^[A-Za-z0-9._~-]{43,128}$/;

interface NativeAuthState {
  codeChallenge: string;
  createdAt: number;
}

interface AuthenticatedUser {
  userId: string;
  profileId: number;
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
}

function isNativeAuthState(value: unknown): value is NativeAuthState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<NativeAuthState>;
  return (
    typeof state.codeChallenge === "string" &&
    PKCE_CHALLENGE_PATTERN.test(state.codeChallenge) &&
    typeof state.createdAt === "number" &&
    Date.now() - state.createdAt <= NATIVE_AUTH_TTL_MS &&
    Date.now() >= state.createdAt
  );
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<AuthenticatedUser>;
  return (
    typeof user.userId === "string" &&
    typeof user.profileId === "number" &&
    typeof user.email === "string" &&
    typeof user.firstName === "string" &&
    typeof user.lastName === "string" &&
    typeof user.photo === "string"
  );
}

async function createNativeAuthHandoff(
  user: AuthenticatedUser,
  codeChallenge: string,
): Promise<string> {
  const expire = new Date(Date.now() + NATIVE_AUTH_HANDOFF_TTL_MS);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = randomBytes(32).toString("base64url");
    const inserted = await db
      .insert(sessions)
      .values({
        sid: code,
        expire,
        sess: {
          cookie: {
            originalMaxAge: NATIVE_AUTH_HANDOFF_TTL_MS,
            expires: expire.toISOString(),
            httpOnly: true,
            secure: isSecure,
            path: "/",
          },
          nativeAuthHandoff: { codeChallenge, user },
        },
      })
      .onConflictDoNothing()
      .returning({ sid: sessions.sid });

    if (inserted.length > 0) return code;
  }
  throw new Error("Could not create a native sign-in handoff.");
}

async function consumeNativeAuthHandoff(
  code: string,
  codeChallenge: string,
): Promise<AuthenticatedUser | null> {
  const [row] = await db
    .delete(sessions)
    .where(
      and(
        eq(sessions.sid, code),
        gt(sessions.expire, new Date()),
        sql`${sessions.sess}->'nativeAuthHandoff'->>'codeChallenge' = ${codeChallenge}`,
      ),
    )
    .returning({ sess: sessions.sess });

  if (!row) return null;
  const sess = row.sess as
    | { nativeAuthHandoff?: { user?: unknown } }
    | null;
  const user = sess?.nativeAuthHandoff?.user;
  return isAuthenticatedUser(user) ? user : null;
}

function pkceChallengeForVerifier(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

// ─── Session ─────────────────────────────────────────────────────────────────

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isSecure,
      // SameSite=None is required for cross-origin requests (e.g. frontend on
      // localhost:19093 calling API on onrender.com). It MUST pair with Secure.
      // Locally over plain HTTP we fall back to Lax (same-site is fine there).
      sameSite: isSecure ? "none" : "lax",
      maxAge: sessionTtl,
    },
  });
}

// ─── User helpers ─────────────────────────────────────────────────────────────

async function upsertGoogleUser(
  googleId: string,
  email: string,
  firstName: string,
  lastName: string,
  photo: string,
): Promise<string> {
  const userId = `google_${googleId}`;
  await db
    .insert(users)
    .values({ id: userId, email, firstName, lastName, profileImageUrl: photo })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        firstName,
        lastName,
        profileImageUrl: photo,
        updatedAt: new Date(),
      },
    });
  return userId;
}

async function syncGoogleProfile(
  userId: string,
  displayName: string,
  photo: string,
) {
  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.replitUserId, userId));

  if (existing) return existing;

  const [profile] = await db
    .insert(profilesTable)
    .values({ username: displayName, avatar: photo || null, replitUserId: userId })
    .returning();

  return profile;
}

// ─── Callback URL ─────────────────────────────────────────────────────────────
// Priority: explicit env var → Replit dev domain → local default

function googleCallbackUrl(): string {
  if (process.env.GOOGLE_CALLBACK_URL) return process.env.GOOGLE_CALLBACK_URL;
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}/api/callback/google`;
  }
  // Locally the API should run on 8080 to match Google Cloud Console registration.
  // Override with GOOGLE_CALLBACK_URL in .env if you use a different port.
  return "http://localhost:8080/api/callback/google";
}

function frontendUrl(): string {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "http://localhost:19093";
}

// ─── Dev auto-login ───────────────────────────────────────────────────────────
// When running locally (NODE_ENV=development, no REPL_ID) this middleware
// signs the request in automatically so you can develop without going through
// Google OAuth every time.  It is never active on Replit or in production.

async function getOrCreateDevUser(): Promise<{
  userId: string;
  profileId: number;
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
}> {
  const rawId = process.env.DEV_USER_ID ?? "dev_local_user";
  const userId = rawId.startsWith("google_") ? rawId : `google_${rawId}`;
  const email = process.env.DEV_USER_EMAIL ?? "dev@localhost";
  const firstName = process.env.DEV_USER_NAME ?? "Dev";
  const lastName = "User";
  const photo = "";

  await db
    .insert(users)
    .values({ id: userId, email, firstName, lastName, profileImageUrl: photo })
    .onConflictDoNothing();

  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.replitUserId, userId));

  const profile =
    existing ??
    (
      await db
        .insert(profilesTable)
        .values({ username: firstName, avatar: null, replitUserId: userId })
        .returning()
    )[0];

  return { userId, profileId: profile.id, email, firstName, lastName, photo };
}

// Dev auto-login is only useful when there are no Google credentials.
// If GOOGLE_CLIENT_ID is set the user can sign in through the real OAuth flow.
const isDevAutoLogin =
  process.env.NODE_ENV === "development" &&
  !process.env.REPL_ID &&
  !process.env.GOOGLE_CLIENT_ID;

// ─── setupAuth ────────────────────────────────────────────────────────────────

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Dev auto-login: runs after session is restored; skips if already authed
  if (isDevAutoLogin) {
    app.use((req, _res, next) => {
      if (req.isAuthenticated()) return next();
      getOrCreateDevUser()
        .then((devUser) => req.login(devUser, (err) => (err ? next(err) : next())))
        .catch(next);
    });
  }

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  app.post("/api/native/logout", (req: any, res, next) => {
    req.logout((logoutError: Error | null) => {
      if (logoutError) return next(logoutError);
      req.session.destroy((destroyError: Error | null) => {
        if (destroyError) return next(destroyError);
        res.clearCookie("connect.sid", {
          path: "/",
          httpOnly: true,
          secure: isSecure,
          sameSite: isSecure ? "none" : "lax",
        });
        res.json({ ok: true });
      });
    });
  });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Guest-only mode — sign-in routes return informative errors
    app.get("/api/login", (_req, res) => {
      res.status(503).json({
        message:
          "Sign in unavailable. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google sign-in.",
      });
    });
    app.get("/api/native/login", (_req, res) => {
      res.status(503).json({
        message:
          "Sign in unavailable. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google sign-in.",
      });
    });
    app.post("/api/native-auth/exchange", (_req, res) => {
      res.status(503).json({
        message: "Native sign-in is unavailable until Google sign-in is configured.",
      });
    });
    app.get("/api/callback/google", (_req, res) => res.redirect("/"));
    app.get("/api/logout", (req, res) => {
      req.logout(() => res.redirect("/"));
    });
    app.get("/api/auth/user", (_req, res) =>
      res.status(401).json({ message: "Unauthorized" }),
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: googleCallbackUrl(),
        state: true,
        pkce: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value ?? "";
          const firstName =
            profile.name?.givenName ?? profile.displayName ?? "Player";
          const lastName = profile.name?.familyName ?? "";
          const photo = profile.photos?.[0]?.value ?? "";
          const userId = await upsertGoogleUser(
            profile.id,
            email,
            firstName,
            lastName,
            photo,
          );
          const displayName =
            [firstName, lastName].filter(Boolean).join(" ") ||
            email.split("@")[0] ||
            "Player";
          const dbProfile = await syncGoogleProfile(userId, displayName, photo);
          done(null, {
            userId,
            profileId: dbProfile.id,
            email,
            firstName,
            lastName,
            photo,
          });
        } catch (err) {
          done(err as Error);
        }
      },
    ),
  );

  const defaultRedirectTo = frontendUrl();
  const beginGoogleAuth = (req: any, res: any, next: any) =>
    passport.authenticate("google", {
      scope: ["openid", "email", "profile"],
    })(req, res, next);

  // Preserve the browser destination in the server session. Passport owns the
  // OAuth state parameter and PKCE verifier so both are validated on callback.
  app.get("/api/login", (req: any, res, next) => {
    const from = req.query.from as string | undefined;
    req.session.authReturnOrigin = getAllowedAuthReturnOrigin(from);
    delete req.session.nativeAuth;
    beginGoogleAuth(req, res, next);
  });

  app.get("/api/native/login", (req: any, res, next) => {
    const codeChallenge = req.query.code_challenge;
    if (
      typeof codeChallenge !== "string" ||
      !PKCE_CHALLENGE_PATTERN.test(codeChallenge)
    ) {
      res.status(400).json({ message: "Invalid native sign-in request." });
      return;
    }

    req.session.nativeAuth = { codeChallenge, createdAt: Date.now() };
    delete req.session.authReturnOrigin;
    return beginGoogleAuth(req, res, next);
  });

  app.get("/api/callback/google", (req: any, res, next) => {
    passport.authenticate("google", (authError: Error | null, user: any) => {
      const nativeState = isNativeAuthState(req.session?.nativeAuth)
        ? req.session.nativeAuth
        : null;
      const redirectToWeb =
        getAllowedAuthReturnOrigin(req.session?.authReturnOrigin) ??
        defaultRedirectTo;
      const redirectToNative = (result: "cancelled" | "failed") =>
        `${NATIVE_AUTH_SCHEME}://auth/google?error=${result}`;
      const clearPendingFlow = () => {
        delete req.session.nativeAuth;
        delete req.session.authReturnOrigin;
      };
      const saveAndRedirect = (url: string) => {
        req.session.save((saveError: Error | null) => {
          if (saveError) return next(saveError);
          res.redirect(url);
        });
      };

      if (authError || !user) {
        if (authError) {
          console.warn("Google OAuth did not complete:", authError.message);
        }
        const failureUrl = nativeState
          ? redirectToNative("failed")
          : redirectToWeb;
        clearPendingFlow();
        return saveAndRedirect(failureUrl);
      }

      req.logIn(user, (loginError: Error | null) => {
        if (loginError) return next(loginError);

        if (nativeState) {
          void createNativeAuthHandoff(user, nativeState.codeChallenge)
            .then((code) => {
              clearPendingFlow();
              saveAndRedirect(
                `${NATIVE_AUTH_SCHEME}://auth/google?code=${encodeURIComponent(code)}`,
              );
            })
            .catch((handoffError) => {
              console.error("Could not create native OAuth handoff:", handoffError);
              clearPendingFlow();
              saveAndRedirect(redirectToNative("failed"));
            });
          return;
        }

        clearPendingFlow();
        saveAndRedirect(redirectToWeb);
      });
    })(req, res, next);
  });

  app.post("/api/native-auth/exchange", (req: any, res, next) => {
    const code = req.body?.code;
    const verifier = req.body?.verifier;
    if (
      typeof code !== "string" ||
      !PKCE_CHALLENGE_PATTERN.test(code) ||
      typeof verifier !== "string" ||
      !PKCE_VERIFIER_PATTERN.test(verifier)
    ) {
      res.status(400).json({ message: "Invalid native sign-in code." });
      return;
    }

    void consumeNativeAuthHandoff(code, pkceChallengeForVerifier(verifier))
      .then((user) => {
        if (!user) {
          res
            .status(401)
            .json({ message: "This sign-in expired or could not be verified." });
          return;
        }
        req.logIn(user, (loginError: Error | null) => {
          if (loginError) return next(loginError);
          req.session.save((saveError: Error | null) => {
            if (saveError) return next(saveError);
            res.json({ ok: true });
          });
        });
      })
      .catch(next);
  });

  app.get("/api/logout", (req: any, res) => {
    const from = req.query.from as string | undefined;
    const redirectTo = getSafeAuthReturnUrl(
      from ? Buffer.from(from).toString("base64url") : undefined,
      defaultRedirectTo,
    );
    req.logout(() => {
      req.session.destroy(() => res.redirect(redirectTo));
    });
  });

  app.get("/api/auth/user", (req: any, res) => {
    if (!req.isAuthenticated() || !req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return db.select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .then(([user]) => res.json(user ?? null))
      .catch(() => res.status(500).json({ message: "Failed to fetch user" }));
  });
}

// ─── isAuthenticated ──────────────────────────────────────────────────────────

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};
