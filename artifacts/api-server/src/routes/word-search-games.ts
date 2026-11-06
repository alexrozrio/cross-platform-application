import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, profilesTable, wordSearchGamesTable, wordSearchChallengesTable } from "@workspace/db";

const router: IRouter = Router();

const DIFFICULTIES = ["beginner", "easy", "medium", "hard"] as const;
const THEMES = ["animals", "food", "ocean", "nature", "space", "sports", "weather", "music", "travel", "school", "icon-shapes", "icon-jungle", "icon-vehicles", "icon-ocean", "icon-space", "icon-adventure", "icon-peppa_pig", "icon-paw_patrol", "icon-sheriff", "icon-doraemon", "icon-chotta_bheem", "icon-shinchan", "icon-bluey", "icon-tom_jerry", "icon-superhero", "icon-princess"] as const;
const BASE_POINTS = { beginner: 120, easy: 280, medium: 650, hard: 1300 } as const;
const PAR_SECONDS = { beginner: 120, easy: 240, medium: 420, hard: 720 } as const;
const MIN_TRIES = { beginner: 6, easy: 8, medium: 10, hard: 12 } as const;
const XP_REWARDS = { beginner: 1, easy: 1, medium: 2, hard: 3 } as const;
const GEM_REWARDS = { beginner: 1, easy: 2, medium: 3, hard: 4 } as const;

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }
function getDailyConfig(date: string) {
  const seed = Number(date.replaceAll("-", ""));
  return { date, difficulty: DIFFICULTIES[seed % DIFFICULTIES.length], theme: THEMES[Math.floor(seed / 7) % THEMES.length], seed };
}

async function formatWordSearchChallenge(id: number) {
  const [challenge] = await db.select().from(wordSearchChallengesTable).where(eq(wordSearchChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: wordSearchGamesTable.points, elapsedSeconds: wordSearchGamesTable.elapsedSeconds }).from(wordSearchGamesTable).where(eq(wordSearchGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: wordSearchGamesTable.points, elapsedSeconds: wordSearchGamesTable.elapsedSeconds }).from(wordSearchGamesTable).where(eq(wordSearchGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null };
}

router.post("/word-search-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; difficulty?: unknown; theme?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || typeof body.difficulty !== "string" || !DIFFICULTIES.includes(body.difficulty as (typeof DIFFICULTIES)[number])
    || typeof body.theme !== "string" || !THEMES.includes(body.theme as (typeof THEMES)[number])) {
    res.status(400).json({ error: "Choose another player, a valid difficulty, and a valid theme." }); return;
  }
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(wordSearchChallengesTable).values({ challengerId, challengedId, difficulty: body.difficulty as string, theme: body.theme as string, seed, expiresAt }).returning({ id: wordSearchChallengesTable.id });
    const [game] = await tx.insert(wordSearchGamesTable).values({ profileId: challengerId, difficulty: body.difficulty as string, theme: body.theme as string, challengeId: challenge.id, status: "active" }).returning({ id: wordSearchGamesTable.id });
    await tx.update(wordSearchChallengesTable).set({ challengerGameId: game.id }).where(eq(wordSearchChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatWordSearchChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/word-search-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  const rows = await db.select({ id: wordSearchChallengesTable.id }).from(wordSearchChallengesTable)
    .where(or(eq(wordSearchChallengesTable.challengerId, profileId), eq(wordSearchChallengesTable.challengedId, profileId)))
    .orderBy(desc(wordSearchChallengesTable.createdAt)).limit(50);
  for (const { id } of rows) {
    const [challenge] = await db.select({ status: wordSearchChallengesTable.status, expiresAt: wordSearchChallengesTable.expiresAt }).from(wordSearchChallengesTable).where(eq(wordSearchChallengesTable.id, id));
    if (challenge?.status === "pending" && challenge.expiresAt.getTime() <= Date.now()) {
      await db.update(wordSearchChallengesTable).set({ status: "expired" }).where(eq(wordSearchChallengesTable.id, id));
    }
  }
  res.json((await Promise.all(rows.map(({ id }) => formatWordSearchChallenge(id)))).filter(Boolean));
});

router.get("/word-search-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const detail = await formatWordSearchChallenge(id);
  if (!detail) { res.status(404).json({ error: "Challenge not found." }); return; }
  res.json(detail);
});

