import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, profilesTable, minesweeperGamesTable, minesweeperChallengesTable } from "@workspace/db";

const router: IRouter = Router();

const DIFFICULTIES = ["beginner", "easy", "medium", "hard"] as const;
const BASE_POINTS = { beginner: 150, easy: 350, medium: 800, hard: 1600 } as const;
const PAR_SECONDS = { beginner: 90, easy: 180, medium: 360, hard: 600 } as const;
const XP_REWARDS = { beginner: 1, easy: 1, medium: 2, hard: 3 } as const;
const GEM_REWARDS = { beginner: 1, easy: 2, medium: 3, hard: 4 } as const;

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }
function getDailyConfig(date: string) {
  const seed = Number(date.replaceAll("-", ""));
  return { date, difficulty: DIFFICULTIES[seed % DIFFICULTIES.length], seed };
}

async function formatMinesweeperChallenge(id: number) {
  const [challenge] = await db.select().from(minesweeperChallengesTable).where(eq(minesweeperChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: minesweeperGamesTable.points, elapsedSeconds: minesweeperGamesTable.elapsedSeconds }).from(minesweeperGamesTable).where(eq(minesweeperGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: minesweeperGamesTable.points, elapsedSeconds: minesweeperGamesTable.elapsedSeconds }).from(minesweeperGamesTable).where(eq(minesweeperGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null };
}

router.post("/minesweeper-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; difficulty?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || typeof body.difficulty !== "string" || !DIFFICULTIES.includes(body.difficulty as (typeof DIFFICULTIES)[number])) {
    res.status(400).json({ error: "Choose another player and a valid difficulty." }); return;
  }
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(minesweeperChallengesTable).values({ challengerId, challengedId, difficulty: body.difficulty as string, seed, expiresAt }).returning({ id: minesweeperChallengesTable.id });
    const [game] = await tx.insert(minesweeperGamesTable).values({ profileId: challengerId, difficulty: body.difficulty as string, challengeId: challenge.id, status: "active" }).returning({ id: minesweeperGamesTable.id });
    await tx.update(minesweeperChallengesTable).set({ challengerGameId: game.id }).where(eq(minesweeperChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatMinesweeperChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/minesweeper-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  const rows = await db.select({ id: minesweeperChallengesTable.id }).from(minesweeperChallengesTable)
    .where(or(eq(minesweeperChallengesTable.challengerId, profileId), eq(minesweeperChallengesTable.challengedId, profileId)))
    .orderBy(desc(minesweeperChallengesTable.createdAt)).limit(50);
  for (const { id } of rows) {
    const [challenge] = await db.select({ status: minesweeperChallengesTable.status, expiresAt: minesweeperChallengesTable.expiresAt }).from(minesweeperChallengesTable).where(eq(minesweeperChallengesTable.id, id));
    if (challenge?.status === "pending" && challenge.expiresAt.getTime() <= Date.now()) {
      await db.update(minesweeperChallengesTable).set({ status: "expired" }).where(eq(minesweeperChallengesTable.id, id));
    }
  }
  res.json((await Promise.all(rows.map(({ id }) => formatMinesweeperChallenge(id)))).filter(Boolean));
});

router.get("/minesweeper-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const detail = await formatMinesweeperChallenge(id);
  if (!detail) { res.status(404).json({ error: "Challenge not found." }); return; }
  res.json(detail);
});

