import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, desc, eq, or, sql } from "drizzle-orm";
import {
  db,
  jigsawChallengesTable,
  jigsawGamesTable,
  profilesTable,
} from "@workspace/db";

const router: IRouter = Router();
const VALID_SIZES = new Set([2, 3, 4, 5]);
const VALID_LEVELS = new Set([1, 2, 3]);

async function challengeDetail(challengeId: number) {
  const [challenge] = await db.select().from(jigsawChallengesTable)
    .where(eq(jigsawChallengesTable.id, challengeId));
  if (!challenge) return null;

  const [challenger] = await db.select({
    username: profilesTable.username,
    avatar: profilesTable.avatar,
    xp: profilesTable.xp,
  }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId));

  const [challenged] = challenge.challengedId
    ? await db.select({
        username: profilesTable.username,
        avatar: profilesTable.avatar,
        xp: profilesTable.xp,
      }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId))
    : [];

  const gameIds = [challenge.challengerGameId, challenge.challengedGameId].filter((id): id is number => id !== null);
  const games = gameIds.length
    ? await db.select({ id: jigsawGamesTable.id, points: jigsawGamesTable.points })
        .from(jigsawGamesTable)
        .where(or(...gameIds.map((id) => eq(jigsawGamesTable.id, id)))!)
    : [];
  const pointsByGame = new Map(games.map((game) => [game.id, game.points]));

  return {
    ...challenge,
    challengerUsername: challenger?.username ?? "Player",
    challengerAvatar: challenger?.avatar ?? null,
    challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? null,
    challengedAvatar: challenged?.avatar ?? null,
    challengedXp: challenged?.xp ?? 0,
    challengerPoints: challenge.challengerGameId ? pointsByGame.get(challenge.challengerGameId) ?? null : null,
    challengedPoints: challenge.challengedGameId ? pointsByGame.get(challenge.challengedGameId) ?? null : null,
  };
}

router.post("/jigsaw-challenges", async (req, res): Promise<void> => {
  const body = req.body as {
    challengerId?: number;
    challengedId?: number;
    gridSize?: number;
    level?: number;
    imageKey?: number;
  };
  const challengerId = Number(body.challengerId);
  const gridSize = Number(body.gridSize);
  const level = Number(body.level ?? 1);
  const imageKey = Number(body.imageKey ?? 1);
  const challengedId = body.challengedId === undefined ? null : Number(body.challengedId);
  if (!Number.isInteger(challengerId) || challengerId <= 0
    || !VALID_SIZES.has(gridSize) || !VALID_LEVELS.has(level)
    || !Number.isInteger(imageKey) || imageKey < 1 || imageKey > 32
    || (challengedId !== null && (!Number.isInteger(challengedId) || challengedId <= 0 || challengedId === challengerId))) {
    res.status(400).json({ error: "Choose valid players and puzzle settings." });
    return;
  }

  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable)
    .where(eq(profilesTable.id, challengerId));
  const [challenged] = challengedId
    ? await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId))
    : [];
  if (!challenger || (challengedId && !challenged)) {
    res.status(404).json({ error: "Player not found." });
    return;
  }

  const shareToken = randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const created = await db.transaction(async (tx) => {
    const [game] = await tx.insert(jigsawGamesTable).values({
      profileId: challengerId,
      gridSize,
      level,
      imageKey,
      status: "active",
    }).returning({ id: jigsawGamesTable.id });
    const [challenge] = await tx.insert(jigsawChallengesTable).values({
      challengerId,
      challengedId,
      shareToken,
      gridSize,
      level,
      imageKey,
      status: "pending",
      challengerGameId: game.id,
      expiresAt,
    }).returning({ id: jigsawChallengesTable.id });
    return { gameId: game.id, challengeId: challenge.id };
  });

  res.status(201).json({ ...created, shareToken, expiresAt: expiresAt.toISOString() });
});

router.get("/jigsaw-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) {
    res.status(400).json({ error: "Invalid profile id." });
    return;
  }
  const challenges = await db.select({ id: jigsawChallengesTable.id })
    .from(jigsawChallengesTable)
    .where(or(
      eq(jigsawChallengesTable.challengerId, profileId),
      eq(jigsawChallengesTable.challengedId, profileId),
    ))
    .orderBy(desc(jigsawChallengesTable.createdAt))
    .limit(50);
  const details = await Promise.all(challenges.map(({ id }) => challengeDetail(id)));
  res.json(details.filter(Boolean));
});

