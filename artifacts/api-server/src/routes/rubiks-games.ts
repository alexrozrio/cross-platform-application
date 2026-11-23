import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, profilesTable, rubiksGamesTable, rubiksChallengesTable } from "@workspace/db";
import { expireChallengeIfDue, expireChallengesForProfile, isChallengeRecordHidden, CHALLENGE_INVITATION_TTL_MS, CHALLENGE_ACTIVE_TTL_MS } from "../utils/challenge-lifecycle";

const router: IRouter = Router();

const PUZZLES = ["2x2", "3x3", "pyraminx", "4x4"] as const;

const BASE_POINTS = { "2x2": 150, "3x3": 400, pyraminx: 600, "4x4": 1200 } as const;
const PAR_SECONDS = { "2x2": 60, "3x3": 300, pyraminx: 900, "4x4": 1800 } as const;
const PAR_MOVES = { "2x2": 15, "3x3": 80, pyraminx: 60, "4x4": 200 } as const;
const XP_REWARDS = { "2x2": 1, "3x3": 2, pyraminx: 3, "4x4": 4 } as const;
const GEM_REWARDS = { "2x2": 1, "3x3": 2, pyraminx: 3, "4x4": 5 } as const;

type Puzzle = (typeof PUZZLES)[number];

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }

function isPuzzle(value: unknown): value is Puzzle {
  return typeof value === "string" && (PUZZLES as readonly string[]).includes(value);
}

function getDailyConfig(date: string) {
  const digits = Number(date.replaceAll("-", ""));
  return {
    date,
    puzzle: PUZZLES[digits % PUZZLES.length],
    scrambleSeed: digits * 7919 + 13,
  };
}

async function formatRubiksChallenge(id: number) {
  const [challenge] = await db.select().from(rubiksChallengesTable).where(eq(rubiksChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: rubiksGamesTable.points, elapsedSeconds: rubiksGamesTable.elapsedSeconds }).from(rubiksGamesTable).where(eq(rubiksGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: rubiksGamesTable.points, elapsedSeconds: rubiksGamesTable.elapsedSeconds }).from(rubiksGamesTable).where(eq(rubiksGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null };
}

router.post("/rubiks-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; puzzle?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || !isPuzzle(body.puzzle)) {
    res.status(400).json({ error: "Choose another player and a valid puzzle." }); return;
  }
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const scrambleSeed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + CHALLENGE_INVITATION_TTL_MS);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(rubiksChallengesTable).values({ challengerId, challengedId, puzzle: body.puzzle as string, scrambleSeed, expiresAt }).returning({ id: rubiksChallengesTable.id });
    const [game] = await tx.insert(rubiksGamesTable).values({ profileId: challengerId, puzzle: body.puzzle as string, scrambleSeed, challengeId: challenge.id, status: "active" }).returning({ id: rubiksGamesTable.id });
    await tx.update(rubiksChallengesTable).set({ challengerGameId: game.id }).where(eq(rubiksChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatRubiksChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/rubiks-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  await expireChallengesForProfile(rubiksChallengesTable, profileId);
  const rows = await db.select({ id: rubiksChallengesTable.id }).from(rubiksChallengesTable)
    .where(or(eq(rubiksChallengesTable.challengerId, profileId), eq(rubiksChallengesTable.challengedId, profileId)))
    .orderBy(desc(rubiksChallengesTable.createdAt)).limit(50);
  const details = (await Promise.all(rows.map(({ id }) => formatRubiksChallenge(id)))).filter((detail): detail is NonNullable<typeof detail> => !!detail && !isChallengeRecordHidden(detail));
  res.json(details);
});

router.get("/rubiks-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const [challenge] = await db.select().from(rubiksChallengesTable).where(eq(rubiksChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (await expireChallengeIfDue(rubiksChallengesTable, challenge)) {
    const [updated] = await db.select().from(rubiksChallengesTable).where(eq(rubiksChallengesTable.id, id));
    if (isChallengeRecordHidden(updated ?? { ...challenge, status: "expired" })) { res.status(410).json({ error: "This challenge has expired." }); return; }
  }
  res.json(await formatRubiksChallenge(id));
});

