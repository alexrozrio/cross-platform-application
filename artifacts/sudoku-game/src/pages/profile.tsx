import React, { useState, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api-base-url";
import {
  useGetProfile,
  useUpdateProfile,
  useGetProfileBadges,
  useGetPlayerStats,
  customFetch,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  LogIn,
  LogOut,
  User,
  Smartphone,
  Share2,
  Trophy,
  Gem,
  Flame,
  Info,
  ShieldCheck,
  FileText,
  Volume2,
  Baby,
  Dumbbell,
  Globe,
  Hash,
  Target,
  TrendingUp,
  Zap,
  Clock,
  ChevronLeft,
  ChevronRight,
  Brain,
  Layers,
  BarChart2,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BADGE_META, formatPeriodLabel } from "@/lib/badge-utils";
import { BadgeShareSheet } from "@/components/badge-share-sheet";
import { LevelCard, RankGuide } from "@/components/level-badge";
import { ShareAchievementButton } from "@/components/share-achievement";
import { ACHIEVEMENT_META, type AchievementsData } from "@/lib/achievement-utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Sudoku Streak Calendar ───────────────────────────────────────────────────

function StreakCalendar({ profileId }: { profileId: number }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const month = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;

  const { data: streakInfo } = useQuery({
    queryKey: [`/api/daily-challenge/streak/${profileId}`],
    queryFn: () =>
      customFetch<{ currentStreak: number; longestStreak: number; completedToday: boolean }>(
        `/api/daily-challenge/streak/${profileId}`,
      ),
    enabled: !!profileId,
  });

  const { data: historyData } = useQuery({
    queryKey: [`/api/daily-challenge/history/${profileId}`, month],
    queryFn: () =>
      customFetch<{ month: string; completedDates: string[] }>(
        `/api/daily-challenge/history/${profileId}?month=${month}`,
      ),
    enabled: !!profileId,
  });

  const completedSet = new Set(historyData?.completedDates ?? []);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const todayStr = today.toISOString().slice(0, 10);
  const isPrevDisabled = viewDate <= new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const isNextDisabled = viewDate >= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <Card className="shadow-sm border-orange-200/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="w-4 h-4 text-orange-500" /> Daily Sudoku Streak
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="text-xl font-black text-orange-500">{streakInfo?.currentStreak ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">streak</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-black text-primary">{streakInfo?.longestStreak ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">best</p>
            </div>
            <Link
              href="/daily-challenge"
              className="text-xs text-orange-500 underline underline-offset-2 ml-1 whitespace-nowrap"
            >
              Play today →
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            disabled={isPrevDisabled}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</p>
          <button
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            disabled={isNextDisabled}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: startWeekday }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${month}-${String(day).padStart(2, "0")}`;
            const done = completedSet.has(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            return (
              <div
                key={day}
                title={done ? `Completed ${dateStr}` : undefined}
                className={[
                  "aspect-square flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done ? "bg-orange-500 text-white"
                    : isToday ? "ring-2 ring-orange-400 text-foreground"
                    : isFuture ? "text-muted-foreground/40"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {done ? "🔥" : day}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          {completedSet.size} day{completedSet.size !== 1 ? "s" : ""} completed this month
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Memory Streak Calendar ───────────────────────────────────────────────────

function MemoryStreakCalendar({ profileId }: { profileId: number }) {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const [viewYear, setViewYear] = useState(utcYear);
  const [viewMonth, setViewMonth] = useState(utcMonth);
  const month = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const { data: streakInfo } = useQuery({
    queryKey: [`/api/memory-games/streak/${profileId}`],
    queryFn: () =>
      customFetch<{ currentStreak: number; longestStreak: number; completedToday: boolean }>(
        `/api/memory-games/streak/${profileId}`,
      ),
    enabled: !!profileId,
  });

  const { data: historyData } = useQuery({
    queryKey: [`/api/memory-games/history/${profileId}`, month],
    queryFn: () =>
      customFetch<{ month: string; completedDates: string[] }>(
        `/api/memory-games/history/${profileId}?month=${month}`,
      ),
    enabled: !!profileId,
  });

  const completedSet = new Set(historyData?.completedDates ?? []);
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const startWeekday = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const todayStr = now.toISOString().slice(0, 10);

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };
  const isPrevDisabled = viewYear < utcYear - 1 || (viewYear === utcYear - 1 && viewMonth <= utcMonth);
  const isNextDisabled = viewYear === utcYear && viewMonth >= utcMonth;

  return (
    <Card className="shadow-sm border-purple-200/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-4 h-4 text-purple-500" /> Daily Memory Streak
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="text-xl font-black text-purple-500">{streakInfo?.currentStreak ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">streak</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-black text-primary">{streakInfo?.longestStreak ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">best</p>
            </div>
            <Link
              href="/memory-challenge"
              className="text-xs text-purple-500 underline underline-offset-2 ml-1 whitespace-nowrap"
            >
              Play today →
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={goPrev} disabled={isPrevDisabled} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</p>
          <button onClick={goNext} disabled={isNextDisabled} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: startWeekday }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${month}-${String(day).padStart(2, "0")}`;
            const done = completedSet.has(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            return (
              <div
                key={day}
                title={done ? `Played on ${dateStr}` : undefined}
                className={[
                  "aspect-square flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done ? "bg-purple-500 text-white"
                    : isToday ? "ring-2 ring-purple-400 text-foreground"
                    : isFuture ? "text-muted-foreground/40"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {done ? "🃏" : day}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          {completedSet.size} day{completedSet.size !== 1 ? "s" : ""} played this month
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Achievements Card ────────────────────────────────────────────────────────

function AchievementsCard({ profileId, game }: { profileId: number; game: "sudoku" | "memory" }) {
  const { data } = useQuery({
    queryKey: [`/api/achievements/${profileId}`],
    queryFn: () => customFetch<AchievementsData>(`/api/achievements/${profileId}`),
    enabled: !!profileId,
  });

  const isMemory = game === "memory";
  const gameMeta = ACHIEVEMENT_META.filter((a) => a.game === game);
  const gameGroups = Array.from(
    gameMeta.reduce((acc, a) => { acc.add(a.group); return acc; }, new Set<string>()),
  );
  const unlockedCount = data ? gameMeta.filter((a) => data[a.id]?.unlocked).length : 0;

  return (
    <Card className={`shadow-sm ${isMemory ? "border-purple-200/60 dark:border-purple-800/40" : "border-primary/10"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className={`w-4 h-4 ${isMemory ? "text-purple-500" : "text-yellow-500"}`} />
            Achievements
          </CardTitle>
          <span className="text-sm text-muted-foreground font-semibold">
            {unlockedCount} / {gameMeta.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {gameGroups.map((group) => {
          const items = gameMeta.filter((a) => a.group === group);
          return (
            <div key={group}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isMemory ? "text-purple-500" : "text-muted-foreground"}`}>
                {group}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((a) => {
                  const status = data?.[a.id];
                  const unlocked = status?.unlocked ?? false;
                  const progress = status?.progress ?? 0;
                  const total = status?.total ?? 1;
                  const showBar = total > 1 && !unlocked;
                  return (
                    <div
                      key={a.id}
                      title={unlocked ? undefined : a.description}
                      className={[
                        "relative group rounded-xl p-3 flex flex-col gap-1.5 border transition-all",
                        unlocked
                          ? isMemory
                            ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200/60 shadow-sm"
                            : "bg-primary/5 border-primary/20 shadow-sm"
                          : "bg-muted/30 border-transparent opacity-50",
                      ].join(" ")}
                    >
                      {unlocked && (
                        <ShareAchievementButton achievement={a} variant="icon" profileId={profileId} />
                      )}
                      <span className={`text-2xl ${unlocked ? "" : "grayscale"}`}>{a.emoji}</span>
                      <p className={`text-xs font-bold leading-tight ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                        {a.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{a.description}</p>
                      {showBar && (
                        <div className="mt-1">
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isMemory ? "bg-purple-400/60" : "bg-primary/50"}`}
                              style={{ width: `${Math.round((progress / total) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{progress} / {total}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TournamentStreakData {
  profileId: number;
  currentStreak: number;
  bestStreak: number;
  totalTop3Finishes: number;
}

type GameTab = "sudoku" | "memory";

const profileSchema = z.object({
  username: z.string().min(2, "At least 2 characters").max(30),
  soundEnabled: z.boolean().default(true),
  showTimer: z.boolean().default(true),
  gameMode: z.enum(["children", "adult", "4all"]).default("4all"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Main Profile Page ────────────────────────────────────────────────────────

export default function Profile() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const tabParam = new URLSearchParams(search).get("tab");

  const { profileId, isSignedIn, replitUser } = useAuth();
  const { data: profile, isLoading } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });
  const updateProfile = useUpdateProfile();

  // Stats tab
  const [gameTab, setGameTab] = useState<GameTab>(tabParam === "memory" ? "memory" : "sudoku");
  useEffect(() => {
    if (tabParam === "memory") setGameTab("memory");
    else if (tabParam === "sudoku") setGameTab("sudoku");
  }, [tabParam]);

  const { data: stats, isLoading: statsLoading } = useGetPlayerStats(profileId as number, {
    query: { enabled: !!profileId },
  });

  const { data: tournamentStreak } = useQuery<TournamentStreakData>({
    queryKey: ["tournament-streak", profileId],
    queryFn: () => customFetch<TournamentStreakData>(`/api/tournaments/streak/${profileId}`),
    enabled: !!profileId,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", soundEnabled: true, showTimer: true, gameMode: "4all" },
    values: profile
      ? {
          username: profile.username,
          soundEnabled: profile.soundEnabled ?? true,
          showTimer: profile.showTimer ?? true,
          gameMode: (profile.gameMode ?? "4all") as "children" | "adult" | "4all",
        }
      : undefined,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profileId) return;
    try {
      await updateProfile.mutateAsync({ id: profileId, data });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const { data: badges } = useGetProfileBadges(profileId as number, {
    query: { enabled: !!profileId },
  });

  const [shareSheetToken, setShareSheetToken] = React.useState<string | null>(null);
  const shareSheetBadge = badges?.find((b) => b.shareToken === shareSheetToken);
  const shareSheetMeta = shareSheetBadge ? (BADGE_META[shareSheetBadge.badgeType] ?? BADGE_META["weekly_1st"]) : null;
  const shareSheetUrl = shareSheetToken
    ? `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/badges/${shareSheetToken}`
    : "";

  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  }

  const mem = stats?.memory;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">Your profile, stats, and game preferences.</p>
      </div>

      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {isSignedIn ? <User className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            {isSignedIn ? "Signed-in Account" : "Anonymous (Device)"}
          </CardTitle>
          {!isSignedIn && (
            <CardDescription className="text-xs">
              Sign in to sync your progress across devices.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignedIn && replitUser ? (
            <div className="flex items-center gap-4">
              {replitUser.profileImageUrl && (
                <img src={replitUser.profileImageUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-border" />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {replitUser.firstName && replitUser.lastName
                    ? `${replitUser.firstName} ${replitUser.lastName}`
                    : replitUser.firstName ?? replitUser.email ?? "User"}
                </p>
                {replitUser.email && <p className="text-sm text-muted-foreground truncate">{replitUser.email}</p>}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">🎮</div>
              <div>
                <p className="font-semibold">{profile?.username}</p>
                <p className="text-xs text-muted-foreground">Playing on this device only</p>
              </div>
            </div>
          )}
          {isSignedIn ? (
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive"
              onClick={() => { const from = encodeURIComponent(window.location.origin); window.location.href = apiUrl(`/api/logout?from=${from}`); }}
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={() => { const from = encodeURIComponent(window.location.origin); window.location.href = apiUrl(`/api/login?from=${from}`); }}
            >
              <LogIn className="w-4 h-4" /> Sign in
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── Level / XP ───────────────────────────────────────────────────── */}
      {profileId && profile && (
        <>
          <LevelCard xp={profile.xp ?? 0} />
          <RankGuide currentXp={profile.xp ?? 0} />
        </>
      )}

      {/* ── Gems ─────────────────────────────────────────────────────────── */}
      {profileId && profile && (
        <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-cyan-200 dark:border-cyan-800">
          <CardContent className="pt-5 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                <Gem className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">Gem Balance</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 text-sm" side="bottom" align="start">
                      <p className="font-semibold mb-2 flex items-center gap-1.5">
                        <Gem className="w-4 h-4 text-cyan-500" /> How to earn gems
                      </p>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-base leading-none mt-0.5">🧩</span>
                          <span><span className="font-medium text-foreground">Complete a Sudoku or Memory puzzle</span> — 1💎 per 5,000 points scored (at least 1💎 per game).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-base leading-none mt-0.5">🔥</span>
                          <span><span className="font-medium text-foreground">Daily login streak</span> — log in every day to increase your tier and earn more gems.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-base leading-none mt-0.5">⚔️</span>
                          <span><span className="font-medium text-foreground">Win a challenge or duel</span> — beat your opponent's score to earn 10💎.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-base leading-none mt-0.5">📅</span>
                          <span><span className="font-medium text-foreground">Daily Memory challenge</span> — 1💎 for completing it, 3💎 if you set a new record.</span>
                        </li>
                      </ul>
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
                  Tap <Info className="w-3 h-3 inline" /> to see all the ways to earn gems
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300 tabular-nums">
                {(profile.gems ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-cyan-500 dark:text-cyan-500 mt-0.5">💎 gems</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Statistics ───────────────────────────────────────────────────── */}
      {profileId && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-serif font-bold tracking-tight">Statistics</h2>
          </div>

          {/* Game tab toggle */}
          <div className="flex rounded-xl border bg-muted/40 p-1 gap-1">
            <button
              onClick={() => setGameTab("sudoku")}
              className={[
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                gameTab === "sudoku"
                  ? "bg-white dark:bg-card shadow text-orange-600 border border-orange-200/60"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Hash className="w-4 h-4" /> Sudoku
            </button>
            <button
              onClick={() => setGameTab("memory")}
              className={[
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                gameTab === "memory"
                  ? "bg-white dark:bg-card shadow text-purple-600 border border-purple-200/60"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Brain className="w-4 h-4" /> Memory Match
            </button>
          </div>

          {statsLoading && (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24" /><Skeleton className="h-24" />
                <Skeleton className="h-24" /><Skeleton className="h-24" />
              </div>
            </div>
          )}

          {/* ── Sudoku tab ───────────────────────────────────── */}
          {!statsLoading && gameTab === "sudoku" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <StreakCalendar profileId={profileId} />

              {stats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-card border-primary/10 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-full text-primary"><Hash className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Total Games</p>
                        <p className="text-2xl font-bold">{stats.totalGames}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-primary/10 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-green-100 text-green-700 rounded-full"><Target className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                        <p className="text-2xl font-bold">{Math.round((stats.winRate || 0) * 100)}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-primary/10 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-orange-100 text-orange-700 rounded-full"><Zap className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Win Streak</p>
                        <p className="text-2xl font-bold">{stats.currentStreak || 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-primary/10 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-full"><TrendingUp className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Total Wins</p>
                        <p className="text-2xl font-bold">{stats.totalWins}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="w-4 h-4 text-primary" /> Best Times by Difficulty
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(["easy", "medium", "hard", "expert"] as const).map((diff) => (
                          <div key={diff} className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <span className="capitalize font-medium">{diff}</span>
                            <span className="font-mono text-lg font-bold text-primary">{formatTime(stats.bestTimes?.[diff])}</span>
                          </div>
                        ))}
                      </div>
                      {stats.averageTime != null && (
                        <div className="mt-3 flex justify-between items-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <span className="font-medium text-sm">Avg. Completion Time</span>
                          <span className="font-mono text-lg font-bold text-primary">{formatTime(stats.averageTime)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">Play some Sudoku games to see your stats!</p>
              )}

              <AchievementsCard profileId={profileId} game="sudoku" />
            </div>
          )}

          {/* ── Memory tab ───────────────────────────────────── */}
          {!statsLoading && gameTab === "memory" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <MemoryStreakCalendar profileId={profileId} />

              {mem ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-card border-purple-100 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Layers className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Total Games</p>
                        <p className="text-2xl font-bold">{mem.totalGames ?? 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-purple-100 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-green-100 text-green-700 rounded-full"><Target className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Complete Rate</p>
                        <p className="text-2xl font-bold">{Math.round((mem.winRate || 0) * 100)}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-purple-100 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-purple-100 text-purple-700 rounded-full"><Flame className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Daily Streak</p>
                        <p className="text-2xl font-bold">{mem.currentStreak ?? 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-purple-100 shadow-sm">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-full"><TrendingUp className="w-5 h-5" /></div>
                        <p className="text-xs text-muted-foreground">Best Streak</p>
                        <p className="text-2xl font-bold">{mem.longestStreak ?? 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm border-purple-200/60">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="w-4 h-4 text-purple-500" /> Best Times by Grid Size
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {([2, 4, 6, 8] as const).map((size) => (
                          <div key={size} className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div>
                              <span className="font-medium">{size}×{size} Grid</span>
                              <span className="text-xs text-muted-foreground ml-2">({(size * size) / 2} pairs)</span>
                            </div>
                            <span className="font-mono text-lg font-bold text-purple-600">
                              {formatTime(mem.bestTimes?.[String(size)])}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {mem.averageTime != null && (
                          <div className="flex justify-between items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                            <span className="font-medium text-sm">Avg. Time</span>
                            <span className="font-mono text-lg font-bold text-purple-600">{formatTime(mem.averageTime)}</span>
                          </div>
                        )}
                        {mem.averageFlips != null && (
                          <div className="flex justify-between items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                            <span className="font-medium text-sm">Avg. Flips</span>
                            <span className="font-mono text-lg font-bold text-purple-600">{mem.averageFlips}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">Play some Memory Match games to see your stats!</p>
              )}

              <AchievementsCard profileId={profileId} game="memory" />
            </div>
          )}
        </div>
      )}

      {/* ── Tournament Streak ─────────────────────────────────────────────── */}
      {profileId && tournamentStreak && tournamentStreak.totalTop3Finishes > 0 && (
        <Card
          className="cursor-pointer hover:border-violet-300 transition-colors border-violet-200/70 bg-gradient-to-br from-violet-50 to-purple-50"
          onClick={() => setLocation("/leaderboard")}
        >
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-violet-500" />
                <p className="text-sm font-semibold text-violet-800">Tournament Streak</p>
              </div>
              <span className="text-xs text-violet-500 underline underline-offset-2">View leaderboard →</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-black text-violet-600 flex items-center justify-center gap-0.5">
                  {tournamentStreak.currentStreak > 0 && <span className="text-lg">🔥</span>}
                  {tournamentStreak.currentStreak}
                </p>
                <p className="text-xs text-muted-foreground">current</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{tournamentStreak.bestStreak}</p>
                <p className="text-xs text-muted-foreground">best</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{tournamentStreak.totalTop3Finishes}</p>
                <p className="text-xs text-muted-foreground">top-3 total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tournament Badges ─────────────────────────────────────────────── */}
      {profileId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Tournament Badges
            </CardTitle>
            {(!badges || badges.length === 0) && (
              <CardDescription className="text-xs">
                Finish in the top 3 of a weekly or monthly tournament to earn badges.
              </CardDescription>
            )}
          </CardHeader>
          {badges && badges.length > 0 && (
            <CardContent className="space-y-3">
              {badges.map((badge) => {
                const meta = BADGE_META[badge.badgeType] ?? BADGE_META["weekly_1st"];
                return (
                  <div key={badge.id} className={`flex items-center justify-between rounded-xl border-2 p-3 ${meta.borderColor}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${meta.bg}`}>
                        {meta.emoji}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${meta.color}`}>{meta.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPeriodLabel(badge.tournamentPeriod)} · {badge.totalPoints.toLocaleString()} pts
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8" onClick={() => setShareSheetToken(badge.shareToken)}>
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* ── Game Preferences ─────────────────────────────────────────────── */}
      {profileId && (
        <Card>
          <CardHeader>
            <CardTitle>Game Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl><Input placeholder="Enter display name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soundEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <FormLabel className="text-base">Sound Effects</FormLabel>
                          <FormDescription>Play sounds during gameplay.</FormDescription>
                        </div>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showTimer"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel className="text-base">Show Timer</FormLabel>
                        <FormDescription>Display elapsed time during gameplay.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gameMode"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4 space-y-3">
                      <div>
                        <FormLabel className="text-base">Game Mode</FormLabel>
                        <FormDescription>Controls which difficulty levels appear in both games.</FormDescription>
                      </div>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={v => v && field.onChange(v)}
                          className="grid grid-cols-3 gap-2"
                        >
                          <ToggleGroupItem value="children" className="flex-col h-16 gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                            <Baby className="w-4 h-4" />
                            <span className="text-xs font-semibold">Kids</span>
                            <span className="text-[10px] opacity-70 leading-none">Easy · Medium</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="4all" className="flex-col h-16 gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                            <Globe className="w-4 h-4" />
                            <span className="text-xs font-semibold">4 All</span>
                            <span className="text-[10px] opacity-70 leading-none">All levels</span>
                          </ToggleGroupItem>
                          <ToggleGroupItem value="adult" className="flex-col h-16 gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                            <Dumbbell className="w-4 h-4" />
                            <span className="text-xs font-semibold">Adult</span>
                            <span className="text-[10px] opacity-70 leading-none">Hard · Expert</span>
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving…" : "Save Preferences"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {shareSheetBadge && shareSheetMeta && (
        <BadgeShareSheet
          open={!!shareSheetToken}
          onClose={() => setShareSheetToken(null)}
          shareUrl={shareSheetUrl}
          badgeTitle={shareSheetMeta.title}
          username={profile?.username ?? "Player"}
          points={shareSheetBadge.totalPoints}
          period={formatPeriodLabel(shareSheetBadge.tournamentPeriod)}
        />
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="border-t pt-6 pb-4 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setLocation("/about")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Info className="w-3.5 h-3.5" /> About
          </button>
          <span className="text-border">·</span>
          <button onClick={() => setLocation("/privacy")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
          </button>
          <span className="text-border">·</span>
          <button onClick={() => setLocation("/terms")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="w-3.5 h-3.5" /> Terms
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} Brain Games 4 All. All rights reserved.</p>
      </div>
    </div>
  );
}
