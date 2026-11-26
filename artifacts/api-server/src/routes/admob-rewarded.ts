import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import {
  db,
  loginRewardClaimsTable,
  loginRewardDoublesTable,
  profilesTable,
} from "@workspace/db";
import { verifyAdMobSsvQuery } from "../lib/admob-ssv";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const REWARDED_AD_UNIT_ID = "ca-app-pub-8826408740422357/4576813796";

function isUtcDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

router.get(
  "/profiles/:id/login-reward-double",
  async (req, res): Promise<void> => {
    const profileId = Number.parseInt(req.params.id, 10);
    const rewardDate = typeof req.query.date === "string" ? req.query.date : "";
    if (
      !Number.isSafeInteger(profileId) ||
      profileId <= 0 ||
      !isUtcDate(rewardDate)
    ) {
      res
        .status(400)
        .json({ error: "A valid profile id and reward date are required" });
      return;
    }

    const [reward] = await db
      .select({ gemsAwarded: loginRewardDoublesTable.gemsAwarded })
      .from(loginRewardDoublesTable)
      .where(
        and(
          eq(loginRewardDoublesTable.profileId, profileId),
          eq(loginRewardDoublesTable.rewardDate, rewardDate),
        ),
      );

    const [profile] = await db
      .select({ totalGems: profilesTable.gems })
      .from(profilesTable)
      .where(eq(profilesTable.id, profileId));

    res.json({
      doubled: Boolean(reward),
      gemsAwarded: reward?.gemsAwarded ?? 0,
      totalGems: profile?.totalGems ?? 0,
    });
  },
);

router.get("/admob/rewarded-ssv", async (req, res): Promise<void> => {
  const queryStart = req.originalUrl.indexOf("?");
  const rawQuery = queryStart >= 0 ? req.originalUrl.slice(queryStart + 1) : "";

  let params: URLSearchParams;
  try {
    params = await verifyAdMobSsvQuery(rawQuery);
  } catch (error) {
    logger.warn({ err: error }, "Rejected invalid AdMob rewarded SSV callback");
    res.status(400).send("Invalid SSV callback");
    return;
  }

  const adUnitId = params.get("ad_unit");
  const profileIdValue = params.get("user_id");
  const rewardDate = params.get("custom_data");
  const transactionId = params.get("transaction_id");
  if (
    adUnitId !== REWARDED_AD_UNIT_ID ||
    !profileIdValue ||
    !rewardDate ||
    !transactionId
  ) {
    res.status(200).send("Callback ignored");
    return;
  }

  const profileId = Number.parseInt(profileIdValue, 10);
  if (
    !Number.isSafeInteger(profileId) ||
    profileId <= 0 ||
    !isUtcDate(rewardDate)
  ) {
    res.status(200).send("Callback ignored");
    return;
  }

  const [claim] = await db
    .select()
    .from(loginRewardClaimsTable)
    .where(
      and(
        eq(loginRewardClaimsTable.profileId, profileId),
        eq(loginRewardClaimsTable.rewardDate, rewardDate),
      ),
    );
  if (!claim || claim.gemsAwarded <= 0) {
    res.status(200).send("No eligible login reward");
    return;
  }

  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(loginRewardDoublesTable)
      .values({
        profileId,
        rewardDate,
        transactionId,
        gemsAwarded: claim.gemsAwarded,
      })
      .onConflictDoNothing()
      .returning({ id: loginRewardDoublesTable.id });
    if (!inserted) return;

    await tx
      .update(profilesTable)
      .set({ gems: sql`${profilesTable.gems} + ${claim.gemsAwarded}` })
      .where(eq(profilesTable.id, profileId));
  });

  res.status(200).send("OK");
});

export default router;