router.get("/jigsaw-challenges/invite/:token", async (req, res): Promise<void> => {
  const token = String(req.params.token ?? "").slice(0, 80);
  const [challenge] = await db.select({ id: jigsawChallengesTable.id })
    .from(jigsawChallengesTable)
    .where(eq(jigsawChallengesTable.shareToken, token));
  if (!challenge) {
    res.status(404).json({ error: "This Jigsaw challenge link is no longer available." });
    return;
  }
  const detail = await challengeDetail(challenge.id);
  if (detail && detail.status === "pending" && detail.expiresAt.getTime() <= Date.now()) {
    await db.update(jigsawChallengesTable).set({ status: "expired" })
      .where(and(eq(jigsawChallengesTable.id, detail.id), eq(jigsawChallengesTable.status, "pending")));
    detail.status = "expired";
  }
  res.json(detail);
});

router.post("/jigsaw-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: number; action?: string };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0
    || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." });
    return;
  }

  const [challenge] = await db.select().from(jigsawChallengesTable)
    .where(eq(jigsawChallengesTable.id, id));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found." });
    return;
  }
  if (challenge.challengerId === profileId) {
    res.status(403).json({ error: "You cannot accept your own challenge." });
    return;
  }
  if (challenge.challengedId && challenge.challengedId !== profileId) {
    res.status(403).json({ error: "This challenge was sent to another player." });
    return;
  }
  if (challenge.status === "accepted" && body.action === "accept" && challenge.challengedGameId) {
    res.json({ challengeId: id, gameId: challenge.challengedGameId, status: "accepted" });
    return;
  }
  if (challenge.status !== "pending") {
    res.status(409).json({ error: "This challenge is no longer waiting for a response." });
    return;
  }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await db.update(jigsawChallengesTable).set({ status: "expired" })
      .where(and(eq(jigsawChallengesTable.id, id), eq(jigsawChallengesTable.status, "pending")));
    res.status(410).json({ error: "This challenge link has expired." });
    return;
  }

  if (body.action === "decline") {
    const [updated] = await db.update(jigsawChallengesTable).set({ status: "declined", challengedId: profileId })
      .where(and(eq(jigsawChallengesTable.id, id), eq(jigsawChallengesTable.status, "pending")))
      .returning({ id: jigsawChallengesTable.id });
    if (!updated) {
      res.status(409).json({ error: "This challenge has already been answered." });
      return;
    }
    res.json({ challengeId: id, status: "declined" });
    return;
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [game] = await tx.insert(jigsawGamesTable).values({
        profileId,
        gridSize: challenge.gridSize,
        level: challenge.level,
        imageKey: challenge.imageKey,
        status: "active",
      }).returning({ id: jigsawGamesTable.id });
      const [updated] = await tx.update(jigsawChallengesTable)
        .set({ status: "accepted", challengedId: profileId, challengedGameId: game.id })
        .where(and(eq(jigsawChallengesTable.id, id), eq(jigsawChallengesTable.status, "pending")))
        .returning({ id: jigsawChallengesTable.id });
      if (!updated) throw new Error("CHALLENGE_ALREADY_ANSWERED");
      return game.id;
    });
    res.json({ challengeId: id, gameId: result, status: "accepted" });
  } catch (error) {
    if (error instanceof Error && error.message === "CHALLENGE_ALREADY_ANSWERED") {
      res.status(409).json({ error: "This challenge has already been answered." });
      return;
    }
    throw error;
  }
});

export async function resolveJigsawChallengeForGame(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(jigsawChallengesTable)
    .where(or(
      eq(jigsawChallengesTable.challengerGameId, gameId),
      eq(jigsawChallengesTable.challengedGameId, gameId),
    ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengedGameId) return;

  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(jigsawGamesTable).where(eq(jigsawGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(jigsawGamesTable).where(eq(jigsawGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const winnerId = (challengerGame.points ?? 0) === (challengedGame.points ?? 0)
    ? null
    : (challengerGame.points ?? 0) > (challengedGame.points ?? 0)
      ? challenge.challengerId
      : challenge.challengedId;
  const [resolved] = await db.update(jigsawChallengesTable)
    .set({ status: "completed", winnerId })
    .where(and(eq(jigsawChallengesTable.id, challenge.id), eq(jigsawChallengesTable.status, "accepted")))
    .returning({ id: jigsawChallengesTable.id });
  if (resolved && winnerId) {
    await db.update(profilesTable)
      .set({ gems: sql`${profilesTable.gems} + 10` })
      .where(eq(profilesTable.id, winnerId));
  }
}

export default router;
