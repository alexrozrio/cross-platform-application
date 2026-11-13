import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, profilesTable, slidePuzzleGamesTable, slidePuzzleChallengesTable } from "@workspace/db";

const router: IRouter = Router();

const DIFFICULTIES = ["2x2", "3x3", "4x4", "5x5"] as const;
const TILE_STYLES = ["numbers", "alphabet", "icons"] as const;
// Must stay in sync with the icon set ids in the client's icon-sets.json.
const THEMES = [
  "shapes", "jungle", "vehicles", "ocean", "space", "adventure",
  "peppa_pig", "paw_patrol", "sheriff", "doraemon", "chotta_bheem",
  "shinchan", "bluey", "tom_jerry", "superhero", "princess",
] as const;

const BASE_POINTS = { "2x2": 120, "3x3": 300, "4x4": 700, "5x5": 1500 } as const;
const PAR_SECONDS = { "2x2": 90, "3x3": 300, "4x4": 1200, "5x5": 2700 } as const;
const PAR_MOVES = { "2x2": 12, "3x3": 60, "4x4": 160, "5x5": 320 } as const;
const XP_REWARDS = { "2x2": 1, "3x3": 1, "4x4": 2, "5x5": 3 } as const;
const GEM_REWARDS = { "2x2": 1, "3x3": 2, "4x4": 3, "5x5": 4 } as const;

type Difficulty = (typeof DIFFICULTIES)[number];
type TileStyle = (typeof TILE_STYLES)[number];

function todayUtc(): string { return new Date().toISOString().slice(0, 10); }

function normalizeStyle(value: unknown): TileStyle {
  return typeof value === "string" && (TILE_STYLES as readonly string[]).includes(value) ? value as TileStyle : "numbers";
}

function normalizeTheme(value: unknown, style: TileStyle): string | null {
  if (style !== "icons") return null;
  return typeof value === "string" && THEMES.includes(value as (typeof THEMES)[number]) ? value : THEMES[0];
}

function getDailyConfig(date: string) {
  const digits = Number(date.replaceAll("-", ""));
  return {
    date,
    difficulty: DIFFICULTIES[digits % DIFFICULTIES.length],
    tileStyle: TILE_STYLES[Math.floor(digits / DIFFICULTIES.length) % TILE_STYLES.length],
    themeId: THEMES[Math.floor(digits / (DIFFICULTIES.length * TILE_STYLES.length)) % THEMES.length],
    seed: digits,
  };
}

async function formatSlidePuzzleChallenge(id: number) {
  const [challenge] = await db.select().from(slidePuzzleChallengesTable).where(eq(slidePuzzleChallengesTable.id, id));
  if (!challenge) return null;
  const [challenger, challenged, challengerGame, challengedGame] = await Promise.all([
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengerId)).then((rows) => rows[0]),
    db.select({ username: profilesTable.username, avatar: profilesTable.avatar, xp: profilesTable.xp }).from(profilesTable).where(eq(profilesTable.id, challenge.challengedId)).then((rows) => rows[0]),
    challenge.challengerGameId ? db.select({ points: slidePuzzleGamesTable.points, elapsedSeconds: slidePuzzleGamesTable.elapsedSeconds }).from(slidePuzzleGamesTable).where(eq(slidePuzzleGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
    challenge.challengedGameId ? db.select({ points: slidePuzzleGamesTable.points, elapsedSeconds: slidePuzzleGamesTable.elapsedSeconds }).from(slidePuzzleGamesTable).where(eq(slidePuzzleGamesTable.id, challenge.challengedGameId)).then((rows) => rows[0]) : Promise.resolve(undefined),
  ]);
  return { ...challenge, challengerUsername: challenger?.username ?? "Player", challengerAvatar: challenger?.avatar ?? null, challengerXp: challenger?.xp ?? 0,
    challengedUsername: challenged?.username ?? "Player", challengedAvatar: challenged?.avatar ?? null, challengedXp: challenged?.xp ?? 0,
    challengerPoints: challengerGame?.points ?? null, challengedPoints: challengedGame?.points ?? null,
    challengerElapsedSeconds: challengerGame?.elapsedSeconds ?? null, challengedElapsedSeconds: challengedGame?.elapsedSeconds ?? null };
}

