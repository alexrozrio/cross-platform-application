import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, badgesTable, profilesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/badges/share/:token", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: badgesTable.id,
      badgeType: badgesTable.badgeType,
      tournamentPeriod: badgesTable.tournamentPeriod,
      totalPoints: badgesTable.totalPoints,
      shareToken: badgesTable.shareToken,
      awardedAt: badgesTable.awardedAt,
      username: profilesTable.username,
      avatar: profilesTable.avatar,
    })
    .from(badgesTable)
    .innerJoin(profilesTable, eq(badgesTable.profileId, profilesTable.id))
    .where(eq(badgesTable.shareToken, req.params.token));

  if (rows.length === 0) {
    res.status(404).json({ error: "Badge not found" });
    return;
  }

  const badge = rows[0];
  res.json({ ...badge, awardedAt: badge.awardedAt.toISOString() });
});

router.get("/badges/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId);
  if (isNaN(profileId)) {
    res.status(400).json({ error: "Invalid profileId" });
    return;
  }

  const badges = await db
    .select()
    .from(badgesTable)
    .where(eq(badgesTable.profileId, profileId))
    .orderBy(desc(badgesTable.awardedAt));

  res.json(
    badges.map((b) => ({ ...b, awardedAt: b.awardedAt.toISOString() })),
  );
});

export default router;
