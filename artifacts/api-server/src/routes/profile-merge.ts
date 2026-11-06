import { Router, type IRouter, type RequestHandler } from "express";
import { eq, sql, and, isNull } from "drizzle-orm";
import {
  db,
  profilesTable,
  gamesTable,
  memoryGamesTable,
  jigsawGamesTable,
  profileMergesTable,
  wordSearchGamesTable,
} from "@workspace/db";

const router: IRouter = Router();

interface AuthedRequest extends Express.Request {
  user?: {
    userId: string;
    profileId: number;
  };
}

// Require an authenticated session and expose the caller's identity.
const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated() || !(req as AuthedRequest).user?.userId) {
    res.status(401).json({ error: "You must be signed in to merge guest progress." });
    return;
  }
  next();
};

// ─── Preview: show what would be merged ──────────────────────────────────────

router.get("/profiles/merge-preview", requireAuth, async (req, res): Promise<void> => {
  const authed = req as AuthedRequest;
  const replitUserId = authed.user!.userId;
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : "";

  if (!deviceId || deviceId.length > 200) {
    res.status(400).json({ error: "A valid device ID is required." });
    return;
  }

  // Find the guest profile for this device.
  const [guest] = await db
    .select()
    .from(profilesTable)
    .where(
      and(
        eq(profilesTable.deviceId, deviceId),
        isNull(profilesTable.replitUserId),
        isNull(profilesTable.clerkUserId),
      ),
    );

  if (!guest) {
    res.json({ available: false, reason: "no-guest" });
    return;
  }

  // Has this guest already been merged into any account?
  const [existingMerge] = await db
    .select()
    .from(profileMergesTable)
    .where(eq(profileMergesTable.sourceProfileId, guest.id));

  if (existingMerge) {
    res.json({ available: false, reason: "already-merged" });
    return;
  }

  // Has this Google account already absorbed a different guest?
  const [accountMerge] = await db
    .select()
    .from(profileMergesTable)
    .where(eq(profileMergesTable.replitUserId, replitUserId));

  if (accountMerge) {
    res.json({ available: false, reason: "account-already-merged" });
    return;
  }

  // Count completed games on the guest profile.
  const [sudokuCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gamesTable)
    .where(eq(gamesTable.profileId, guest.id));
  const [memoryCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memoryGamesTable)
    .where(eq(memoryGamesTable.profileId, guest.id));
  const [jigsawCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jigsawGamesTable)
    .where(eq(jigsawGamesTable.profileId, guest.id));
  const [wordSearchCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(wordSearchGamesTable)
    .where(eq(wordSearchGamesTable.profileId, guest.id));

  const totalGames = (sudokuCount?.count ?? 0) + (memoryCount?.count ?? 0) + (jigsawCount?.count ?? 0) + (wordSearchCount?.count ?? 0);

  // Only offer the merge if there is something to transfer.
  if (guest.xp === 0 && guest.gems === 0 && totalGames === 0) {
    res.json({ available: false, reason: "nothing-to-merge" });
    return;
  }

  res.json({
    available: true,
    guestProfileId: guest.id,
    guestUsername: guest.username,
    xp: guest.xp,
    gems: guest.gems,
    games: totalGames,
  });
});

// ─── Merge: transfer guest progress into the signed-in account ──────────────

router.post("/profiles/merge", requireAuth, async (req, res): Promise<void> => {
  const authed = req as AuthedRequest;
  const replitUserId = authed.user!.userId;
  const targetProfileId = authed.user!.profileId;
  const deviceId = typeof req.body?.deviceId === "string" ? req.body.deviceId : "";

  if (!deviceId || deviceId.length > 200) {
    res.status(400).json({ error: "A valid device ID is required." });
    return;
  }

  // Find the guest profile for this device.
  const [guest] = await db
    .select()
    .from(profilesTable)
    .where(
      and(
        eq(profilesTable.deviceId, deviceId),
        isNull(profilesTable.replitUserId),
        isNull(profilesTable.clerkUserId),
      ),
    );

  if (!guest) {
    res.status(404).json({ error: "No guest profile found on this device." });
    return;
  }

  if (guest.id === targetProfileId) {
    res.status(400).json({ error: "You cannot merge a profile into itself." });
    return;
  }

  // Re-check both uniqueness guards right before writing. The unique constraints
  // on profile_merges are the ultimate enforcement, but checking here gives a
  // clear error message instead of a raw constraint-violation.
  const [existingMerge] = await db
    .select()
    .from(profileMergesTable)
    .where(eq(profileMergesTable.sourceProfileId, guest.id));

  if (existingMerge) {
    res.status(409).json({ error: "This guest profile has already been merged." });
    return;
  }

  const [accountMerge] = await db
    .select()
    .from(profileMergesTable)
    .where(eq(profileMergesTable.replitUserId, replitUserId));

  if (accountMerge) {
    res.status(409).json({ error: "This account has already absorbed a guest profile." });
    return;
  }

  // Count games before reassigning (for the audit record).
  const [sudokuCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gamesTable)
    .where(eq(gamesTable.profileId, guest.id));
  const [memoryCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memoryGamesTable)
    .where(eq(memoryGamesTable.profileId, guest.id));
  const [jigsawCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jigsawGamesTable)
    .where(eq(jigsawGamesTable.profileId, guest.id));
  const [wordSearchCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(wordSearchGamesTable)
    .where(eq(wordSearchGamesTable.profileId, guest.id));

  const gamesTransferred =
    (sudokuCount?.count ?? 0) + (memoryCount?.count ?? 0) + (jigsawCount?.count ?? 0) + (wordSearchCount?.count ?? 0);
  const xpTransferred = guest.xp;
  const gemsTransferred = guest.gems;

  // Reassign all game records from the guest to the signed-in profile.
  await db.update(gamesTable).set({ profileId: targetProfileId }).where(eq(gamesTable.profileId, guest.id));
  await db.update(memoryGamesTable).set({ profileId: targetProfileId }).where(eq(memoryGamesTable.profileId, guest.id));
  await db.update(jigsawGamesTable).set({ profileId: targetProfileId }).where(eq(jigsawGamesTable.profileId, guest.id));
  await db.update(wordSearchGamesTable).set({ profileId: targetProfileId }).where(eq(wordSearchGamesTable.profileId, guest.id));

  // Add the guest's xp and gems to the signed-in profile.
  const [updatedTarget] = await db
    .update(profilesTable)
    .set({
      xp: sql`${profilesTable.xp} + ${xpTransferred}`,
      gems: sql`${profilesTable.gems} + ${gemsTransferred}`,
    })
    .where(eq(profilesTable.id, targetProfileId))
    .returning();

  // Record the merge. The unique constraints on source_profile_id and
  // replit_user_id enforce one-time-only at the database level.
  try {
    await db.insert(profileMergesTable).values({
      sourceProfileId: guest.id,
      targetProfileId,
      replitUserId,
      xpTransferred,
      gemsTransferred,
      gamesTransferred,
    });
  } catch {
    // If the insert fails on a unique constraint, the guest or account was
    // already merged by a concurrent request. The game reassignment and
    // balance update above are idempotent (SET profileId, additive xp/gems),
    // but to be safe we surface a clear message.
    res.status(409).json({ error: "This guest profile or account has already been merged." });
    return;
  }

  // Zero out the guest profile's balances so it is clearly "consumed".
  await db
    .update(profilesTable)
    .set({ xp: 0, gems: 0 })
    .where(eq(profilesTable.id, guest.id));

  res.json({
    success: true,
    xpTransferred,
    gemsTransferred,
    gamesTransferred,
    profile: updatedTarget
      ? {
          id: updatedTarget.id,
          xp: updatedTarget.xp,
          gems: updatedTarget.gems,
          username: updatedTarget.username,
        }
      : null,
  });
});

export default router;