router.post("/slide-puzzle-challenges", async (req, res): Promise<void> => {
  const body = req.body as { challengerId?: unknown; challengedId?: unknown; difficulty?: unknown; tileStyle?: unknown; themeId?: unknown };
  const challengerId = Number(body.challengerId);
  const challengedId = Number(body.challengedId);
  const tileStyle = normalizeStyle(body.tileStyle);
  const themeId = normalizeTheme(body.themeId, tileStyle);
  if (!Number.isInteger(challengerId) || challengerId <= 0 || !Number.isInteger(challengedId) || challengedId <= 0 || challengerId === challengedId
    || typeof body.difficulty !== "string" || !DIFFICULTIES.includes(body.difficulty as Difficulty)) {
    res.status(400).json({ error: "Choose another player and a valid board size." }); return;
  }
  const [challenger] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengerId));
  const [challenged] = await db.select({ id: profilesTable.id }).from(profilesTable).where(eq(profilesTable.id, challengedId));
  if (!challenger || !challenged) { res.status(404).json({ error: "Player not found." }); return; }
  const seed = randomInt(1, 2_147_483_647);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const created = await db.transaction(async (tx) => {
    const [challenge] = await tx.insert(slidePuzzleChallengesTable).values({ challengerId, challengedId, difficulty: body.difficulty as string, tileStyle, themeId, seed, expiresAt }).returning({ id: slidePuzzleChallengesTable.id });
    const [game] = await tx.insert(slidePuzzleGamesTable).values({ profileId: challengerId, difficulty: body.difficulty as string, tileStyle, themeId, challengeId: challenge.id, status: "active" }).returning({ id: slidePuzzleGamesTable.id });
    await tx.update(slidePuzzleChallengesTable).set({ challengerGameId: game.id }).where(eq(slidePuzzleChallengesTable.id, challenge.id));
    return { challengeId: challenge.id, gameId: game.id };
  });
  res.status(201).json({ ...(await formatSlidePuzzleChallenge(created.challengeId)), gameId: created.gameId });
});

router.get("/slide-puzzle-challenges/for/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id." }); return; }
  const rows = await db.select({ id: slidePuzzleChallengesTable.id }).from(slidePuzzleChallengesTable)
    .where(or(eq(slidePuzzleChallengesTable.challengerId, profileId), eq(slidePuzzleChallengesTable.challengedId, profileId)))
    .orderBy(desc(slidePuzzleChallengesTable.createdAt)).limit(50);
  for (const { id } of rows) {
    const [challenge] = await db.select({ status: slidePuzzleChallengesTable.status, expiresAt: slidePuzzleChallengesTable.expiresAt }).from(slidePuzzleChallengesTable).where(eq(slidePuzzleChallengesTable.id, id));
    if (challenge?.status === "pending" && challenge.expiresAt.getTime() <= Date.now()) {
      await db.update(slidePuzzleChallengesTable).set({ status: "expired" }).where(eq(slidePuzzleChallengesTable.id, id));
    }
  }
  res.json((await Promise.all(rows.map(({ id }) => formatSlidePuzzleChallenge(id)))).filter(Boolean));
});

router.get("/slide-puzzle-challenges/:id", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "Invalid challenge id." }); return; }
  const detail = await formatSlidePuzzleChallenge(id);
  if (!detail) { res.status(404).json({ error: "Challenge not found." }); return; }
  res.json(detail);
});

router.patch("/slide-puzzle-challenges/:id/respond", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  const body = req.body as { profileId?: unknown; action?: unknown };
  const profileId = Number(body.profileId);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(profileId) || profileId <= 0 || !["accept", "decline"].includes(String(body.action))) {
    res.status(400).json({ error: "Invalid challenge response." }); return;
  }
  const [challenge] = await db.select().from(slidePuzzleChallengesTable).where(eq(slidePuzzleChallengesTable.id, id));
  if (!challenge) { res.status(404).json({ error: "Challenge not found." }); return; }
  if (challenge.challengedId !== profileId) { res.status(403).json({ error: "This challenge was sent to another player." }); return; }
  if (challenge.status !== "pending") { res.status(409).json({ error: "This challenge is no longer waiting for a response." }); return; }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await db.update(slidePuzzleChallengesTable).set({ status: "expired" }).where(eq(slidePuzzleChallengesTable.id, id));
    res.status(410).json({ error: "This challenge has expired." }); return;
  }
  if (body.action === "decline") {
    await db.update(slidePuzzleChallengesTable).set({ status: "declined" }).where(eq(slidePuzzleChallengesTable.id, id));
    res.json(await formatSlidePuzzleChallenge(id)); return;
  }
  const [game] = await db.transaction(async (tx) => {
    const [created] = await tx.insert(slidePuzzleGamesTable).values({ profileId, difficulty: challenge.difficulty, tileStyle: challenge.tileStyle, themeId: challenge.themeId, challengeId: challenge.id, status: "active" }).returning();
    await tx.update(slidePuzzleChallengesTable).set({ status: "accepted", challengedGameId: created.id }).where(eq(slidePuzzleChallengesTable.id, id));
    return [created];
  });
  res.json({ ...(await formatSlidePuzzleChallenge(id)), gameId: game.id });
});

