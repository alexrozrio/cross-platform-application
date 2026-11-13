import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, profilesTable, quizGamesTable, quizChallengesTable } from "@workspace/db";
import {
  countQuizCorrect, dailyQuizConfig as sharedDailyQuizConfig, pickQuestions, quizBank,
  QUIZ_BASE_POINTS, QUIZ_GEM_REWARDS, QUIZ_LEVEL_IDS, QUIZ_PAR_SECONDS,
  QUIZ_QUESTIONS_PER_LEVEL, QUIZ_SUBJECT_IDS, QUIZ_XP_REWARDS,
  type QuizLevel, type QuizSubject,
} from "@workspace/api-zod/quiz";

const router: IRouter = Router();

const SUBJECTS = QUIZ_SUBJECT_IDS;
const LEVELS = QUIZ_LEVEL_IDS;
const QUESTIONS_PER_LEVEL = QUIZ_QUESTIONS_PER_LEVEL;
const PAR_SECONDS = QUIZ_PAR_SECONDS;
const BASE_POINTS = QUIZ_BASE_POINTS;
const XP_REWARDS = QUIZ_XP_REWARDS;
const GEM_REWARDS = QUIZ_GEM_REWARDS;

type Subject = QuizSubject;
type Level = QuizLevel;

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }

function normalizeSubject(value: unknown): Subject {
  return typeof value === "string" && (SUBJECTS as readonly string[]).includes(value) ? value as Subject : "science";
}

function normalizeLevel(value: unknown): Level {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value) ? value as Level : "easy";
}

function getDailyConfig(subject: Subject, date: string) {
  return sharedDailyQuizConfig(subject, date);
}

async function formatQuizChallenge(id: number) {
  const [challenge] = await db.select().from(quizChallengesTable).where(eq(quizChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: quizGamesTable.points, correct: quizGamesTable.correct, questions: quizGamesTable.questions, elapsedSeconds: quizGamesTable.elapsedSeconds }).from(quizGamesTable).where(eq(quizGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: quizGamesTable.points, correct: quizGamesTable.correct, questions: quizGamesTable.questions, elapsedSeconds: quizGamesTable.elapsedSeconds }).from(quizGamesTable).where(eq(quizGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerCorrect: challengerGame?.correct ?? null, challengerQuestions: challengerGame?.questions ?? null,
    challengedCorrect: challengedGame?.correct ?? null, challengedQuestions: challengedGame?.questions ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null };
}

router.post("/quiz-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; subject?: unknown; level?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  const subject = normalizeSubject(body.subject);
  const level = normalizeLevel(body.level);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId) {
    res.status(400).json({ error: "Choose another player to challenge." }); return;
  }
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(quizChallengesTable).values({ challengerId, challengedId, subject, level, seed, expiresAt }).returning({ id: quizChallengesTable.id });
    const [game] = await tx.insert(quizGamesTable).values({ profileId: challengerId, subject, level, seed, challengeId: challenge.id, status: "active" }).returning({ id: quizGamesTable.id });
    await tx.update(quizChallengesTable).set({ challengerGameId: game.id }).where(eq(quizChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatQuizChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/quiz-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  const rows = await db.select({ id: quizChallengesTable.id }).from(quizChallengesTable)
    .where(or(eq(quizChallengesTable.challengerId, profileId), eq(quizChallengesTable.challengedId, profileId)))
    .orderBy(desc(quizChallengesTable.createdAt)).limit(50);
  for (const { id } of rows) {
    const [challenge] = await db.select({ status: quizChallengesTable.status, expiresAt: quizChallengesTable.expiresAt }).from(quizChallengesTable).where(eq(quizChallengesTable.id, id));
    if (challenge?.status === "pending" && challenge.expiresAt.getTime() <= Date.now()) {
      await db.update(quizChallengesTable).set({ status: "expired" }).where(eq(quizChallengesTable.id, id));
    }
  }
  res.json((await Promise.all(rows.map(({ id }) => formatQuizChallenge(id)))).filter(Boolean));
});

router.get("/quiz-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const detail = await formatQuizChallenge(id);
  if (!detail) { res.status(404).json({ error: "Challenge not found." }); return; }
  res.json(detail);
});

