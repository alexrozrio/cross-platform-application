import * as client from "openid-client";
import { Strategy as OidcStrategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { db, users } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const isReplitEnv = !!process.env.REPL_ID;

// ─── Replit OIDC (production) ────────────────────────────────────────────────

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!,
    );
  },
  { maxAge: 3600 * 1000 },
);

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
      secure: isReplitEnv,
      maxAge: sessionTtl,
    },
  });
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await db
    .insert(users)
    .values({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        profileImageUrl: claims["profile_image_url"],
        updatedAt: new Date(),
      },
    });
}

// ─── Google OAuth helpers (local dev) ────────────────────────────────────────

async function upsertGoogleUser(googleId: string, email: string, firstName: string, lastName: string, photo: string) {
  const userId = `google_${googleId}`;
  await db
    .insert(users)
    .values({ id: userId, email, firstName, lastName, profileImageUrl: photo })
    .onConflictDoUpdate({
      target: users.id,
      set: { email, firstName, lastName, profileImageUrl: photo, updatedAt: new Date() },
    });
  return userId;
}

async function syncGoogleProfile(userId: string, displayName: string, photo: string) {
  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.replitUserId, userId));

  if (existing) {
    return existing;
  }

  const [profile] = await db
    .insert(profilesTable)
    .values({
      username: displayName,
      avatar: photo || null,
      replitUserId: userId,
    })
    .returning();

  return profile;
}

// ─── setupAuth ────────────────────────────────────────────────────────────────

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // ── Local dev: Google OAuth ───────────────────────────────────────────────
  if (!isReplitEnv) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      // No Google credentials — fall back to guest-only mode
      app.get("/api/login", (_req, res) => {
        res.status(503).json({
          message: "Sign in unavailable locally. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in dev.bat to enable Google sign-in.",
        });
      });
      app.get("/api/callback/google", (_req, res) => res.redirect("/"));
      app.get("/api/logout", (req, res) => { req.logout(() => res.redirect("/")); });
      app.get("/api/auth/user", (_req, res) => res.status(401).json({ message: "Unauthorized" }));
      return;
    }

    passport.use(
      new GoogleStrategy(
        {
          clientID: clientId,
          clientSecret: clientSecret,
          callbackURL: "http://localhost:8080/api/callback/google",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value ?? "";
            const firstName = profile.name?.givenName ?? profile.displayName ?? "Player";
            const lastName = profile.name?.familyName ?? "";
            const photo = profile.photos?.[0]?.value ?? "";
            const userId = await upsertGoogleUser(profile.id, email, firstName, lastName, photo);
            const displayName = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0] || "Player";
            const dbProfile = await syncGoogleProfile(userId, displayName, photo);
            done(null, { userId, profileId: dbProfile.id, email, firstName, lastName, photo });
          } catch (err) {
            done(err as Error);
          }
        },
      ),
    );

    app.get("/api/login", passport.authenticate("google", { scope: ["openid", "email", "profile"] }));

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:19093";

    app.get(
      "/api/callback/google",
      passport.authenticate("google", { failureRedirect: frontendUrl }),
      (_req, res) => res.redirect(frontendUrl),
    );

    app.get("/api/logout", (req, res) => {
      req.logout(() => res.redirect(frontendUrl));
    });

    app.get("/api/auth/user", async (req: any, res) => {
      if (!req.isAuthenticated() || !req.user?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      try {
        const [user] = await db.select().from(users).where(eq(users.id, req.user.userId));
        res.json(user ?? null);
      } catch {
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });

    return;
  }

  // ── Production: Replit OIDC ───────────────────────────────────────────────
  const config = await getOidcConfig();

  const verify: VerifyFunction = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new OidcStrategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client
          .buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          })
          .href,
      );
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      res.json(user ?? null);
    } catch {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// ─── isAuthenticated (Replit OIDC only) ──────────────────────────────────────

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
