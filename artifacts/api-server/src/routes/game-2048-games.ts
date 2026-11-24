import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, profilesTable, game2048GamesTable, game2048ChallengesTable } from "@workspace/db";
import { expireChallengeIfDue, expireChallengesForProfile, isChallengeRecordHidden, CHALLENGE_INVITATION_TTL_MS, CHALLENGE_ACTIVE_TTL_MS } from "../utils/challenge-lifecycle";

const router: IRouter = Router();

const DIFFICULTIES = ["3x3", "4x4", "5x5", "6x6"] as const;
const SIZES: Record<string, number> = { "3x3": 3, "4x4": 4, "5x5": 5, "6x6": 6 };
const TARGET_TILES: Record<string, number> = { "3x3": 512, "4x4": 1024, "5x5": 2048, "6x6": 2048 };

const BASE_POINTS = { "3x3": 150, "4x4": 400, "5x5": 900, "6x6": 1800 } as const;
const PAR_SECONDS = { "3x3": 600, "4x4": 1500, "5x5": 2700, "6x6": 4500 } as const;
const PAR_MOVES = { "3x3": 200, "4x4": 400, "5x5": 700, "6x6": 1100 } as const;
const XP_REWARDS = { "3x3": 1, "4x4": 2, "5x5": 3, "6x6": 4 } as const;
const GEM_REWARDS = { "3x3": 1, "4x4": 2, "5x5": 3, "6x6": 5 } as const;

type Difficulty = (typeof DIFFICULTIES)[number];

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }

function normalizeDifficulty(value: unknown): Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value) ? value as Difficulty : "4x4";
}

function getDailyConfig(date: string) {
  const digits = Number(date.replaceAll("-", ""));
  return {
    date,
    difficulty: DIFFICULTIES[digits % DIFFICULTIES.length],
    seed: digits,
  };
}

async function formatGame2048Challenge(id: number) {
  const [challenge] = await db.select().from(game2048ChallengesTable).where(eq(game2048ChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: game2048GamesTable.points, score: game2048GamesTable.score, maxTile: game2048GamesTable.maxTile, elapsedSeconds: game2048GamesTable.elapsedSeconds }).from(game2048GamesTable).where(eq(game2048GamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: game2048GamesTable.points, score: game2048GamesTable.score, maxTile: game2048GamesTable.maxTile, elapsedSeconds: game2048GamesTable.elapsedSeconds }).from(game2048GamesTable).where(eq(game2048GamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerScore: challengerGame?.score ?? null, challengedScore: challengedGame?.score ?? null,
    challengerMaxTile: challengerGame?.maxTile ?? null, challengedMaxTile: challengedGame?.maxTile ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null };
}

router.post("/game-2048-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; difficulty?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  const difficulty = normalizeDifficulty(body.difficulty);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || typeof body.difficulty !== "string" || !DIFFICULTIES.includes(body.difficulty as Difficulty)) {
    res.status(400).json({ error: "Choose another player and a valid board size." }); return;
  }
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + CHALLENGE_INVITATION_TTL_MS);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(game2048ChallengesTable).values({ challengerId, challengedId, difficulty, size: SIZES[difficulty], seed, expiresAt }).returning({ id: game2048ChallengesTable.id });
    const [game] = await tx.insert(game2048GamesTable).values({ profileId: challengerId, difficulty, size: SIZES[difficulty], seed, challengeId: challenge.id, status: "active" }).returning({ id: game2048GamesTable.id });
    await tx.update(game2048ChallengesTable).set({ challengerGameId: game.id }).where(eq(game2048ChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatGame2048Challenge(created.challengeId)), gameId: created.gameId });
});

router.get("/game-2048-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  await expireChallengesForProfile(game2048ChallengesTable, profileId);
  const rows = await db.select({ id: game2048ChallengesTable.id }).from(game2048ChallengesTable)
    .where(or(eq(game2048ChallengesTable.challengerId, profileId), eq(game2048ChallengesTable.challengedId, profileId)))
    .orderBy(desc(game2048ChallengesTable.createdAt)).limit(50);
  const details = (await Promise.all(rows.map(({ id }) => formatGame2048Challenge(id)))).filter((detail): detail is NonNullable<typeof detail> => !!detail && !isChallengeRecordHidden(detail));
  res.json(details);
});

router.get("/game-2048-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const [challenge] = await db.select().from(game2048ChallengesTable).where(eq(game2048ChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (await expireChallengeIfDue(game2048ChallengesTable, challenge)) {
    const [updated] = await db.select().from(game2048ChallengesTable).where(eq(game2048ChallengesTable.id, id));
    if (isChallengeRecordHidden(updated ?? { ...challenge, status: "expired" })) { res.status(410).json({ error: "This challenge has expired." }); return; }
  }
  res.json(await formatGame2048Challenge(id));
});