router.patch("/quiz-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(quizChallengesTable).where(eq(quizChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await db.update(quizChallengesTable).set({ status: "expired" }).where(eq(quizChallengesTable.id, id));
    res.status(410).json({ error: "This challenge has expired." }); return;
  }
  if (body.action === "decline") {
    await db.update(quizChallengesTable).set({ status: "declined" }).where(eq(quizChallengesTable.id, id));
    res.json(await formatQuizChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(quizGamesTable).values({ profileId, subject: challenge.subject, level: challenge.level, seed: challenge.seed, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(quizChallengesTable).set({ status: "accepted", challengedGameId: created.id }).where(eq(quizChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatQuizChallenge(id)), gameId: game.id });
});

async function resolveQuizChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(quizChallengesTable).where(or(
    eq(quizChallengesTable.challengerGameId, gameId), eq(quizChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(quizGamesTable).where(eq(quizGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(quizGamesTable).where(eq(quizGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(quizChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(quizChallengesTable.id, challenge.id), eq(quizChallengesTable.status, "accepted"))).returning({ id: quizChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/quiz-games/leaderboard", async (req, res): Promise<void> => {
  const subject = normalizeSubject(req.query.subject);
  const rows = await db.select({ profileId: quizGamesTable.profileId, username: profilesTable.username,
    avatar: profilesTable.avatar, xp: profilesTable.xp, points: quizGamesTable.points })
    .from(quizGamesTable).innerJoin(profilesTable, eq(quizGamesTable.profileId, profilesTable.id))
    .where(and(eq(quizGamesTable.status, "completed"), eq(quizGamesTable.subject, subject)));
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

router.get("/quiz-daily-challenge", (req, res): void => {
  res.json(getDailyConfig(normalizeSubject(req.query.subject), todayUtc()));
});

router.get("/quiz-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  const subject = normalizeSubject(req.query.subject);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: quizGamesTable.points, elapsedSeconds: quizGamesTable.elapsedSeconds })
    .from(quizGamesTable).where(and(eq(quizGamesTable.profileId, profileId), eq(quizGamesTable.subject, subject), eq(quizGamesTable.dailyDate, todayUtc()), eq(quizGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), subject, completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/quiz-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  const subject = normalizeSubject(req.query.subject);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: quizGamesTable.dailyDate }).from(quizGamesTable).where(and(
    eq(quizGamesTable.profileId, profileId), eq(quizGamesTable.subject, subject), eq(quizGamesTable.status, "completed"),
    gte(quizGamesTable.dailyDate, `${month}-01`), lt(quizGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, subject, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/quiz-daily-challenge/leaderboard", async (req, res): Promise<void> => {
  const subject = normalizeSubject(req.query.subject);
  const date = todayUtc();
  const rows = await db.select({ profileId: quizGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: quizGamesTable.points, elapsedSeconds: quizGamesTable.elapsedSeconds, correct: quizGamesTable.correct, questions: quizGamesTable.questions })
    .from(quizGamesTable).innerJoin(profilesTable, eq(quizGamesTable.profileId, profilesTable.id))
    .where(and(eq(quizGamesTable.subject, subject), eq(quizGamesTable.dailyDate, date), eq(quizGamesTable.status, "completed")))
    .orderBy(desc(quizGamesTable.points), asc(quizGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, subject, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

// Points: accuracy dominates (50–100% of a level-scaled base), plus up to +50%
// speed bonus vs the level's par time. Finishing with 0 correct scores 0.
function calculatePoints(level: Level, elapsedSeconds: number, questions: number, correct: number): number {
  if (questions <= 0 || correct <= 0) return 0;
  const accuracy = Math.min(1, correct / questions);
  const timeBonus = Math.max(0, (PAR_SECONDS[level] - elapsedSeconds) / PAR_SECONDS[level]) * 0.5;
  return Math.max(10, Math.round(BASE_POINTS[level] * (0.5 + 0.5 * accuracy) * (1 + timeBonus)));
}

router.post("/quiz-games", async (req, res): Promise<void> => {
  const { profileId, subject, level, dailyDate, seed } = req.body as { profileId?: unknown; subject?: unknown; level?: unknown; dailyDate?: unknown; seed?: unknown };
  const safeSubject = normalizeSubject(subject);
  const safeLevel = normalizeLevel(level);
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  const safeSeed = dailyDate === todayUtc() ? getDailyConfig(safeSubject, todayUtc()).seed
    : typeof seed === "number" && Number.isInteger(seed) && seed > 0 ? seed : null;
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(safeSubject, todayUtc());
    if (safeLevel !== config.level) {
      res.status(400).json({ error: "Daily challenge settings do not match today's quiz" }); return;
    }
  }
  const [game] = await db.insert(quizGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    subject: safeSubject,
    level: safeLevel,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    seed: safeSeed,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

router.post("/quiz-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, questions, correct, answers } = req.body as { elapsedSeconds?: unknown; questions?: unknown; correct?: unknown; answers?: unknown };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      typeof questions !== "number" || !Number.isFinite(questions) || questions <= 0 || questions > 100 ||
      typeof correct !== "number" || !Number.isFinite(correct) || correct < 0 || correct > questions ||
      (answers !== undefined && !Array.isArray(answers))) {
    res.status(400).json({ error: "elapsedSeconds, questions, correct, and answers must be valid" });
    return;
  }

  const [existing] = await db.select().from(quizGamesTable).where(eq(quizGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points ?? 0, xpEarned: existing.xpEarned ?? 0, gemsEarned: existing.gemsEarned ?? 0, elapsedSeconds: existing.elapsedSeconds, questions: existing.questions, correct: existing.correct });
    return;
  }

  const level = normalizeLevel(existing.level);
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));

  // Authoritative scoring: when the game row carries a seed and the client sent
  // its answers, regenerate the exact question set and count correct options.
  // Falls back to the client-reported count for legacy rows without a seed.
  let safeQuestions = Math.min(QUESTIONS_PER_LEVEL[level], Math.floor(questions));
  let safeCorrect = Math.min(safeQuestions, Math.floor(correct));
  if (existing.seed != null && Array.isArray(answers)) {
    const subject = normalizeSubject(existing.subject);
    const round = pickQuestions(quizBank(subject, level), QUESTIONS_PER_LEVEL[level], existing.seed);
    if (round.length > 0) {
      safeQuestions = Math.min(round.length, Math.max(1, Math.floor(questions)));
      safeCorrect = Math.min(safeQuestions, countQuizCorrect(round.slice(0, safeQuestions), answers));
    }
  }
  const points = calculatePoints(level, safeElapsed, safeQuestions, safeCorrect);
  const xpEarned = points > 0 ? XP_REWARDS[level] : 0;
  const gemsEarned = points > 0 ? GEM_REWARDS[level] : 0;

  await db.transaction(async (tx) => {
    await tx.update(quizGamesTable).set({
      status: "completed", elapsedSeconds: safeElapsed, questions: safeQuestions, correct: safeCorrect,
      points, xpEarned, gemsEarned, completedAt: new Date(),
    }).where(eq(quizGamesTable.id, id));
    if (existing.profileId && points > 0) {
      await tx.update(profilesTable).set({
        xp: sql`xp + ${xpEarned}`,
        gems: sql`gems + ${gemsEarned}`,
      }).where(eq(profilesTable.id, existing.profileId));
    }
  });

  await resolveQuizChallenge(id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, questions: safeQuestions, correct: safeCorrect });
});

export default router;
