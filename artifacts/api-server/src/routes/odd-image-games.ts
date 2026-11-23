import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, ne, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, oddImageChallengesTable, oddImageGamesTable, profilesTable } from "@workspace/db";
import {
  countOddImageCorrect,
  oddImageRound,
  ODD_IMAGE_LEVEL_ORDER,
  ODD_IMAGE_LEVELS,
  type OddImageLevel,
} from "@workspace/api-zod/odd-images";
import { expireChallengeIfDue, expireChallengesForProfile, isChallengeRecordHidden, CHALLENGE_INVITATION_TTL_MS, CHALLENGE_ACTIVE_TTL_MS } from "../utils/challenge-lifecycle";

const router: IRouter = Router();
const LEVELS = ODD_IMAGE_LEVEL_ORDER;
// Keep in sync with the image theme ids exposed by the client.
const THEMES = [
  "shapes", "jungle", "vehicles", "ocean", "space", "adventure",
  "peppa_pig", "paw_patrol", "sheriff", "doraemon", "chotta_bheem",
  "shinchan", "bluey", "tom_jerry", "superhero", "princess",
] as const;

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }

function normalizeLevel(value: unknown): OddImageLevel {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value) ? value as OddImageLevel : "easy";
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
    level: ODD_IMAGE_LEVEL_ORDER[digits % ODD_IMAGE_LEVEL_ORDER.length],
    theme: THEMES[Math.floor(digits / ODD_IMAGE_LEVEL_ORDER.length) % THEMES.length],
    seed: digits,
  };
}

function calculatePoints(level: OddImageLevel, elapsedSeconds: number, questions: number, correct: number): number {
  const config = ODD_IMAGE_LEVELS[level];
  if (questions <= 0 || correct <= 0) return 0;
  const accuracy = Math.min(1, correct / questions);
  const timeBonus = Math.max(0, (config.parSeconds - elapsedSeconds) / config.parSeconds) * 0.5;
  return Math.max(10, Math.round(config.basePoints * (0.5 + 0.5 * accuracy) * (1 + timeBonus)));
}

async function formatOddImageChallenge(id: number) {
  const [challenge] = await db.select().from(oddImageChallengesTable).where(eq(oddImageChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: oddImageGamesTable.points, elapsedSeconds: oddImageGamesTable.elapsedSeconds, correct: oddImageGamesTable.correct, questions: oddImageGamesTable.questions }).from(oddImageGamesTable).where(eq(oddImageGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: oddImageGamesTable.points, elapsedSeconds: oddImageGamesTable.elapsedSeconds, correct: oddImageGamesTable.correct, questions: oddImageGamesTable.questions }).from(oddImageGamesTable).where(eq(oddImageGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null,
    challengerCorrect: challengerGame?.correct ?? null, challengerQuestions: challengerGame?.questions ?? null,
    challengedCorrect: challengedGame?.correct ?? null, challengedQuestions: challengedGame?.questions ?? null };
}

router.post("/odd-image-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; level?: unknown; theme?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || typeof body.level !== "string" || !(LEVELS as readonly string[]).includes(body.level)) {
    res.status(400).json({ error: "Choose another player and a valid level." }); return;
  }
  const level = body.level as OddImageLevel;
  const theme = normalizeChallengeTheme(body.theme);
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + CHALLENGE_INVITATION_TTL_MS);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(oddImageChallengesTable).values({ challengerId, challengedId, level, theme, seed, expiresAt }).returning({ id: oddImageChallengesTable.id });
    const [game] = await tx.insert(oddImageGamesTable).values({ profileId: challengerId, level, theme, seed, challengeId: challenge.id, status: "active" }).returning({ id: oddImageGamesTable.id });
    await tx.update(oddImageChallengesTable).set({ challengerGameId: game.id }).where(eq(oddImageChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatOddImageChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/odd-image-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  await expireChallengesForProfile(oddImageChallengesTable, profileId);
  const rows = await db.select({ id: oddImageChallengesTable.id }).from(oddImageChallengesTable)
    .where(or(eq(oddImageChallengesTable.challengerId, profileId), eq(oddImageChallengesTable.challengedId, profileId)))
    .orderBy(desc(oddImageChallengesTable.createdAt)).limit(50);
  const details = (await Promise.all(rows.map(({ id }) => formatOddImageChallenge(id)))).filter((detail): detail is NonNullable<typeof detail> => !!detail && !isChallengeRecordHidden(detail));
  res.json(details);
});

router.get("/odd-image-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const [challenge] = await db.select().from(oddImageChallengesTable).where(eq(oddImageChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (await expireChallengeIfDue(oddImageChallengesTable, challenge)) {
    const [updated] = await db.select().from(oddImageChallengesTable).where(eq(oddImageChallengesTable.id, id));
    if (isChallengeRecordHidden(updated ?? { ...challenge, status: "expired" })) { res.status(410).json({ error: "This challenge has expired." }); return; }
  }
  res.json(await formatOddImageChallenge(id));
});

