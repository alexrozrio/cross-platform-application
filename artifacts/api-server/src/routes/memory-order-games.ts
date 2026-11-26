import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, ne, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, memoryOrderChallengesTable, memoryOrderGamesTable, profilesTable } from "@workspace/db";
import {
  countMemoryOrderCorrect,
  memoryOrderRound,
  MEMORY_ORDER_LEVEL_ORDER,
  MEMORY_ORDER_LEVELS,
  type MemoryOrderLevel,
} from "@workspace/api-zod/memory-order";
import { expireChallengeIfDue, expireChallengesForProfile, isChallengeRecordHidden, CHALLENGE_INVITATION_TTL_MS, CHALLENGE_ACTIVE_TTL_MS } from "../utils/challenge-lifecycle";

const router: IRouter = Router();
const LEVELS = MEMORY_ORDER_LEVEL_ORDER;
// Keep in sync with the image theme ids exposed by the client.
const THEMES = [
  "shapes", "jungle", "vehicles", "ocean", "space", "adventure",
  "peppa_pig", "paw_patrol", "sheriff", "doraemon", "chotta_bheem",
  "shinchan", "bluey", "tom_jerry", "superhero", "princess",
] as const;

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }

function normalizeLevel(value: unknown): MemoryOrderLevel {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value) ? value as MemoryOrderLevel : "easy";
}

function normalizeTheme(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 64) : "shapes";
}

function normalizeChallengeTheme(value: unknown): string {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value) ? value : THEMES[0];
}

function getDailyConfig(date: string) {
  const digits = Number(date.replaceAll("-", ""));
  return {
    date,
    level: MEMORY_ORDER_LEVEL_ORDER[digits % MEMORY_ORDER_LEVEL_ORDER.length],
    theme: THEMES[Math.floor(digits / MEMORY_ORDER_LEVEL_ORDER.length) % THEMES.length],
    seed: digits,
  };
}

function calculatePoints(level: MemoryOrderLevel, elapsedSeconds: number, questions: number, correct: number): number {
  const config = MEMORY_ORDER_LEVELS[level];
  if (questions <= 0 || correct <= 0) return 0;
  const accuracy = Math.min(1, correct / questions);
  const timeBonus = Math.max(0, (config.parSeconds - elapsedSeconds) / config.parSeconds) * 0.5;
  return Math.max(10, Math.round(config.basePoints * (0.5 + 0.5 * accuracy) * (1 + timeBonus)));
}

async function formatMemoryOrderChallenge(id: number) {
  const [challenge] = await db.select().from(memoryOrderChallengesTable).where(eq(memoryOrderChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: memoryOrderGamesTable.points, elapsedSeconds: memoryOrderGamesTable.elapsedSeconds, correct: memoryOrderGamesTable.correct, questions: memoryOrderGamesTable.questions }).from(memoryOrderGamesTable).where(eq(memoryOrderGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: memoryOrderGamesTable.points, elapsedSeconds: memoryOrderGamesTable.elapsedSeconds, correct: memoryOrderGamesTable.correct, questions: memoryOrderGamesTable.questions }).from(memoryOrderGamesTable).where(eq(memoryOrderGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null,
    challengerCorrect: challengerGame?.correct ?? null, challengerQuestions: challengerGame?.questions ?? null,
    challengedCorrect: challengedGame?.correct ?? null, challengedQuestions: challengedGame?.questions ?? null };
}

router.post("/memory-order-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; level?: unknown; theme?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || typeof body.level !== "string" || !(LEVELS as readonly string[]).includes(body.level)) {
    res.status(400).json({ error: "Choose another player and a valid level." }); return;
  }
  const level = body.level as MemoryOrderLevel;
  const theme = normalizeChallengeTheme(body.theme);
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + CHALLENGE_INVITATION_TTL_MS);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(memoryOrderChallengesTable).values({ challengerId, challengedId, level, theme, seed, expiresAt }).returning({ id: memoryOrderChallengesTable.id });
    const [game] = await tx.insert(memoryOrderGamesTable).values({ profileId: challengerId, level, theme, seed, challengeId: challenge.id, status: "active" }).returning({ id: memoryOrderGamesTable.id });
    await tx.update(memoryOrderChallengesTable).set({ challengerGameId: game.id }).where(eq(memoryOrderChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatMemoryOrderChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/memory-order-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  await expireChallengesForProfile(memoryOrderChallengesTable, profileId);
  const rows = await db.select({ id: memoryOrderChallengesTable.id }).from(memoryOrderChallengesTable)
    .where(or(eq(memoryOrderChallengesTable.challengerId, profileId), eq(memoryOrderChallengesTable.challengedId, profileId)))
    .orderBy(desc(memoryOrderChallengesTable.createdAt)).limit(50);
  const details = (await Promise.all(rows.map(({ id }) => formatMemoryOrderChallenge(id)))).filter((detail): detail is NonNullable<typeof detail> => !!detail && !isChallengeRecordHidden(detail));
  res.json(details);
});