async function resolveSlidePuzzleChallenge(gameId: number): Promise<void> {
  const [challenge] = await db.select().from(slidePuzzleChallengesTable).where(or(
    eq(slidePuzzleChallengesTable.challengerGameId, gameId), eq(slidePuzzleChallengesTable.challengedGameId, gameId),
  ));
  if (!challenge || challenge.status !== "accepted" || !challenge.challengerGameId || !challenge.challengedGameId) return;
  const [challengerGame, challengedGame] = await Promise.all([
    db.select().from(slidePuzzleGamesTable).where(eq(slidePuzzleGamesTable.id, challenge.challengerGameId)).then((rows) => rows[0]),
    db.select().from(slidePuzzleGamesTable).where(eq(slidePuzzleGamesTable.id, challenge.challengedGameId!)).then((rows) => rows[0]),
  ]);
  if (challengerGame?.status !== "completed" || challengedGame?.status !== "completed") return;
  const challengerPoints = challengerGame.points ?? 0;
  const challengedPoints = challengedGame.points ?? 0;
  const winnerId = challengerPoints === challengedPoints ? null : challengerPoints > challengedPoints ? challenge.challengerId : challenge.challengedId;
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(slidePuzzleChallengesTable).set({ status: "completed", winnerId })
      .where(and(eq(slidePuzzleChallengesTable.id, challenge.id), eq(slidePuzzleChallengesTable.status, "accepted"))).returning({ id: slidePuzzleChallengesTable.id });
    if (!updated) return;
    if (winnerId) await tx.update(profilesTable).set({ gems: sql`gems + 10` }).where(eq(profilesTable.id, winnerId));
    else {
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengerId));
      await tx.update(profilesTable).set({ gems: sql`gems + 2` }).where(eq(profilesTable.id, challenge.challengedId));
    }
  });
}

router.get("/slide-puzzle-games/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db.select({ profileId: slidePuzzleGamesTable.profileId, username: profilesTable.username,
    avatar: profilesTable.avatar, xp: profilesTable.xp, points: slidePuzzleGamesTable.points })
    .from(slidePuzzleGamesTable).innerJoin(profilesTable, eq(slidePuzzleGamesTable.profileId, profilesTable.id))
    .where(eq(slidePuzzleGamesTable.status, "completed"));
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

router.get("/slide-puzzle-daily-challenge", (_req, res): void => {
  res.json(getDailyConfig(todayUtc()));
});

router.get("/slide-puzzle-daily-challenge/status/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const games = await db.select({ points: slidePuzzleGamesTable.points, elapsedSeconds: slidePuzzleGamesTable.elapsedSeconds })
    .from(slidePuzzleGamesTable).where(and(eq(slidePuzzleGamesTable.profileId, profileId), eq(slidePuzzleGamesTable.dailyDate, todayUtc()), eq(slidePuzzleGamesTable.status, "completed")));
  const best = games.reduce<typeof games[number] | null>((current, game) => !current || (game.points ?? 0) > (current.points ?? 0) ? game : current, null);
  res.json({ date: todayUtc(), completed: games.length > 0, attempts: games.length, bestPoints: best?.points ?? null });
});