router.patch("/rubiks-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(rubiksChallengesTable).where(eq(rubiksChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (await expireChallengeIfDue(rubiksChallengesTable, challenge)) { res.status(410).json({ error: "This challenge has expired." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (body.action === "decline") {
    await db.update(rubiksChallengesTable).set({ status: "declined" }).where(eq(rubiksChallengesTable.id, id));
    res.json(await formatRubiksChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(rubiksGamesTable).values({ profileId, puzzle: challenge.puzzle, scrambleSeed: challenge.scrambleSeed, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(rubiksChallengesTable).set({ status: "accepted", challengedGameId: created.id, expiresAt: new Date(challenge.createdAt.getTime() + CHALLENGE_ACTIVE_TTL_MS) }).where(eq(rubiksChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatRubiksChallenge(id)), gameId: game.id });
});

async function resolveRubiksChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(rubiksChallengesTable).where(or(
    eq(rubiksChallengesTable.challengerGameId, gameId), eq(rubiksChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(rubiksGamesTable).where(eq(rubiksGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(rubiksGamesTable).where(eq(rubiksGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(rubiksChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(rubiksChallengesTable.id, challenge.id), eq(rubiksChallengesTable.status, "accepted"))).returning({ id: rubiksChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/rubiks-games/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db.select({ profileId: rubiksGamesTable.profileId, username: profilesTable.username,
    avatar: profilesTable.avatar, xp: profilesTable.xp, points: rubiksGamesTable.points })
    .from(rubiksGamesTable).innerJoin(profilesTable, eq(rubiksGamesTable.profileId, profilesTable.id))
    .where(eq(rubiksGamesTable.status, "completed"));
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

router.get("/rubiks-daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/rubiks-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: rubiksGamesTable.points, elapsedSeconds: rubiksGamesTable.elapsedSeconds })
    .from(rubiksGamesTable).where(and(eq(rubiksGamesTable.profileId, profileId), eq(rubiksGamesTable.dailyDate, todayUtc()), eq(rubiksGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/rubiks-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: rubiksGamesTable.dailyDate }).from(rubiksGamesTable).where(and(
    eq(rubiksGamesTable.profileId, profileId), eq(rubiksGamesTable.status, "completed"),
    gte(rubiksGamesTable.dailyDate, `${month}-01`), lt(rubiksGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/rubiks-daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: rubiksGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: rubiksGamesTable.points, elapsedSeconds: rubiksGamesTable.elapsedSeconds })
    .from(rubiksGamesTable).innerJoin(profilesTable, eq(rubiksGamesTable.profileId, profilesTable.id))
    .where(and(eq(rubiksGamesTable.dailyDate, date), eq(rubiksGamesTable.status, "completed")))
    .orderBy(desc(rubiksGamesTable.points), asc(rubiksGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

// Up to +50% for speed; move efficiency scales 60–100% of base.
function calculatePoints(puzzle: Puzzle, elapsedSeconds: number, moves: number): number {
  const timeBonus = Math.max(0, (PAR_SECONDS[puzzle] - elapsedSeconds) / PAR_SECONDS[puzzle]) * 0.5;
  const moveEfficiency = Math.min(1, PAR_MOVES[puzzle] / Math.max(1, moves));
  const moveFactor = 0.6 + 0.4 * moveEfficiency;
  return Math.max(10, Math.round(BASE_POINTS[puzzle] * (1 + timeBonus) * moveFactor));
}

router.post("/rubiks-games", async (req, res): Promise<void> => {
  const { profileId, puzzle, scrambleSeed, dailyDate } = req.body as { profileId?: unknown; puzzle?: unknown; scrambleSeed?: unknown; dailyDate?: unknown };
  if (!isPuzzle(puzzle)) {
    res.status(400).json({ error: "puzzle must be 2x2, 3x3, pyraminx, or 4x4" });
    return;
  }
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  if (scrambleSeed !== undefined && scrambleSeed !== null && (!Number.isInteger(scrambleSeed) || (scrambleSeed as number) <= 0)) {
    res.status(400).json({ error: "scrambleSeed must be a positive integer" });
    return;
  }
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(todayUtc());
    if (puzzle !== config.puzzle || scrambleSeed !== config.scrambleSeed) {
      res.status(400).json({ error: "Daily challenge settings do not match today's puzzle" }); return;
    }
  }
  const seed = typeof scrambleSeed === "number" ? scrambleSeed : randomInt(1, 2_147_483_647);
  const [game] = await db.insert(rubiksGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    puzzle,
    scrambleSeed: seed,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, scrambleSeed: seed, createdAt: game.createdAt.toISOString() });
});

router.post("/rubiks-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, moves, won } = req.body as { elapsedSeconds?: unknown; moves?: unknown; won?: unknown };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      typeof moves !== "number" || !Number.isFinite(moves) || moves < 0 ||
      typeof won !== "boolean") {
    res.status(400).json({ error: "elapsedSeconds, moves, and won must be valid" });
    return;
  }

  const [existing] = await db.select().from(rubiksGamesTable).where(eq(rubiksGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points ?? 0, xpEarned: existing.xpEarned ?? 0, gemsEarned: existing.gemsEarned ?? 0, elapsedSeconds: existing.elapsedSeconds, moves: existing.moves, won: (existing.points ?? 0) > 0 });
    return;
  }

  const puzzle = isPuzzle(existing.puzzle) ? existing.puzzle : "3x3";
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  const safeMoves = Math.min(100000, Math.floor(moves));
  const points = won ? calculatePoints(puzzle, safeElapsed, safeMoves) : 0;
  const rewardFactor = won ? Math.min(1.5, Math.max(0.5, 1 + Math.max(0, (PAR_SECONDS[puzzle] - safeElapsed) / PAR_SECONDS[puzzle]) * 0.5)) : 0;
  const xpEarned = won && existing.profileId ? Math.max(1, Math.round(XP_REWARDS[puzzle] * rewardFactor)) : 0;
  const gemsEarned = won && existing.profileId ? Math.max(1, Math.round(GEM_REWARDS[puzzle] * rewardFactor)) : 0;

  let isPersonalBest = false;
  if (won && existing.profileId) {
    const [best] = await db.select({ elapsedSeconds: rubiksGamesTable.elapsedSeconds })
      .from(rubiksGamesTable)
      .where(and(
        eq(rubiksGamesTable.profileId, existing.profileId),
        eq(rubiksGamesTable.status, "completed"),
        eq(rubiksGamesTable.puzzle, puzzle),
        sql`points > 0`,
      ))
      .orderBy(asc(rubiksGamesTable.elapsedSeconds))
      .limit(1);
    isPersonalBest = !best || safeElapsed < best.elapsedSeconds;
  }

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(rubiksGamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      moves: safeMoves,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(rubiksGamesTable.id, id), eq(rubiksGamesTable.status, "active"))).returning();
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
    const [completed] = await db.select().from(rubiksGamesTable).where(eq(rubiksGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, moves: completed.moves, won: (completed.points ?? 0) > 0 });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveRubiksChallenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, moves: safeMoves, won, isPersonalBest, completedAt: game.completedAt?.toISOString() });
});

export default router;