router.patch("/minesweeper-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(minesweeperChallengesTable).where(eq(minesweeperChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await db.update(minesweeperChallengesTable).set({ status: "expired" }).where(eq(minesweeperChallengesTable.id, id));
    res.status(410).json({ error: "This challenge has expired." }); return;
  }
  if (body.action === "decline") {
    await db.update(minesweeperChallengesTable).set({ status: "declined" }).where(eq(minesweeperChallengesTable.id, id));
    res.json(await formatMinesweeperChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(minesweeperGamesTable).values({ profileId, difficulty: challenge.difficulty, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(minesweeperChallengesTable).set({ status: "accepted", challengedGameId: created.id }).where(eq(minesweeperChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatMinesweeperChallenge(id)), gameId: game.id });
});

async function resolveMinesweeperChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(minesweeperChallengesTable).where(or(
    eq(minesweeperChallengesTable.challengerGameId, gameId), eq(minesweeperChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(minesweeperGamesTable).where(eq(minesweeperGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(minesweeperGamesTable).where(eq(minesweeperGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(minesweeperChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(minesweeperChallengesTable.id, challenge.id), eq(minesweeperChallengesTable.status, "accepted"))).returning({ id: minesweeperChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/minesweeper-games/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db.select({ profileId: minesweeperGamesTable.profileId, username: profilesTable.username,
    avatar: profilesTable.avatar, xp: profilesTable.xp, points: minesweeperGamesTable.points })
    .from(minesweeperGamesTable).innerJoin(profilesTable, eq(minesweeperGamesTable.profileId, profilesTable.id))
    .where(eq(minesweeperGamesTable.status, "completed"));
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

router.get("/minesweeper-daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/minesweeper-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: minesweeperGamesTable.points, elapsedSeconds: minesweeperGamesTable.elapsedSeconds })
    .from(minesweeperGamesTable).where(and(eq(minesweeperGamesTable.profileId, profileId), eq(minesweeperGamesTable.dailyDate, todayUtc()), eq(minesweeperGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/minesweeper-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: minesweeperGamesTable.dailyDate }).from(minesweeperGamesTable).where(and(
    eq(minesweeperGamesTable.profileId, profileId), eq(minesweeperGamesTable.status, "completed"),
    gte(minesweeperGamesTable.dailyDate, `${month}-01`), lt(minesweeperGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/minesweeper-daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: minesweeperGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: minesweeperGamesTable.points, elapsedSeconds: minesweeperGamesTable.elapsedSeconds })
    .from(minesweeperGamesTable).innerJoin(profilesTable, eq(minesweeperGamesTable.profileId, profilesTable.id))
    .where(and(eq(minesweeperGamesTable.dailyDate, date), eq(minesweeperGamesTable.status, "completed")))
    .orderBy(desc(minesweeperGamesTable.points), asc(minesweeperGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

// Performance multiplier shared by points and XP/gems: up to +50% for speed;
// each mine hit reduces it by 15% and each hint by 20%.
function performanceFactor(difficulty: (typeof DIFFICULTIES)[number], elapsedSeconds: number, mistakes: number, hintsUsed: number): number {
  const timeBonus = Math.max(0, (PAR_SECONDS[difficulty] - elapsedSeconds) / PAR_SECONDS[difficulty]) * 0.5;
  const mistakePenalty = Math.max(0.4, 1 - mistakes * 0.15);
  const hintPenalty = Math.max(0.6, 1 - hintsUsed * 0.2);
  return (1 + timeBonus) * mistakePenalty * hintPenalty;
}

// Up to +50% for speed; each mine hit reduces points by 15% and each hint by 20%.
function calculatePoints(difficulty: (typeof DIFFICULTIES)[number], elapsedSeconds: number, mistakes: number, hintsUsed: number): number {
  return Math.max(10, Math.round(BASE_POINTS[difficulty] * performanceFactor(difficulty, elapsedSeconds, mistakes, hintsUsed)));
}

router.post("/minesweeper-games", async (req, res): Promise<void> => {
  const { profileId, difficulty, dailyDate } = req.body as { profileId?: unknown; difficulty?: unknown; dailyDate?: unknown };
  if (typeof difficulty !== "string" || !DIFFICULTIES.includes(difficulty as (typeof DIFFICULTIES)[number])) {
    res.status(400).json({ error: "difficulty must be beginner, easy, medium, or hard" });
    return;
  }
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(todayUtc());
    if (difficulty !== config.difficulty) { res.status(400).json({ error: "Daily challenge settings do not match today's puzzle" }); return; }
  }
  const [game] = await db.insert(minesweeperGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    difficulty,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

router.post("/minesweeper-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, mistakes, hintsUsed, won } = req.body as { elapsedSeconds?: unknown; mistakes?: unknown; hintsUsed?: unknown; won?: unknown };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      typeof mistakes !== "number" || !Number.isFinite(mistakes) || mistakes < 0 ||
      typeof hintsUsed !== "number" || !Number.isFinite(hintsUsed) || hintsUsed < 0 ||
      typeof won !== "boolean") {
    res.status(400).json({ error: "elapsedSeconds, mistakes, hintsUsed, and won must be valid" });
    return;
  }

  const [existing] = await db.select().from(minesweeperGamesTable).where(eq(minesweeperGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points ?? 0, xpEarned: existing.xpEarned ?? 0, gemsEarned: existing.gemsEarned ?? 0, elapsedSeconds: existing.elapsedSeconds, mistakes: existing.mistakes, hintsUsed: existing.hintsUsed, won: (existing.points ?? 0) > 0 });
    return;
  }

  const difficulty = DIFFICULTIES.includes(existing.difficulty as (typeof DIFFICULTIES)[number])
    ? existing.difficulty as (typeof DIFFICULTIES)[number]
    : "beginner";
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  const safeMistakes = Math.min(1000, Math.floor(mistakes));
  const safeHints = Math.min(10, Math.floor(hintsUsed));
  const points = won ? calculatePoints(difficulty, safeElapsed, safeMistakes, safeHints) : 0;
  // XP and gems scale with the same performance factor as points (clamped to
  // 0.5–1.5× the difficulty base), so faster, cleaner runs earn more.
  const rewardFactor = won ? Math.min(1.5, Math.max(0.5, performanceFactor(difficulty, safeElapsed, safeMistakes, safeHints))) : 0;
  const xpEarned = won && existing.profileId ? Math.max(1, Math.round(XP_REWARDS[difficulty] * rewardFactor)) : 0;
  const gemsEarned = won && existing.profileId ? Math.max(1, Math.round(GEM_REWARDS[difficulty] * rewardFactor)) : 0;

  let isPersonalBest = false;
  if (won && existing.profileId) {
    const [best] = await db.select({ elapsedSeconds: minesweeperGamesTable.elapsedSeconds })
      .from(minesweeperGamesTable)
      .where(and(
        eq(minesweeperGamesTable.profileId, existing.profileId),
        eq(minesweeperGamesTable.status, "completed"),
        eq(minesweeperGamesTable.difficulty, difficulty),
        sql`points > 0`,
      ))
      .orderBy(asc(minesweeperGamesTable.elapsedSeconds))
      .limit(1);
    isPersonalBest = !best || safeElapsed < best.elapsedSeconds;
  }

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(minesweeperGamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      mistakes: safeMistakes,
      hintsUsed: safeHints,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(minesweeperGamesTable.id, id), eq(minesweeperGamesTable.status, "active"))).returning();
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
    const [completed] = await db.select().from(minesweeperGamesTable).where(eq(minesweeperGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, mistakes: completed.mistakes, hintsUsed: completed.hintsUsed, won: (completed.points ?? 0) > 0 });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveMinesweeperChallenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, mistakes: safeMistakes, hintsUsed: safeHints, won, isPersonalBest, completedAt: game.completedAt?.toISOString() });
});

export default router;