router.get("/slide-puzzle-daily-challenge/history/:profileId", async (req, res): Promise<void> => {
  const profileId = Number.parseInt(req.params.profileId, 10);
  if (!Number.isInteger(profileId) || profileId <= 0) { res.status(400).json({ error: "Invalid profile id" }); return; }
  const month = typeof req.query.month === "string" ? req.query.month : todayUtc().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) { res.status(400).json({ error: "Invalid month. Use YYYY-MM format." }); return; }
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const rows = await db.select({ date: slidePuzzleGamesTable.dailyDate }).from(slidePuzzleGamesTable).where(and(
    eq(slidePuzzleGamesTable.profileId, profileId), eq(slidePuzzleGamesTable.status, "completed"),
    gte(slidePuzzleGamesTable.dailyDate, `${month}-01`), lt(slidePuzzleGamesTable.dailyDate, monthEnd),
  ));
  res.json({ month, completedDates: [...new Set(rows.map(({ date }) => date).filter((date): date is string => !!date))] });
});

router.get("/slide-puzzle-daily-challenge/leaderboard", async (_req, res): Promise<void> => {
  const date = todayUtc();
  const rows = await db.select({ profileId: slidePuzzleGamesTable.profileId, username: profilesTable.username, avatar: profilesTable.avatar,
    points: slidePuzzleGamesTable.points, elapsedSeconds: slidePuzzleGamesTable.elapsedSeconds })
    .from(slidePuzzleGamesTable).innerJoin(profilesTable, eq(slidePuzzleGamesTable.profileId, profilesTable.id))
    .where(and(eq(slidePuzzleGamesTable.dailyDate, date), eq(slidePuzzleGamesTable.status, "completed")))
    .orderBy(desc(slidePuzzleGamesTable.points), asc(slidePuzzleGamesTable.elapsedSeconds));
  const bestByPlayer = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (row.profileId && !bestByPlayer.has(row.profileId)) bestByPlayer.set(row.profileId, row);
  res.json({ date, entries: Array.from(bestByPlayer.values()).slice(0, 25).map((row, index) => ({ rank: index + 1, ...row, points: row.points ?? 0 })) });
});

// Performance multiplier shared by points and XP/gems: up to +50% for speed;
// move efficiency scales 60–100%; each hint reduces it by 15% (floor 70%).
function performanceFactor(difficulty: Difficulty, elapsedSeconds: number, moves: number, hintsUsed: number): number {
  const timeBonus = Math.max(0, (PAR_SECONDS[difficulty] - elapsedSeconds) / PAR_SECONDS[difficulty]) * 0.5;
  const moveEfficiency = Math.min(1, PAR_MOVES[difficulty] / Math.max(1, moves));
  const moveFactor = 0.6 + 0.4 * moveEfficiency;
  const hintPenalty = Math.max(0.7, 1 - hintsUsed * 0.15);
  return (1 + timeBonus) * moveFactor * hintPenalty;
}

// Up to +50% for speed; move efficiency scales 60–100% of base; each hint −15% (floor 70%).
function calculatePoints(difficulty: Difficulty, elapsedSeconds: number, moves: number, hintsUsed: number): number {
  return Math.max(10, Math.round(BASE_POINTS[difficulty] * performanceFactor(difficulty, elapsedSeconds, moves, hintsUsed)));
}

router.post("/slide-puzzle-games", async (req, res): Promise<void> => {
  const { profileId, difficulty, tileStyle, themeId, dailyDate } = req.body as { profileId?: unknown; difficulty?: unknown; tileStyle?: unknown; themeId?: unknown; dailyDate?: unknown };
  if (typeof difficulty !== "string" || !DIFFICULTIES.includes(difficulty as Difficulty)) {
    res.status(400).json({ error: "difficulty must be 2x2, 3x3, 4x4, or 5x5" });
    return;
  }
  if (profileId !== undefined && profileId !== null && (!Number.isInteger(profileId) || (profileId as number) <= 0)) {
    res.status(400).json({ error: "profileId must be a positive integer" });
    return;
  }
  const style = normalizeStyle(tileStyle);
  const theme = normalizeTheme(themeId, style);
  if (dailyDate !== undefined && dailyDate !== todayUtc()) { res.status(400).json({ error: "Daily challenge date is not current" }); return; }
  if (dailyDate === todayUtc()) {
    const config = getDailyConfig(todayUtc());
    if (difficulty !== config.difficulty || style !== config.tileStyle || theme !== config.themeId) {
      res.status(400).json({ error: "Daily challenge settings do not match today's puzzle" }); return;
    }
  }
  const [game] = await db.insert(slidePuzzleGamesTable).values({
    profileId: typeof profileId === "number" ? profileId : null,
    difficulty,
    tileStyle: style,
    themeId: theme,
    dailyDate: dailyDate === todayUtc() ? todayUtc() : null,
    status: "active",
  }).returning();
  res.status(201).json({ id: game.id, createdAt: game.createdAt.toISOString() });
});

