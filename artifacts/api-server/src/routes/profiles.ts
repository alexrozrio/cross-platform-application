import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
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

// ─── Sync: find-or-create by Clerk user ID or device ID ────────────────────

router.post("/profiles/sync", async (req, res): Promise<void> => {
  const { clerkUserId, deviceId, username, avatar } = req.body as {
    clerkUserId?: string;
    deviceId?: string;
    username?: string;
    avatar?: string;
  };

  if (!clerkUserId && !deviceId) {
    res.status(400).json({ error: "clerkUserId or deviceId is required" });
    return;
  }

  let profile;

  if (clerkUserId) {
    [profile] = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, clerkUserId));
  }
  if (!profile && deviceId) {
    [profile] = await db.select().from(profilesTable).where(eq(profilesTable.deviceId, deviceId));
  }

  if (profile) {
    // Update username/avatar if Clerk provides them and they changed
    const updates: Record<string, unknown> = {};
    if (clerkUserId && profile.clerkUserId !== clerkUserId) updates.clerkUserId = clerkUserId;
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
    clerkUserId: clerkUserId ?? null,
    deviceId: deviceId ?? null,
  }).returning();

  res.status(201).json(GetProfileResponse.parse({ ...newProfile, createdAt: newProfile.createdAt.toISOString() }));
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
  if (parsed.data.highlightErrors !== undefined) updateData.highlightErrors = parsed.data.highlightErrors;
  if (parsed.data.showTimer !== undefined) updateData.showTimer = parsed.data.showTimer;

  const [profile] = await db.update(profilesTable).set(updateData).where(eq(profilesTable.id, params.data.id)).returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(UpdateProfileResponse.parse({ ...profile, createdAt: profile.createdAt.toISOString() }));
});

export default router;
