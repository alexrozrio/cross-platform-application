import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, memoryChallengeCompletionsTable, profilesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// ─── Date / period helpers ────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function weekString(): string {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function weekOfYear(): number {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
}

// ─── Challenge config ─────────────────────────────────────────────────────────

const GRID_SIZES = [2, 4, 6, 8] as const;
const PAIRS: Record<number, number> = { 2: 4, 4: 8, 6: 16, 8: 32 };
const GRID_LABELS: Record<number, string> = { 2: 'Beginner · 4 pairs', 4: 'Easy · 8 pairs', 6: 'Medium · 16 pairs', 8: 'Hard · 32 pairs' };

function getDailyConfig() {
  const gridSize = GRID_SIZES[dayOfYear() % GRID_SIZES.length];
  return {
    type: 'daily' as const,
    period: todayString(),
    gridSize,
    pairs: PAIRS[gridSize],
    label: GRID_LABELS[gridSize],
    bonusXp: 2,
    bonusGems: 1,
  };
}

function getWeeklyConfig() {
  // Weekly alternates between Medium and Hard
  const sizes = [6, 8] as const;
  const gridSize = sizes[weekOfYear() % sizes.length];
  return {
    type: 'weekly' as const,
    period: weekString(),
    gridSize,
    pairs: PAIRS[gridSize],
    label: GRID_LABELS[gridSize],
    bonusXp: 5,
    bonusGems: 3,
  };
}

// ─── GET /api/memory-challenges/info ─────────────────────────────────────────

router.get("/memory-challenges/info", async (req, res): Promise<void> => {
  res.json({ daily: getDailyConfig(), weekly: getWeeklyConfig() });
});

// ─── GET /memory-challenges/status/:profileId ────────────────────────────────

router.get("/memory-challenges/status/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId, 10);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  const daily = getDailyConfig();
  const weekly = getWeeklyConfig();

  const rows = await db
    .select()
    .from(memoryChallengeCompletionsTable)
    .where(
      and(
        eq(memoryChallengeCompletionsTable.profileId, profileId),
      )
    );

  const completedDaily = rows.find(r => r.type === 'daily' && r.period === daily.period);
  const completedWeekly = rows.find(r => r.type === 'weekly' && r.period === weekly.period);

  res.json({
    daily: { ...daily, completed: !!completedDaily, completion: completedDaily ?? null },
    weekly: { ...weekly, completed: !!completedWeekly, completion: completedWeekly ?? null },
  });
});

// ─── POST /memory-challenges/complete ────────────────────────────────────────

router.post("/memory-challenges/complete", async (req, res): Promise<void> => {
  const { profileId, type, elapsedSeconds, flips, points } = req.body as {
    profileId?: number;
    type?: string;
    elapsedSeconds?: number;
    flips?: number;
    points?: number;
  };

  if (!profileId || !type || !['daily', 'weekly'].includes(type)) {
    res.status(400).json({ error: "profileId and type ('daily'|'weekly') are required" });
    return;
  }
  if (typeof elapsedSeconds !== 'number' || typeof flips !== 'number' || typeof points !== 'number') {
    res.status(400).json({ error: "elapsedSeconds, flips and points are required numbers" });
    return;
  }

  const config = type === 'daily' ? getDailyConfig() : getWeeklyConfig();

  // Check already completed
  const [existing] = await db
    .select()
    .from(memoryChallengeCompletionsTable)
    .where(
      and(
        eq(memoryChallengeCompletionsTable.profileId, profileId),
        eq(memoryChallengeCompletionsTable.type, type),
        eq(memoryChallengeCompletionsTable.period, config.period),
      )
    );

  if (existing) {
    res.json({ alreadyClaimed: true, bonusXp: 0, bonusGems: 0 });
    return;
  }

  // Record completion
  await db.insert(memoryChallengeCompletionsTable).values({
    profileId,
    type,
    period: config.period,
    gridSize: config.gridSize,
    elapsedSeconds,
    flips,
    points,
    bonusXp: config.bonusXp,
  });

  // Award bonus XP + gems to profile
  await db
    .update(profilesTable)
    .set({
      xp: sql`xp + ${config.bonusXp}`,
      gems: sql`gems + ${config.bonusGems}`,
    })
    .where(eq(profilesTable.id, profileId));

  // Update memory streak — only for daily challenge completions
  if (type === 'daily') {
    const today = config.period; // todayString()
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));
    if (profile) {
      const last = profile.lastMemoryDate as string | null;
      let newStreak = profile.memoryStreak ?? 0;
      if (last === yesterday) {
        newStreak += 1;
      } else if (last !== today) {
        newStreak = 1;
      }
      const newLongest = Math.max(newStreak, profile.longestMemoryStreak ?? 0);
      await db
        .update(profilesTable)
        .set({ memoryStreak: newStreak, longestMemoryStreak: newLongest, lastMemoryDate: today })
        .where(eq(profilesTable.id, profileId));
    }
  }

  res.json({ alreadyClaimed: false, bonusXp: config.bonusXp, bonusGems: config.bonusGems });
});