router.post("/slide-puzzle-games/:id/complete", async (req, res): Promise<void> => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const { elapsedSeconds, moves, hintsUsed, won } = req.body as { elapsedSeconds?: unknown; moves?: unknown; hintsUsed?: unknown; won?: unknown };
  if (typeof elapsedSeconds !== "number" || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      typeof moves !== "number" || !Number.isFinite(moves) || moves < 0 ||
      typeof hintsUsed !== "number" || !Number.isFinite(hintsUsed) || hintsUsed < 0 ||
      typeof won !== "boolean") {
    res.status(400).json({ error: "elapsedSeconds, moves, hintsUsed, and won must be valid" });
    return;
  }

  const [existing] = await db.select().from(slidePuzzleGamesTable).where(eq(slidePuzzleGamesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (existing.status === "completed") {
    res.json({ points: existing.points ?? 0, xpEarned: existing.xpEarned ?? 0, gemsEarned: existing.gemsEarned ?? 0, elapsedSeconds: existing.elapsedSeconds, moves: existing.moves, hintsUsed: existing.hintsUsed, won: (existing.points ?? 0) > 0 });
    return;
  }

  const difficulty = DIFFICULTIES.includes(existing.difficulty as Difficulty)
    ? existing.difficulty as Difficulty
    : "3x3";
  const safeElapsed = Math.min(86400, Math.floor(elapsedSeconds));
  const safeMoves = Math.min(100000, Math.floor(moves));
  const safeHints = Math.min(10, Math.floor(hintsUsed));
  const points = won ? calculatePoints(difficulty, safeElapsed, safeMoves, safeHints) : 0;
  // XP and gems scale with the same performance factor as points (clamped to
  // 0.5–1.5× the difficulty base), so faster, cleaner runs earn more.
  const rewardFactor = won ? Math.min(1.5, Math.max(0.5, performanceFactor(difficulty, safeElapsed, safeMoves, safeHints))) : 0;
  const xpEarned = won && existing.profileId ? Math.max(1, Math.round(XP_REWARDS[difficulty] * rewardFactor)) : 0;
  const gemsEarned = won && existing.profileId ? Math.max(1, Math.round(GEM_REWARDS[difficulty] * rewardFactor)) : 0;

  let isPersonalBest = false;
  if (won && existing.profileId) {
    const [best] = await db.select({ elapsedSeconds: slidePuzzleGamesTable.elapsedSeconds })
      .from(slidePuzzleGamesTable)
      .where(and(
        eq(slidePuzzleGamesTable.profileId, existing.profileId),
        eq(slidePuzzleGamesTable.status, "completed"),
        eq(slidePuzzleGamesTable.difficulty, difficulty),
        sql`points > 0`,
      ))
      .orderBy(asc(slidePuzzleGamesTable.elapsedSeconds))
      .limit(1);
    isPersonalBest = !best || safeElapsed < best.elapsedSeconds;
  }

  const game = await db.transaction(async (tx) => {
    const [completed] = await tx.update(slidePuzzleGamesTable).set({
      status: "completed",
      elapsedSeconds: safeElapsed,
      moves: safeMoves,
      hintsUsed: safeHints,
      points,
      xpEarned,
      gemsEarned,
      completedAt: new Date(),
    }).where(and(eq(slidePuzzleGamesTable.id, id), eq(slidePuzzleGamesTable.status, "active"))).returning();
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
    const [completed] = await db.select().from(slidePuzzleGamesTable).where(eq(slidePuzzleGamesTable.id, id));
    if (completed?.status === "completed") {
      res.json({ points: completed.points ?? 0, xpEarned: completed.xpEarned ?? 0, gemsEarned: completed.gemsEarned ?? 0, elapsedSeconds: completed.elapsedSeconds, moves: completed.moves, hintsUsed: completed.hintsUsed, won: (completed.points ?? 0) > 0 });
      return;
    }
    res.status(404).json({ error: "Game not found or already finished" });
    return;
  }

  await resolveSlidePuzzleChallenge(game.id);
  res.json({ points, xpEarned, gemsEarned, elapsedSeconds: safeElapsed, moves: safeMoves, hintsUsed: safeHints, won, isPersonalBest, completedAt: game.completedAt?.toISOString() });
});

export default router;