router.patch("/word-search-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(wordSearchChallengesTable).where(eq(wordSearchChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await db.update(wordSearchChallengesTable).set({ status: "expired" }).where(eq(wordSearchChallengesTable.id, id));
    res.status(410).json({ error: "This challenge has expired." }); return;
  }
  if (body.action === "decline") {
    await db.update(wordSearchChallengesTable).set({ status: "declined" }).where(eq(wordSearchChallengesTable.id, id));
    res.json(await formatWordSearchChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(wordSearchGamesTable).values({ profileId, difficulty: challenge.difficulty, theme: challenge.theme, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(wordSearchChallengesTable).set({ status: "accepted", challengedGameId: created.id }).where(eq(wordSearchChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatWordSearchChallenge(id)), gameId: game.id });
});

async function resolveWordSearchChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(wordSearchChallengesTable).where(or(
    eq(wordSearchChallengesTable.challengerGameId, gameId), eq(wordSearchChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(wordSearchGamesTable).where(eq(wordSearchGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(wordSearchGamesTable).where(eq(wordSearchGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(wordSearchChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(wordSearchChallengesTable.id, challenge.id), eq(wordSearchChallengesTable.status, "accepted"))).returning({ id: wordSearchChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/word-search-games/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db.select({ profileId: wordSearchGamesTable.profileId, username: profilesTable.username,
    avatar: profilesTable.avatar, xp: profilesTable.xp, points: wordSearchGamesTable.points })
    .from(wordSearchGamesTable).innerJoin(profilesTable, eq(wordSearchGamesTable.profileId, profilesTable.id))
    .where(eq(wordSearchGamesTable.status, "completed"));
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

router.get("/word-search-daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/word-search-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: wordSearchGamesTable.points, elapsedSeconds: wordSearchGamesTable.elapsedSeconds })
    .from(wordSearchGamesTable).where(and(eq(wordSearchGamesTable.profileId, profileId), eq(wordSearchGamesTable.dailyDate, todayUtc()), eq(wordSearchGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/word-search-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: wordSearchGamesTable.dailyDate }).from(wordSearchGamesTable).where(and(
    eq(wordSearchGamesTable.profileId, profileId), eq(wordSearchGamesTable.status, "completed"),
    gte(wordSearchGamesTable.dailyDate, `${month}-01`), lt(wordSearchGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/word-search-daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: wordSearchGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: wordSearchGamesTable.points, elapsedSeconds: wordSearchGamesTable.elapsedSeconds })
    .from(wordSearchGamesTable).innerJoin(profilesTable, eq(wordSearchGamesTable.profileId, profilesTable.id))
    .where(and(eq(wordSearchGamesTable.dailyDate, date), eq(wordSearchGamesTable.status, "completed")))
    .orderBy(desc(wordSearchGamesTable.points), asc(wordSearchGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

// Up to +50% for speed; extra tries reduce points by 2.5% each and each hint by 20%.
function calculatePoints(difficulty: (typeof DIFFICULTIES)[number], elapsedSeconds: number, tries: number, tipsUsed: number): number {
  const timeBonus = Math.max(0, (PAR_SECONDS[difficulty] - elapsedSeconds) / PAR_SECONDS[difficulty]) * 0.5;
  const tryPenalty = Math.max(0.45, 1 - Math.max(0, tries - MIN_TRIES[difficulty]) * 0.025);
  const tipPenalty = Math.max(0.6, 1 - tipsUsed * 0.2);
  return Math.max(10, Math.round(BASE_POINTS[difficulty] * (1 + timeBonus) * tryPenalty * tipPenalty));
}

router.post("/word-search-games", async (req, res): Promise<void> => {
  const { profileId, difficulty, theme, dailyDate } = req.body as { profileId?: unknown; difficulty?: unknown; theme?: unknown; dailyDate?: unknown };
  if (typeof difficulty !== "string" || !DIFFICULTIES.includes(difficulty as (typeof DIFFICULTIES)[number])) {
    res.status(400).json({ error: "difficulty must be beginner, easy, medium, or hard" });
    return;
  }
  if (typeof theme !== "string" || !THEMES.includes(theme as (typeof THEMES)[number])) {
    res.status(400).json({ error: "theme is invalid" });
    return;
  }
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(todayUtc());
    if (difficulty !== config.difficulty || theme !== config.theme) { res.status(400).json({ error: "Daily challenge settings do not match today's puzzle" }); return; }
  }
  const [game] = await db.insert(wordSearchGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    difficulty,
    theme,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

router.post("/word-search-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, tries, tipsUsed } = req.body as { elapsedSeconds?: unknown; tries?: unknown; tipsUsed?: unknown };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      typeof tries !== "number" || !Number.isFinite(tries) || tries < 0 ||
      typeof tipsUsed !== "number" || !Number.isFinite(tipsUsed) || tipsUsed < 0) {
    res.status(400).json({ error: "elapsedSeconds, tries, and tipsUsed must be non-negative numbers" });
    return;
  }

  const [existing] = await db.select().from(wordSearchGamesTable).where(eq(wordSearchGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points ?? 0, xpEarned: existing.xpEarned ?? 0, gemsEarned: existing.gemsEarned ?? 0, elapsedSeconds: existing.elapsedSeconds, tries: existing.tries, tipsUsed: existing.tipsUsed });
    return;
  }

  const difficulty = DIFFICULTIES.includes(existing.difficulty as (typeof DIFFICULTIES)[number])
    ? existing.difficulty as (typeof DIFFICULTIES)[number]
    : "beginner";
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  const safeTries = Math.min(10000, Math.floor(tries));
  const safeTips = Math.min(2, Math.floor(tipsUsed));
  const points = calculatePoints(difficulty, safeElapsed, safeTries, safeTips);
  const xpEarned = existing.profileId ? XP_REWARDS[difficulty] : 0;
  const gemsEarned = existing.profileId ? GEM_REWARDS[difficulty] : 0;

  let isPersonalBest = false;
  if (existing.profileId) {
    const [best] = await db.select({ elapsedSeconds: wordSearchGamesTable.elapsedSeconds })
      .from(wordSearchGamesTable)
      .where(and(
        eq(wordSearchGamesTable.profileId, existing.profileId),
        eq(wordSearchGamesTable.status, "completed"),
        eq(wordSearchGamesTable.difficulty, difficulty),
        eq(wordSearchGamesTable.theme, existing.theme),
      ))
      .orderBy(asc(wordSearchGamesTable.elapsedSeconds))
      .limit(1);
    isPersonalBest = !best || safeElapsed < best.elapsedSeconds;
  }

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(wordSearchGamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      tries: safeTries,
      tipsUsed: safeTips,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(wordSearchGamesTable.id, id), eq(wordSearchGamesTable.status, "active"))).returning();
    if (!completed) return null;
    if (existing.profileId) {
      await tx.update(profilesTable).set({
        gems: sql`gems + ${gemsEarned}`,
        xp: sql`xp + ${xpEarned}`,
      }).where(eq(profilesTable.id, existing.profileId));
    }
    return completed;
  });

  if (!game) {
    const [completed] = await db.select().from(wordSearchGamesTable).where(eq(wordSearchGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, tries: completed.tries, tipsUsed: completed.tipsUsed });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveWordSearchChallenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, tries: safeTries, tipsUsed: safeTips, isPersonalBest, completedAt: game.completedAt?.toISOString() });
});

export default router;