router.patch("/game-2048-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(game2048ChallengesTable).where(eq(game2048ChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (await expireChallengeIfDue(game2048ChallengesTable, challenge)) { res.status(410).json({ error: "This challenge has expired." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (body.action === "decline") {
    await db.update(game2048ChallengesTable).set({ status: "declined" }).where(eq(game2048ChallengesTable.id, id));
    res.json(await formatGame2048Challenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(game2048GamesTable).values({ profileId, difficulty: challenge.difficulty, size: challenge.size, seed: challenge.seed, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(game2048ChallengesTable).set({ status: "accepted", challengedGameId: created.id, expiresAt: new Date(challenge.createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS) }).where(eq(game2048ChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatGame2048Challenge(id)), gameId: game.id });
});

async function resolveGame2048Challenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(game2048ChallengesTable).where(or(
    eq(game2048ChallengesTable.challengerGameId, gameId), eq(game2048ChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(game2048GamesTable).where(eq(game2048GamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(game2048GamesTable).where(eq(game2048GamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(game2048ChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(game2048ChallengesTable.id, challenge.id), eq(game2048ChallengesTable.status, "accepted"))).returning({ id: game2048ChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/game-2048-games/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db.select({ profileId: game2048GamesTable.profileId, username: profilesTable.username,
    avatar: profilesTable.avatar, xp: profilesTable.xp, points: game2048GamesTable.points })
    .from(game2048GamesTable).innerJoin(profilesTable, eq(game2048GamesTable.profileId, profilesTable.id))
    .where(eq(game2048GamesTable.status, "completed"));
  const grouped = new Map<number, { username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number }>();
  for (const row of rows) {
    if (!row.profileId) continue;
    const entry = grouped.get(row.profileId) ?? { username: row.username, avatar: row.avatar ?? null, xp: row.xp ?? 0, totalPoints: 0, gamesPlayed: 0 };
    entry.totalPoints += row.points ?? 0;
    entry.gamesPlayed += 1;
    grouped.set(row.profileId, entry);
  }
  res.json(Array.from(grouped.entries()).sort((a, b) => b[1].totalPoints - a[1].totalPoints).slice(0, 100)
    .map(([profileId, entry], index) => ({ rank: index + 1, profileId, ...entry })));
});

router.get("/game-2048-daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/game-2048-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: game2048GamesTable.points, score: game2048GamesTable.score })
    .from(game2048GamesTable).where(and(eq(game2048GamesTable.profileId, profileId), eq(game2048GamesTable.dailyDate, todayUtc()), eq(game2048GamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/game-2048-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: game2048GamesTable.dailyDate }).from(game2048GamesTable).where(and(
    eq(game2048GamesTable.profileId, profileId), eq(game2048GamesTable.status, "completed"),
    gte(game2048GamesTable.dailyDate, `${month}-01`), lt(game2048GamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/game-2048-daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: game2048GamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: game2048GamesTable.points, score: game2048GamesTable.score, maxTile: game2048GamesTable.maxTile, elapsedSeconds: game2048GamesTable.elapsedSeconds })
    .from(game2048GamesTable).innerJoin(profilesTable, eq(game2048GamesTable.profileId, profilesTable.id))
    .where(and(eq(game2048GamesTable.dailyDate, date), eq(game2048GamesTable.status, "completed")))
    .orderBy(desc(game2048GamesTable.points), asc(game2048GamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

// Points scale with the highest tile reached (the "numbers they achieved
// maximum"), a speed bonus against par time, and move efficiency.
function tileFactor(difficulty: Difficulty, maxTile: number): number {
  const target = TARGET_TILES[difficulty];
  if (maxTile <= 0) return 0.2;
  const ratio = Math.log2(maxTile) / Math.log2(target);
  return Math.min(1.5, Math.max(0.3, ratio));
}

function performanceFactor(difficulty: Difficulty, elapsedSeconds: number, moves: number): number {
  const timeBonus = Math.max(0, (PAR_SECONDS[difficulty] - elapsedSeconds) / PAR_SECONDS[difficulty]) * 0.5;
  const moveEfficiency = Math.min(1, PAR_MOVES[difficulty] / Math.max(1, moves));
  const moveFactor = 0.7 + 0.3 * moveEfficiency;
  return (1 + timeBonus) * moveFactor;
}

function calculatePoints(difficulty: Difficulty, maxTile: number, elapsedSeconds: number, moves: number): number {
  return Math.max(10, Math.round(BASE_POINTS[difficulty] * tileFactor(difficulty, maxTile) * performanceFactor(difficulty, elapsedSeconds, moves)));
}

router.post("/game-2048-games", async (req, res): Promise<void> => {
  const { profileId, difficulty, size, seed, dailyDate } = req.body as { profileId?: unknown; difficulty?: unknown; size?: unknown; seed?: unknown; dailyDate?: unknown };
  const diff = normalizeDifficulty(difficulty);
  if (typeof difficulty !== "string" || !DIFFICULTIES.includes(difficulty as Difficulty)) {
    res.status(400).json({ error: "difficulty must be 3x3, 4x4, 5x5, or 6x6" });
    return;
  }
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  const boardSize = Number.isInteger(size) ? Number(size) : SIZES[diff];
  if (boardSize !== SIZES[diff]) { res.status(400).json({ error: "size does not match difficulty" }); return; }
  const gameSeed = Number.isInteger(seed) && (seed as number) > 0 ? Math.min(2_147_483_647, seed as number) : randomInt(1, 2_147_483_647);
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(todayUtc());
    if (diff !== config.difficulty || gameSeed !== config.seed) {
      res.status(400).json({ error: "Daily challenge settings do not match today's puzzle" }); return;
    }
  }
  const [game] = await db.insert(game2048GamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    difficulty: diff,
    size: boardSize,
    seed: gameSeed,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, seed: gameSeed, createdAt: game.createdAt.toISOString() });
});

router.post("/game-2048-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, moves, score, maxTile, won } = req.body as { elapsedSeconds?: unknown; moves?: unknown; score?: unknown; maxTile?: unknown; won?: unknown };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      typeof moves !== "number" || !Number.isFinite(moves) || moves < 0 ||
      typeof score !== "number" || !Number.isFinite(score) || score < 0 ||
      typeof maxTile !== "number" || !Number.isFinite(maxTile) || maxTile < 0 ||
      typeof won !== "boolean") {
    res.status(400).json({ error: "elapsedSeconds, moves, score, maxTile, and won must be valid" });
    return;
  }

  const [existing] = await db.select().from(game2048GamesTable).where(eq(game2048GamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points ?? 0, xpEarned: existing.xpEarned ?? 0, gemsEarned: existing.gemsEarned ?? 0, elapsedSeconds: existing.elapsedSeconds, moves: existing.moves, score: existing.score, maxTile: existing.maxTile, won: (existing.maxTile ?? 0) >= TARGET_TILES[normalizeDifficulty(existing.difficulty)] });
    return;
  }

  const difficulty = DIFFICULTIES.includes(existing.difficulty as Difficulty)
    ? existing.difficulty as Difficulty
    : "4x4";
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  const safeMoves = Math.min(100000, Math.floor(moves));
  const safeScore = Math.min(1_000_000_000, Math.floor(score));
  const safeMaxTile = Math.min(1_048_576, Math.floor(maxTile));
  const reachedTarget = safeMaxTile >= TARGET_TILES[difficulty];
  const points = calculatePoints(difficulty, safeMaxTile, safeElapsed, safeMoves);
  const rewardFactor = Math.min(1.5, Math.max(0.5, performanceFactor(difficulty, safeElapsed, safeMoves) * tileFactor(difficulty, safeMaxTile)));
  const xpEarned = existing.profileId ? Math.max(1, Math.round(XP_REWARDS[difficulty] * rewardFactor)) : 0;
  const gemsEarned = existing.profileId ? Math.max(1, Math.round(GEM_REWARDS[difficulty] * rewardFactor)) : 0;

  let isPersonalBest = false;
  if (existing.profileId) {
    const [best] = await db.select({ score: game2048GamesTable.score })
      .from(game2048GamesTable)
      .where(and(
        eq(game2048GamesTable.profileId, existing.profileId),
        eq(game2048GamesTable.status, "completed"),
        eq(game2048GamesTable.difficulty, difficulty),
      ))
      .orderBy(desc(game2048GamesTable.score))
      .limit(1);
    isPersonalBest = !best || safeScore > (best.score ?? 0);
  }

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(game2048GamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      moves: safeMoves,
      score: safeScore,
      maxTile: safeMaxTile,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(game2048GamesTable.id, id), eq(game2048GamesTable.status, "active"))).returning();
    if (!completed) return null;
    if (existing.profileId && (xpEarned > 0 || gemsEarned > 0)) {
      await tx.update(profilesTable).set({
        gems: sql`gems + ${gemsEarned}`,
        xp: sql`xp + ${xpEarned}`,
      }).where(eq(profilesTable.id, existing.profileId));
    }
    return completed;
  });

  if (!game) {
    const [completed] = await db.select().from(game2048GamesTable).where(eq(game2048GamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, moves: completed.moves, score: completed.score, maxTile: completed.maxTile, won: (completed.maxTile ?? 0) >= TARGET_TILES[normalizeDifficulty(completed.difficulty)] });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveGame2048Challenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, moves: safeMoves, score: safeScore, maxTile: safeMaxTile, won: reachedTarget, isPersonalBest, completedAt: game.completedAt?.toISOString() });
});

export default router;
