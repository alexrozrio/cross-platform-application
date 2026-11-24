import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, profilesTable, jumbleGamesTable, jumbleChallengesTable } from "@workspace/db";
import { expireChallengeIfDue, expireChallengesForProfile, isChallengeRecordHidden, CHALLENGE_INVITATION_TTL_MS, CHALLENGE_ACTIVE_TTL_MS } from "../utils/challenge-lifecycle";

const router: IRouter = Router();

const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
const QUESTIONS: Record<string, number> = { easy: 5, medium: 8, hard: 10, expert: 12 };

const BASE_POINTS = { easy: 300, medium: 650, hard: 1300, expert: 2400 } as const;
const PAR_SECONDS = { easy: 180, medium: 300, hard: 420, expert: 600 } as const;
const XP_REWARDS = { easy: 1, medium: 2, hard: 3, expert: 4 } as const;
const GEM_REWARDS = { easy: 1, medium: 2, hard: 3, expert: 5 } as const;

type Difficulty = (typeof DIFFICULTIES)[number];

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }

function normalizeDifficulty(value: unknown): Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value) ? value as Difficulty : "medium";
}

function getDailyConfig(date: string) {
  const digits = Number(date.replaceAll("-", ""));
  return {
    date,
    difficulty: DIFFICULTIES[digits % DIFFICULTIES.length],
    seed: digits,
  };
}

async function formatJumbleChallenge(id: number) {
  const [challenge] = await db.select().from(jumbleChallengesTable).where(eq(jumbleChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: jumbleGamesTable.points, score: jumbleGamesTable.score, correct: jumbleGamesTable.correct, elapsedSeconds: jumbleGamesTable.elapsedSeconds }).from(jumbleGamesTable).where(eq(jumbleGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: jumbleGamesTable.points, score: jumbleGamesTable.score, correct: jumbleGamesTable.correct, elapsedSeconds: jumbleGamesTable.elapsedSeconds }).from(jumbleGamesTable).where(eq(jumbleGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerScore: challengerGame?.score ?? null, challengedScore: challengedGame?.score ?? null,
    challengerCorrect: challengerGame?.correct ?? null, challengedCorrect: challengedGame?.correct ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null };
}

router.post("/jumble-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; difficulty?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  const difficulty = normalizeDifficulty(body.difficulty);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || typeof body.difficulty !== "string" || !DIFFICULTIES.includes(body.difficulty as Difficulty)) {
    res.status(400).json({ error: "Choose another player and a valid difficulty." }); return;
  }
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + CHALLENGE_INVITATION_TTL_MS);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(jumbleChallengesTable).values({ challengerId, challengedId, difficulty, questions: QUESTIONS[difficulty], seed, expiresAt }).returning({ id: jumbleChallengesTable.id });
    const [game] = await tx.insert(jumbleGamesTable).values({ profileId: challengerId, difficulty, questions: QUESTIONS[difficulty], seed, challengeId: challenge.id, status: "active" }).returning({ id: jumbleGamesTable.id });
    await tx.update(jumbleChallengesTable).set({ challengerGameId: game.id }).where(eq(jumbleChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatJumbleChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/jumble-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  await expireChallengesForProfile(jumbleChallengesTable, profileId);
  const rows = await db.select({ id: jumbleChallengesTable.id }).from(jumbleChallengesTable)
    .where(or(eq(jumbleChallengesTable.challengerId, profileId), eq(jumbleChallengesTable.challengedId, profileId)))
    .orderBy(desc(jumbleChallengesTable.createdAt)).limit(50);
  const details = (await Promise.all(rows.map(({ id }) => formatJumbleChallenge(id)))).filter((detail): detail is NonNullable<typeof detail> => !!detail && !isChallengeRecordHidden(detail));
  res.json(details);
});

router.get("/jumble-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const [challenge] = await db.select().from(jumbleChallengesTable).where(eq(jumbleChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (await expireChallengeIfDue(jumbleChallengesTable, challenge)) {
    const [updated] = await db.select().from(jumbleChallengesTable).where(eq(jumbleChallengesTable.id, id));
    if (isChallengeRecordHidden(updated ?? { ...challenge, status: "expired" })) { res.status(410).json({ error: "This challenge has expired." }); return; }
  }
  res.json(await formatJumbleChallenge(id));
});

