import React from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  CalendarDays,
  Trophy,
  Medal,
  Award,
  Play,
  Timer,
  Repeat2,
  Zap,
  Gem,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { showEventModal } from "@/hooks/use-event-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChallengeConfig {
  type: "daily" | "weekly";
  period: string;
  gridSize: number;
  pairs: number;
  label: string;
  bonusXp: number;
  bonusGems: number;
}

interface ChallengeStatus {
  daily: ChallengeConfig & { completed: boolean; completion: any | null };
  weekly: ChallengeConfig & { completed: boolean; completion: any | null };
}

interface LeaderboardEntry {
  profileId: number;
  username: string;
  avatar: string | null;
  points: number;
  elapsedSeconds: number;
  flips: number;
  bonusXp: number;
  completedAt: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300 shrink-0">
        <Trophy className="w-4 h-4" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 ring-1 ring-slate-300 shrink-0">
        <Medal className="w-4 h-4" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-100 text-orange-700 ring-1 ring-orange-300 shrink-0">
        <Award className="w-4 h-4" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground font-bold text-sm shrink-0">
      {rank}
    </div>
  );
}

// ─── Challenge card ────────────────────────────────────────────────────────────

function ChallengeCard({
  config,
  completed,
  onPlay,
}: {
  config: ChallengeConfig;
  completed: boolean;
  onPlay: () => void;
}) {
  const isDaily = config.type === "daily";
  const Icon = isDaily ? CalendarDays : CalendarRange;
  const accentFrom = isDaily ? "from-violet-50" : "from-amber-50";
  const accentTo = isDaily ? "to-purple-50" : "to-orange-50";
  const border = isDaily ? "border-violet-200/60" : "border-amber-200/60";
  const btnCls = isDaily
    ? "bg-violet-600 hover:bg-violet-700 text-white"
    : "bg-amber-500 hover:bg-amber-600 text-white";

  return (
    <Card
      className={`shadow-md ${border} bg-gradient-to-br ${accentFrom} ${accentTo}`}
    >
      <CardContent className="pt-5 pb-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-3.5 h-3.5" />
              <span className="font-medium">
                {isDaily ? "Daily" : "Weekly"} Challenge
              </span>
              <span className="text-xs">· {config.period}</span>
            </div>
            <p className="font-bold text-lg leading-tight">{config.label}</p>
            {completed && (
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
              </div>
            )}
          </div>

          <Button
            onClick={onPlay}
            className={`gap-2 shrink-0 ${btnCls}`}
            size="sm"
          >
            <Play className="w-3.5 h-3.5" />
            {completed ? "Play again" : "Play"}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/60 border px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span className="font-bold">+{config.bonusXp} bonus XP</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/60 border px-3 py-1.5">
            <Gem className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-bold">+{config.bonusGems} bonus 💎</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5 border-t pt-3">
          <Clock className="w-3 h-3" />
          {isDaily
            ? "Resets at midnight · Bonus awarded once per day"
            : "Resets weekly · Bonus awarded once per week"}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Leaderboard section ───────────────────────────────────────────────────────

function ChallengeLeaderboard({
  type,
  myProfileId,
}: {
  type: "daily" | "weekly";
  myProfileId?: number;
}) {
  const { data, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["memory-challenge-leaderboard", type],
    queryFn: () =>
      customFetch<LeaderboardEntry[]>(
        `/api/memory-challenges/leaderboard?type=${type}`,
      ),
    refetchInterval: 30_000,
  });

  const Icon = type === "daily" ? CalendarDays : CalendarRange;
  const label = type === "daily" ? "Today's" : "This week's";

  return (
    <Card className="shadow-md border-primary/10">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {label} top scores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">No completions yet</p>
            <p className="text-xs mt-0.5">
              Be the first to complete {label.toLowerCase()} challenge!
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {data.map((entry, i) => {
              const isMe =
                myProfileId !== undefined && entry.profileId === myProfileId;
              return (
                <div
                  key={`${entry.profileId}-${i}`}
                  className={`flex items-center justify-between px-5 py-3 transition-colors ${isMe ? "bg-primary/8" : "hover:bg-muted/40"}`}
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={i + 1} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-semibold text-sm ${isMe ? "text-primary" : ""}`}
                        >
                          {entry.username}
                        </p>
                        {isMe && (
                          <span className="text-[9px] font-bold uppercase bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {formatTime(entry.elapsedSeconds)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="w-3 h-3" />
                          {entry.flips} flips
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-black text-lg text-primary tabular-nums">
                      {entry.points.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemoryChallengePage() {
  const [, setLocation] = useLocation();
  const { profileId } = useAuth();
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading } = useQuery<ChallengeStatus>({
    queryKey: ["memory-challenge-status", profileId],
    queryFn: () =>
      customFetch<ChallengeStatus>(
        `/api/memory-challenges/status/${profileId}`,
      ),
    enabled: !!profileId,
    refetchInterval: 30_000,
  });

  const { data: info } = useQuery<{
    daily: ChallengeConfig;
    weekly: ChallengeConfig;
  }>({
    queryKey: ["memory-challenge-info"],
    queryFn: () =>
      customFetch<{ daily: ChallengeConfig; weekly: ChallengeConfig }>(
        "/api/memory-challenges/info",
      ),
    staleTime: 5 * 60 * 1000,
  });

  const completeMutation = useMutation({
    mutationFn: (body: {
      profileId: number;
      type: string;
      elapsedSeconds: number;
      flips: number;
      points: number;
    }) =>
      customFetch<{
        alreadyClaimed: boolean;
        bonusXp: number;
        bonusGems: number;
      }>("/api/memory-challenges/complete", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      if (!data.alreadyClaimed) {
        showEventModal({
          type: "memory_challenge_bonus",
          xp: data.bonusXp,
          gems: data.bonusGems,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["memory-challenge-status"] });
      queryClient.invalidateQueries({
        queryKey: ["memory-challenge-leaderboard"],
      });
    },
  });

  const handlePlay = () => {
    const cfg = status?.daily ?? info?.daily;
    if (!cfg) return;
    setLocation(`/memory?size=${cfg.gridSize}&challenge=daily`);
  };

  const dailyCfg = status?.daily ?? info?.daily;

  return (
    <div className="max-w-lg mx-auto w-full space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1 bg-card rounded-2xl px-5 py-4 border border-border">
        {/*<button
          onClick={() => setLocation('/memory')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Memory Match
        </button>*/}
        <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
          <Brain className="w-7 h-7 text-violet-500" />
          Memory Challenges
        </h1>
        <p className="text-muted-foreground text-sm">
          Complete the daily challenge for bonus XP and gems.
        </p>
      </div>

      {/* Daily challenge card */}
      {statusLoading || !dailyCfg ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <ChallengeCard
          config={dailyCfg}
          completed={status?.daily.completed ?? false}
          onPlay={handlePlay}
        />
      )}
      {!profileId && (
        <p className="text-sm text-center text-muted-foreground">
          <button
            onClick={() => setLocation("/sign-in")}
            className="text-primary underline"
          >
            Sign in
          </button>{" "}
          to track completions and earn bonus rewards.
        </p>
      )}
      <ChallengeLeaderboard type="daily" myProfileId={profileId ?? undefined} />
    </div>
  );
}
