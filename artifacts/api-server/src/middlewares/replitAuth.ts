import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db, users } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Secure cookies when running on Replit or in production
const isSecure =
  !!process.env.REPLIT_DEV_DOMAIN || process.env.NODE_ENV === "production";

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

const isDevAutoLogin =
  process.env.NODE_ENV === "development" && !process.env.REPL_ID;

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

  const redirectTo = frontendUrl();

  app.get(
    "/api/login",
    passport.authenticate("google", { scope: ["openid", "email", "profile"] }),
  );

  app.get(
    "/api/callback/google",
    passport.authenticate("google", { failureRedirect: redirectTo }),
    (_req, res) => res.redirect(redirectTo),
  );

  app.get("/api/logout", (req, res) => {
    req.logout(() => res.redirect(redirectTo));
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