router.patch("/jumble-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(jumbleChallengesTable).where(eq(jumbleChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (await expireChallengeIfDue(jumbleChallengesTable, challenge)) { res.status(410).json({ error: "This challenge has expired." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (body.action === "decline") {
    await db.update(jumbleChallengesTable).set({ status: "declined" }).where(eq(jumbleChallengesTable.id, id));
    res.json(await formatJumbleChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(jumbleGamesTable).values({ profileId, difficulty: challenge.difficulty, questions: challenge.questions, seed: challenge.seed, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(jumbleChallengesTable).set({ status: "accepted", challengedGameId: created.id, expiresAt: new Date(challenge.createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS) }).where(eq(jumbleChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatJumbleChallenge(id)), gameId: game.id });
});

async function resolveJumbleChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(jumbleChallengesTable).where(or(
    eq(jumbleChallengesTable.challengerGameId, gameId), eq(jumbleChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(jumbleGamesTable).where(eq(jumbleGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(jumbleGamesTable).where(eq(jumbleGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(jumbleChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(jumbleChallengesTable.id, challenge.id), eq(jumbleChallengesTable.status, "accepted"))).returning({ id: jumbleChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/jumble-games/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db.select({ profileId: jumbleGamesTable.profileId, username: profilesTable.username,
    avatar: profilesTable.avatar, xp: profilesTable.xp, points: jumbleGamesTable.points })
    .from(jumbleGamesTable).innerJoin(profilesTable, eq(jumbleGamesTable.profileId, profilesTable.id))
    .where(eq(jumbleGamesTable.status, "completed"));
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

router.get("/jumble-daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/jumble-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: jumbleGamesTable.points, score: jumbleGamesTable.score })
    .from(jumbleGamesTable).where(and(eq(jumbleGamesTable.profileId, profileId), eq(jumbleGamesTable.dailyDate, todayUtc()), eq(jumbleGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/jumble-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: jumbleGamesTable.dailyDate }).from(jumbleGamesTable).where(and(
    eq(jumbleGamesTable.profileId, profileId), eq(jumbleGamesTable.status, "completed"),
    gte(jumbleGamesTable.dailyDate, `${month}-01`), lt(jumbleGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/jumble-daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: jumbleGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: jumbleGamesTable.points, score: jumbleGamesTable.score, correct: jumbleGamesTable.correct, elapsedSeconds: jumbleGamesTable.elapsedSeconds })
    .from(jumbleGamesTable).innerJoin(profilesTable, eq(jumbleGamesTable.profileId, profilesTable.id))
    .where(and(eq(jumbleGamesTable.dailyDate, date), eq(jumbleGamesTable.status, "completed")))
    .orderBy(desc(jumbleGamesTable.points), asc(jumbleGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

// Points scale with accuracy (correct answers), a speed bonus against par
// time, and attempt efficiency (fewer wrong guesses score higher).
function accuracyFactor(questions: number, correct: number): number {
  if (questions <= 0) return 0.2;
  return 0.3 + 0.7 * Math.min(1, Math.max(0, correct / questions));
}

function performanceFactor(difficulty: Difficulty, elapsedSeconds: number, wrongAttempts: number, questions: number): number {
  const timeBonus = Math.max(0, (PAR_SECONDS[difficulty] - elapsedSeconds) / PAR_SECONDS[difficulty]) * 0.5;
  const efficiency = questions / Math.max(questions, questions + wrongAttempts);
  const attemptFactor = 0.7 + 0.3 * efficiency;
  return (1 + timeBonus) * attemptFactor;
}

function calculatePoints(difficulty: Difficulty, questions: number, correct: number, elapsedSeconds: number, wrongAttempts: number): number {
  return Math.max(10, Math.round(BASE_POINTS[difficulty] * accuracyFactor(questions, correct) * performanceFactor(difficulty, elapsedSeconds, wrongAttempts, questions)));
}

router.post("/jumble-games", async (req, res): Promise<void> => {
  const { profileId, difficulty, seed, dailyDate } = req.body as { profileId?: unknown; difficulty?: unknown; seed?: unknown; dailyDate?: unknown };
  const diff = normalizeDifficulty(difficulty);
  if (typeof difficulty !== "string" || !DIFFICULTIES.includes(difficulty as Difficulty)) {
    res.status(400).json({ error: "difficulty must be easy, medium, hard, or expert" });
    return;
  }
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  const questionCount = QUESTIONS[diff];
  const gameSeed = Number.isInteger(seed) && (seed as number) > 0 ? Math.min(2_147_483_647, seed as number) : randomInt(1, 2_147_483_647);
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(todayUtc());
    if (diff !== config.difficulty || gameSeed !== config.seed) {
      res.status(400).json({ error: "Daily challenge settings do not match today's puzzle" }); return;
    }
  }
  const [game] = await db.insert(jumbleGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    difficulty: diff,
    questions: questionCount,
    seed: gameSeed,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, seed: gameSeed, questions: questionCount, createdAt: game.createdAt.toISOString() });
});

router.post("/jumble-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, correct, wrongAttempts, score } = req.body as { elapsedSeconds?: unknown; correct?: unknown; wrongAttempts?: unknown; score?: unknown };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      typeof correct !== "number" || !Number.isFinite(correct) || correct < 0 ||
      typeof wrongAttempts !== "number" || !Number.isFinite(wrongAttempts) || wrongAttempts < 0 ||
      typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    res.status(400).json({ error: "elapsedSeconds, correct, wrongAttempts, and score must be valid" });
    return;
  }

  const [existing] = await db.select().from(jumbleGamesTable).where(eq(jumbleGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  const totalQuestions = existing.questions > 0 ? existing.questions : QUESTIONS[normalizeDifficulty(existing.difficulty)];
  const wonFlag = (correct: number) => correct * 2 >= totalQuestions;
  if (existing.status === "completed") {
    res.json({ points: existing.points ?? 0, xpEarned: existing.xpEarned ?? 0, gemsEarned: existing.gemsEarned ?? 0, elapsedSeconds: existing.elapsedSeconds, correct: existing.correct, wrongAttempts: existing.wrongAttempts, score: existing.score, won: wonFlag(existing.correct ?? 0) });
    return;
  }

  const difficulty = DIFFICULTIES.includes(existing.difficulty as Difficulty)
    ? existing.difficulty as Difficulty
    : "medium";
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  const safeCorrect = Math.min(totalQuestions, Math.floor(correct));
  const safeWrong = Math.min(100000, Math.floor(wrongAttempts));
  const safeScore = Math.min(1_000_000_000, Math.floor(score));
  const points = calculatePoints(difficulty, totalQuestions, safeCorrect, safeElapsed, safeWrong);
  const rewardFactor = Math.min(1.5, Math.max(0.5, performanceFactor(difficulty, safeElapsed, safeWrong, totalQuestions) * accuracyFactor(totalQuestions, safeCorrect)));
  const xpEarned = existing.profileId ? Math.max(1, Math.round(XP_REWARDS[difficulty] * rewardFactor)) : 0;
  const gemsEarned = existing.profileId ? Math.max(1, Math.round(GEM_REWARDS[difficulty] * rewardFactor)) : 0;
  const won = wonFlag(safeCorrect);

  let isPersonalBest = false;
  if (existing.profileId) {
    const [best] = await db.select({ score: jumbleGamesTable.score })
      .from(jumbleGamesTable)
      .where(and(
        eq(jumbleGamesTable.profileId, existing.profileId),
        eq(jumbleGamesTable.status, "completed"),
        eq(jumbleGamesTable.difficulty, difficulty),
      ))
      .orderBy(desc(jumbleGamesTable.score))
      .limit(1);
    isPersonalBest = !best || safeScore > (best.score ?? 0);
  }

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(jumbleGamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      correct: safeCorrect,
      wrongAttempts: safeWrong,
      score: safeScore,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(jumbleGamesTable.id, id), eq(jumbleGamesTable.status, "active"))).returning();
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
    const [completed] = await db.select().from(jumbleGamesTable).where(eq(jumbleGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, correct: completed.correct, wrongAttempts: completed.wrongAttempts, score: completed.score, won: wonFlag(completed.correct ?? 0) });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveJumbleChallenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, correct: safeCorrect, wrongAttempts: safeWrong, score: safeScore, won, isPersonalBest, completedAt: game.completedAt?.toISOString() });
});

export default router;