router.patch("/odd-image-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(oddImageChallengesTable).where(eq(oddImageChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (await expireChallengeIfDue(oddImageChallengesTable, challenge)) { res.status(410).json({ error: "This challenge has expired." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (body.action === "decline") {
    await db.update(oddImageChallengesTable).set({ status: "declined" }).where(eq(oddImageChallengesTable.id, id));
    res.json(await formatOddImageChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(oddImageGamesTable).values({ profileId, level: challenge.level, theme: challenge.theme, seed: challenge.seed, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(oddImageChallengesTable).set({ status: "accepted", challengedGameId: created.id, expiresAt: new Date(challenge.createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS) }).where(eq(oddImageChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatOddImageChallenge(id)), gameId: game.id });
});

async function resolveOddImageChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(oddImageChallengesTable).where(or(
    eq(oddImageChallengesTable.challengerGameId, gameId), eq(oddImageChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(oddImageGamesTable).where(eq(oddImageGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(oddImageGamesTable).where(eq(oddImageGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(oddImageChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(oddImageChallengesTable.id, challenge.id), eq(oddImageChallengesTable.status, "accepted"))).returning({ id: oddImageChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/odd-image-games/leaderboard", async (req, res): Promise<void> => {
  const level = typeof req.query.level === "string" && (LEVELS as readonly string[]).includes(req.query.level)
    ? req.query.level as OddImageLevel
    : null;
  const rows = await db.select({
    profileId: oddImageGamesTable.profileId,
    username: profilesTable.username,
    avatar: profilesTable.avatar,
    xp: profilesTable.xp,
    points: oddImageGamesTable.points,
  })
    .from(oddImageGamesTable)
    .innerJoin(profilesTable, eq(oddImageGamesTable.profileId, profilesTable.id))
    .where(level
      ? and(eq(oddImageGamesTable.status, "completed"), eq(oddImageGamesTable.level, level))
      : eq(oddImageGamesTable.status, "completed"));

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

router.get("/odd-image-games/daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/odd-image-games/daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: oddImageGamesTable.points, elapsedSeconds: oddImageGamesTable.elapsedSeconds })
    .from(oddImageGamesTable).where(and(eq(oddImageGamesTable.profileId, profileId), eq(oddImageGamesTable.dailyDate, todayUtc()), eq(oddImageGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/odd-image-games/daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: oddImageGamesTable.dailyDate }).from(oddImageGamesTable).where(and(
    eq(oddImageGamesTable.profileId, profileId), eq(oddImageGamesTable.status, "completed"),
    gte(oddImageGamesTable.dailyDate, `${month}-01`), lt(oddImageGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/odd-image-games/daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: oddImageGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: oddImageGamesTable.points, elapsedSeconds: oddImageGamesTable.elapsedSeconds })
    .from(oddImageGamesTable).innerJoin(profilesTable, eq(oddImageGamesTable.profileId, profilesTable.id))
    .where(and(eq(oddImageGamesTable.dailyDate, date), eq(oddImageGamesTable.status, "completed")))
    .orderBy(desc(oddImageGamesTable.points), asc(oddImageGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

router.post("/odd-image-games", async (req, res): Promise<void> => {
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
  const [game] = await db.insert(oddImageGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    level: safeLevel,
    theme: normalizeTheme(theme),
    seed,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

router.post("/odd-image-games/:id/complete", async (req, res): Promise<void> => {
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

  const [existing] = await db.select().from(oddImageGamesTable).where(eq(oddImageGamesTable.id, id));
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
  const config = ODD_IMAGE_LEVELS[level];
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  let safeQuestions = config.questions;
  let safeCorrect = 0;

  if (existing.seed != null) {
    if (!Array.isArray(answers) || answers.length === 0 || answers.some((answer) => !Number.isInteger(answer))) {
      res.status(400).json({ error: "answers must be an array of cell indexes" });
      return;
    }
    const round = oddImageRound(level, existing.seed);
    safeQuestions = round.length;
    safeCorrect = countOddImageCorrect(round, answers.slice(0, round.length));
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
    ? await db.select({ elapsedSeconds: oddImageGamesTable.elapsedSeconds })
        .from(oddImageGamesTable)
        .where(and(
          eq(oddImageGamesTable.profileId, existing.profileId),
          eq(oddImageGamesTable.level, level),
          eq(oddImageGamesTable.status, "completed"),
          ne(oddImageGamesTable.id, id),
        ))
        .orderBy(asc(oddImageGamesTable.elapsedSeconds))
        .limit(1)
    : [];
  const isPersonalBest = !best || safeElapsed < best.elapsedSeconds;

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(oddImageGamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      questions: safeQuestions,
      correct: safeCorrect,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(oddImageGamesTable.id, id), eq(oddImageGamesTable.status, "active"))).returning();
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
    const [completed] = await db.select().from(oddImageGamesTable).where(eq(oddImageGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, questions: completed.questions, correct: completed.correct });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveOddImageChallenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, questions: safeQuestions, correct: safeCorrect, isPersonalBest });
});

export default router;