router.get("/memory-order-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const [challenge] = await db.select().from(memoryOrderChallengesTable).where(eq(memoryOrderChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (await expireChallengeIfDue(memoryOrderChallengesTable, challenge)) {
    const [updated] = await db.select().from(memoryOrderChallengesTable).where(eq(memoryOrderChallengesTable.id, id));
    if (isChallengeRecordHidden(updated ?? { ...challenge, status: "expired" })) { res.status(410).json({ error: "This challenge has expired." }); return; }
  }
  res.json(await formatMemoryOrderChallenge(id));
});

router.patch("/memory-order-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(memoryOrderChallengesTable).where(eq(memoryOrderChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (await expireChallengeIfDue(memoryOrderChallengesTable, challenge)) { res.status(410).json({ error: "This challenge has expired." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (body.action === "decline") {
    await db.update(memoryOrderChallengesTable).set({ status: "declined" }).where(eq(memoryOrderChallengesTable.id, id));
    res.json(await formatMemoryOrderChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(memoryOrderGamesTable).values({ profileId, level: challenge.level, theme: challenge.theme, seed: challenge.seed, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(memoryOrderChallengesTable).set({ status: "accepted", challengedGameId: created.id, expiresAt: new Date(challenge.createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS) }).where(eq(memoryOrderChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatMemoryOrderChallenge(id)), gameId: game.id });
});

async function resolveMemoryOrderChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(memoryOrderChallengesTable).where(or(
    eq(memoryOrderChallengesTable.challengerGameId, gameId), eq(memoryOrderChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(memoryOrderGamesTable).where(eq(memoryOrderGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(memoryOrderGamesTable).where(eq(memoryOrderGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(memoryOrderChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(memoryOrderChallengesTable.id, challenge.id), eq(memoryOrderChallengesTable.status, "accepted"))).returning({ id: memoryOrderChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/memory-order-games/leaderboard", async (req, res): Promise<void> => {
  const level = typeof req.query.level === "string" && (LEVELS as readonly string[]).includes(req.query.level)
    ? req.query.level as MemoryOrderLevel
    : null;
  const rows = await db.select({
    profileId: memoryOrderGamesTable.profileId,
    username: profilesTable.username,
    avatar: profilesTable.avatar,
    xp: profilesTable.xp,
    points: memoryOrderGamesTable.points,
  })
    .from(memoryOrderGamesTable)
    .innerJoin(profilesTable, eq(memoryOrderGamesTable.profileId, profilesTable.id))
    .where(level
      ? and(eq(memoryOrderGamesTable.status, "completed"), eq(memoryOrderGamesTable.level, level))
      : eq(memoryOrderGamesTable.status, "completed"));

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

router.get("/memory-order-games/daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/memory-order-games/daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: memoryOrderGamesTable.points, elapsedSeconds: memoryOrderGamesTable.elapsedSeconds })
    .from(memoryOrderGamesTable).where(and(eq(memoryOrderGamesTable.profileId, profileId), eq(memoryOrderGamesTable.dailyDate, todayUtc()), eq(memoryOrderGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/memory-order-games/daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: memoryOrderGamesTable.dailyDate }).from(memoryOrderGamesTable).where(and(
    eq(memoryOrderGamesTable.profileId, profileId), eq(memoryOrderGamesTable.status, "completed"),
    gte(memoryOrderGamesTable.dailyDate, `${month}-01`), lt(memoryOrderGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/memory-order-games/daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: memoryOrderGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: memoryOrderGamesTable.points, elapsedSeconds: memoryOrderGamesTable.elapsedSeconds })
    .from(memoryOrderGamesTable).innerJoin(profilesTable, eq(memoryOrderGamesTable.profileId, profilesTable.id))
    .where(and(eq(memoryOrderGamesTable.dailyDate, date), eq(memoryOrderGamesTable.status, "completed")))
    .orderBy(desc(memoryOrderGamesTable.points), asc(memoryOrderGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

router.post("/memory-order-games", async (req, res): Promise<void> => {
  const { profileId, level, theme, seed, dailyDate } = req.body as { profileId?: unknown; level?: unknown; theme?: unknown; seed?: unknown; dailyDate?: unknown };
  const safeLevel = normalizeLevel(level);
  if (typeof level !== "string" || !(LEVELS as readonly string[]).includes(level)) {
    res.status(400).json({ error: "level must be easy, medium, hard, or expert" });
    return;
  }
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed <= 0 || seed > 2_147_483_647) {
    res.status(400).json({ error: "seed must be a positive integer" });
    return;
  }
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(todayUtc());
    if (safeLevel !== config.level || normalizeTheme(theme) !== config.theme || seed !== config.seed) {
      res.status(400).json({ error: "Daily challenge settings do not match today's puzzle" }); return;
    }
  }
  const [game] = await db.insert(memoryOrderGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    level: safeLevel,
    theme: normalizeTheme(theme),
    seed,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

router.post("/memory-order-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, questions, correct, answers } = req.body as {
    elapsedSeconds?: unknown;
    questions?: unknown;
    correct?: unknown;
    answers?: unknown;
  };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    res.status(400).json({ error: "elapsedSeconds must be a non-negative number" });
    return;
  }

  const [existing] = await db.select().from(memoryOrderGamesTable).where(eq(memoryOrderGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({
      points: existing.points ?? 0,
      xpEarned: existing.xpEarned ?? 0,
      gemsEarned: existing.gemsEarned ?? 0,
      elapsedSeconds: existing.elapsedSeconds,
      questions: existing.questions,
      correct: existing.correct,
    });
    return;
  }

  const level = normalizeLevel(existing.level);
  const config = MEMORY_ORDER_LEVELS[level];
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  let safeQuestions = config.questions;
  let safeCorrect = 0;

  if (existing.seed != null) {
    if (!Array.isArray(answers) || answers.length === 0 ||
        answers.some((answer) => !Array.isArray(answer) || answer.some((value) => !Number.isInteger(value)))) {
      res.status(400).json({ error: "answers must be an array of tapped-value sequences" });
      return;
    }
    const round = memoryOrderRound(level, existing.seed);
    safeQuestions = round.length;
    safeCorrect = countMemoryOrderCorrect(round, answers.slice(0, round.length) as number[][]);
  } else {
    if (typeof questions !== "number" || !Number.isFinite(questions) || questions <= 0 || questions > 100 ||
        typeof correct !== "number" || !Number.isFinite(correct) || correct < 0 || correct > questions) {
      res.status(400).json({ error: "questions and correct must be valid" });
      return;
    }
    safeQuestions = Math.min(config.questions, Math.floor(questions));
    safeCorrect = Math.min(safeQuestions, Math.floor(correct));
  }

  const points = calculatePoints(level, safeElapsed, safeQuestions, safeCorrect);
  const xpEarned = points > 0 ? config.xp : 0;
  const gemsEarned = points > 0 ? config.gems : 0;
  const [best] = existing.profileId
    ? await db.select({ elapsedSeconds: memoryOrderGamesTable.elapsedSeconds })
        .from(memoryOrderGamesTable)
        .where(and(
          eq(memoryOrderGamesTable.profileId, existing.profileId),
          eq(memoryOrderGamesTable.level, level),
          eq(memoryOrderGamesTable.status, "completed"),
          ne(memoryOrderGamesTable.id, id),
        ))
        .orderBy(asc(memoryOrderGamesTable.elapsedSeconds))
        .limit(1)
    : [];
  const isPersonalBest = !best || safeElapsed < best.elapsedSeconds;

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(memoryOrderGamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      questions: safeQuestions,
      correct: safeCorrect,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(memoryOrderGamesTable.id, id), eq(memoryOrderGamesTable.status, "active"))).returning();
    if (!completed) return null;
    if (existing.profileId && points > 0) {
      await tx.update(profilesTable).set({
        xp: sql`xp + ${xpEarned}`,
        gems: sql`gems + ${gemsEarned}`,
      }).where(eq(profilesTable.id, existing.profileId));
    }
    return completed;
  });

  if (!game) {
    const [completed] = await db.select().from(memoryOrderGamesTable).where(eq(memoryOrderGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, questions: completed.questions, correct: completed.correct });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveMemoryOrderChallenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, questions: safeQuestions, correct: safeCorrect, isPersonalBest });
});

export default router;