// ─── GET /memory-challenges/history/:profileId ───────────────────────────────

router.get("/memory-challenges/history/:profileId", async (req, res): Promise<void> => {
  const profileId = parseInt(req.params.profileId, 10);
  if (isNaN(profileId)) { res.status(400).json({ error: "Invalid profileId" }); return; }

  const rawMonth = typeof req.query.month === "string" ? req.query.month : todayString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth)) {
    res.status(400).json({ error: "Invalid month — use YYYY-MM format" }); return;
  }

  const [year, mon] = rawMonth.split("-").map(Number);
  const monthStart = `${year}-${String(mon).padStart(2, "0")}-01`;
  const nextYear = mon === 12 ? year + 1 : year;
  const nextMon  = mon === 12 ? 1 : mon + 1;
  const monthEnd = `${nextYear}-${String(nextMon).padStart(2, "0")}-01`;

  const rows = await db
    .select({ period: memoryChallengeCompletionsTable.period })
    .from(memoryChallengeCompletionsTable)
    .where(
      and(
        eq(memoryChallengeCompletionsTable.profileId, profileId),
        eq(memoryChallengeCompletionsTable.type, "daily"),
        // period is a date string YYYY-MM-DD — compare lexicographically
      )
    );

  const completedDates = [
    ...new Set(
      rows
        .map(r => r.period)
        .filter((p): p is string => !!p && p >= monthStart && p < monthEnd)
    ),
  ];

  res.json({ month: rawMonth, completedDates });
});

// ─── GET /memory-challenges/leaderboard?type=daily|weekly ────────────────────

router.get("/memory-challenges/leaderboard", async (req, res): Promise<void> => {
  const type = req.query.type === 'weekly' ? 'weekly' : 'daily';
  const config = type === 'daily' ? getDailyConfig() : getWeeklyConfig();

  const rows = await db
    .select({
      profileId: memoryChallengeCompletionsTable.profileId,
      username: profilesTable.username,
      avatar: profilesTable.avatar,
      points: memoryChallengeCompletionsTable.points,
      elapsedSeconds: memoryChallengeCompletionsTable.elapsedSeconds,
      flips: memoryChallengeCompletionsTable.flips,
      bonusXp: memoryChallengeCompletionsTable.bonusXp,
      completedAt: memoryChallengeCompletionsTable.completedAt,
    })
    .from(memoryChallengeCompletionsTable)
    .innerJoin(profilesTable, eq(memoryChallengeCompletionsTable.profileId, profilesTable.id))
    .where(
      and(
        eq(memoryChallengeCompletionsTable.type, type),
        eq(memoryChallengeCompletionsTable.period, config.period),
      )
    )
    .orderBy(desc(memoryChallengeCompletionsTable.points))
    .limit(20);

  res.json(rows.map(r => ({ ...r, completedAt: r.completedAt?.toISOString() ?? null })));
});

export default router;
