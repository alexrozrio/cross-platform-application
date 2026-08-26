import { Router, type IRouter } from "express";
import { eq, or, ilike, ne, and } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import {
  CreateProfileBody,
  GetProfileParams,
  GetProfileResponse,
  UpdateProfileParams,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ─── Sync: find-or-create by user ID or device ID ───────────────────────────

router.post("/profiles/sync", async (req, res): Promise<void> => {
  const { replitUserId, deviceId, username, avatar } = req.body as {
    replitUserId?: string;
    deviceId?: string;
    username?: string;
    avatar?: string;
  };

  if (!replitUserId && !deviceId) {
    res.status(400).json({ error: "replitUserId or deviceId is required" });
    return;
  }

  let profile;

  if (replitUserId) {
    [profile] = await db.select().from(profilesTable).where(eq(profilesTable.replitUserId, replitUserId));
  }
  if (!profile && deviceId) {
    [profile] = await db.select().from(profilesTable).where(eq(profilesTable.deviceId, deviceId));
  }

  if (profile) {
    // Update username/avatar if they changed
    const updates: Record<string, unknown> = {};
    if (replitUserId && profile.replitUserId !== replitUserId) updates.replitUserId = replitUserId;
    if (username && profile.username !== username) updates.username = username;
    if (avatar && profile.avatar !== avatar) updates.avatar = avatar;

    if (Object.keys(updates).length > 0) {
      [profile] = await db.update(profilesTable).set(updates).where(eq(profilesTable.id, profile.id)).returning();
    }

    res.json(GetProfileResponse.parse({ ...profile, createdAt: profile.createdAt.toISOString() }));
    return;
  }

  // Generate a username if none provided
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const autoUsername = username ?? `Player${suffix}`;

  const [newProfile] = await db.insert(profilesTable).values({
    username: autoUsername,
    avatar: avatar ?? null,
    replitUserId: replitUserId ?? null,
    deviceId: deviceId ?? null,
  }).returning();

  res.status(201).json(GetProfileResponse.parse({ ...newProfile, createdAt: newProfile.createdAt.toISOString() }));
});

// ─── Search profiles ─────────────────────────────────────────────────────────

router.get("/profiles/search", async (req, res): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const excludeId = req.query.exclude ? parseInt(req.query.exclude as string, 10) : null;

  if (!q || q.length < 1) {
    res.json([]);
    return;
  }

  let query = db
    .select({ id: profilesTable.id, username: profilesTable.username, avatar: profilesTable.avatar, gems: profilesTable.gems })
    .from(profilesTable)
    .where(
      excludeId
        ? and(ilike(profilesTable.username, `%${q}%`), ne(profilesTable.id, excludeId))
        : ilike(profilesTable.username, `%${q}%`),
    )
    .$dynamic();

  const results = await query.limit(10);
  res.json(results);
});

// ─── Create profile (manual / legacy) ──────────────────────────────────────

router.post("/profiles", async (req, res): Promise<void> => {
  const parsed = CreateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.username, parsed.data.username));

  if (existing) {
    res.status(200).json(GetProfileResponse.parse({ ...existing, createdAt: existing.createdAt.toISOString() }));
    return;
  }

  const [profile] = await db.insert(profilesTable).values({
    username: parsed.data.username,
    avatar: parsed.data.avatar ?? null,
    theme: parsed.data.theme ?? "light",
    highlightErrors: parsed.data.highlightErrors ?? true,
    showTimer: parsed.data.showTimer ?? true,
  }).returning();

  res.status(201).json(GetProfileResponse.parse({ ...profile, createdAt: profile.createdAt.toISOString() }));
});

// ─── Get profile ────────────────────────────────────────────────────────────

router.get("/profiles/:id", async (req, res): Promise<void> => {
  const params = GetProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, params.data.id));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(GetProfileResponse.parse({ ...profile, createdAt: profile.createdAt.toISOString() }));
});

// ─── Update profile ─────────────────────────────────────────────────────────

router.patch("/profiles/:id", async (req, res): Promise<void> => {
  const params = UpdateProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.username !== undefined) updateData.username = parsed.data.username;
  if (parsed.data.avatar !== undefined) updateData.avatar = parsed.data.avatar;
  if (parsed.data.theme !== undefined) updateData.theme = parsed.data.theme;
  if (parsed.data.imageTheme !== undefined) updateData.imageTheme = parsed.data.imageTheme;
  if (parsed.data.fontTheme !== undefined) updateData.fontTheme = parsed.data.fontTheme;
  if (parsed.data.fontSize !== undefined) updateData.fontSize = parsed.data.fontSize;
  if (parsed.data.backgroundEnabled !== undefined) updateData.backgroundEnabled = parsed.data.backgroundEnabled;
  if (parsed.data.highlightErrors !== undefined) updateData.highlightErrors = parsed.data.highlightErrors;
  if (parsed.data.showTimer !== undefined) updateData.showTimer = parsed.data.showTimer;
  if (parsed.data.soundEnabled !== undefined) updateData.soundEnabled = parsed.data.soundEnabled;
  if (parsed.data.gameMode !== undefined) updateData.gameMode = parsed.data.gameMode;

  const [profile] = await db.update(profilesTable).set(updateData).where(eq(profilesTable.id, params.data.id)).returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(UpdateProfileResponse.parse({ ...profile, createdAt: profile.createdAt.toISOString() }));
});

// ─── Claim daily login reward ────────────────────────────────────────────────

function gemsForLoginStreak(streak: number): number {
  return Math.min(streak, 7);
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

router.post("/profiles/:id/claim-login-reward", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid profile id" });
    return;
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, id));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const today = todayUTC();

  if (profile.lastLoginDate === today) {
    res.json({ alreadyClaimed: true, loginStreak: profile.loginStreak, gemsAwarded: 0, totalGems: profile.gems });
    return;
  }

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newStreak = profile.lastLoginDate === yesterdayStr ? profile.loginStreak + 1 : 1;
  const gemsAwarded = gemsForLoginStreak(newStreak);
  const totalGems = profile.gems + gemsAwarded;

  const [updated] = await db
    .update(profilesTable)
    .set({ loginStreak: newStreak, lastLoginDate: today, gems: totalGems })
    .where(eq(profilesTable.id, id))
    .returning();

  res.json({ alreadyClaimed: false, loginStreak: newStreak, gemsAwarded, totalGems: updated.gems });
});

export default router;
