import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Clock3, Flame, Puzzle, Share2, Trophy } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { appShareUrlForPath } from "@/lib/app-links";
import { toast } from "sonner";

type DailyConfig = { date: string; gridSize: 2 | 3 | 4 | 5; level: 1 | 2 | 3; imageKey: number };
type DailyStatus = { completed: boolean; attempts: number; bestPoints: number | null };
type DailyEntry = { rank: number; profileId: number; username: string; avatar: string | null; points: number; elapsedSeconds: number };

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function JigsawDailyChallengePage() {
  const { profileId } = useAuth();
  usePageMeta({
    title: "Daily Jigsaw Puzzle Challenge | Play Brain Games . Online",
    description: "Play today's shared picture puzzle, earn points, and compare your time on the daily Jigsaw leaderboard.",
    path: "/jigsaw-challenge",
  });
  const configQuery = useQuery({
    queryKey: ["/api/jigsaw-daily-challenge"],
    queryFn: () => customFetch<DailyConfig>("/api/jigsaw-daily-challenge"),
    staleTime: 60_000,
  });
  const leaderboardQuery = useQuery({
    queryKey: ["/api/jigsaw-daily-challenge/leaderboard"],
    queryFn: () => customFetch<{ date: string; entries: DailyEntry[] }>("/api/jigsaw-daily-challenge/leaderboard"),
    staleTime: 30_000,
  });
  const statusQuery = useQuery({
    queryKey: [`/api/jigsaw-daily-challenge/status/${profileId}`],
    queryFn: () => customFetch<DailyStatus>(`/api/jigsaw-daily-challenge/status/${profileId}`),
    enabled: Boolean(profileId),
  });

  const shareChallenge = async () => {
    const url = appShareUrlForPath("/jigsaw-challenge");
    const text = "Try today's Jigsaw picture puzzle with me.";
    try {
      if (navigator.share) await navigator.share({ title: "Daily Jigsaw Challenge", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Daily challenge link copied.");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Daily challenge link copied.");
      } catch {
        toast.error("Could not share the daily challenge link.");
      }
    }
  };

  const config = configQuery.data;
  const completedToday = statusQuery.data?.completed ?? false;
  const leaderboard = leaderboardQuery.data?.entries ?? [];
  const startHref = config
    ? `/jigsaw?gridSize=${config.gridSize}&level=${config.level}&imageKey=${config.imageKey}&dailyDate=${config.date}&start=1`
    : "/jigsaw";

  return (
    <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-12 pt-5">
      <div className="space-y-1 rounded-2xl border border-border bg-card px-5 py-4">
        <Link href="/jigsaw" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} /> Jigsaw
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays size={16} />
          {config ? new Date(`${config.date}T00:00:00Z`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : <Skeleton className="h-4 w-32" />}
        </div>
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold tracking-tight">
          <Flame className="h-7 w-7 text-amber-500" /> Daily Challenge
        </h1>
        <p className="text-sm text-muted-foreground">One shared picture puzzle, refreshed at 00:00 UTC each day.</p>
      </div>

      <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md dark:border-amber-800/50 dark:from-amber-950/40 dark:to-orange-950/30">
        <CardContent className="space-y-4 pb-5 pt-6">
          {configQuery.isLoading ? (
            <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-24" /></div>
          ) : config ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Today's picture puzzle</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{config.gridSize}×{config.gridSize}</span>
                    <span className="text-sm text-muted-foreground">{["Easy", "Medium", "Hard"][config.level - 1]} · Picture #{config.imageKey}</span>
                  </div>
                  {completedToday && <div className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600"><Trophy size={13} /> You've completed today's challenge!</div>}
                  {statusQuery.data?.bestPoints != null && <p className="text-xs text-muted-foreground">Your best: {statusQuery.data.bestPoints.toLocaleString()} points</p>}
                </div>
                <Button asChild disabled={configQuery.isLoading} className="shrink-0 gap-2 bg-amber-600 text-white hover:bg-amber-700">
                  <Link href={startHref}><Puzzle size={16} /> {completedToday ? "Play Again" : "Play"}</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/70 pt-3 dark:border-amber-800/50">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 size={13} />Refreshes at 00:00 UTC each day</span>
                <Button variant="ghost" size="sm" onClick={() => void shareChallenge()} className="h-8 gap-1.5 px-2 text-xs"><Share2 size={14} /> Share challenge</Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-destructive">Today's puzzle could not be loaded. Please try again shortly.</p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-base font-semibold shadow-sm">
          <Trophy className="h-4 w-4 text-amber-500" /> Today's Leaderboard
          <span className="ml-auto text-xs font-normal text-muted-foreground">{leaderboard.length} completion{leaderboard.length !== 1 ? "s" : ""}</span>
        </h2>
        <Card className="border-primary/10 shadow-md">
          {leaderboardQuery.isLoading ? (
            <CardContent className="space-y-3 pb-4 pt-4">{[1, 2, 3].map((i) => <div key={i} className="flex items-center gap-3"><Skeleton className="h-9 w-9 shrink-0 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-4 w-14" /></div>)}</CardContent>
          ) : leaderboard.length === 0 ? (
            <CardContent className="pb-8 pt-8 text-center"><Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" /><p className="text-sm font-medium text-muted-foreground">No completions yet today</p><p className="mt-0.5 text-xs text-muted-foreground">Be the first to finish!</p></CardContent>
          ) : (
            <CardContent className="divide-y divide-border pb-2 pt-2">
              {leaderboard.map((entry) => (
                <div key={entry.profileId} className={`flex items-center gap-3 py-3 ${entry.profileId === profileId ? "-mx-6 rounded-lg bg-primary/5 px-6" : ""}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{entry.rank}</span>
                  <div className="min-w-0 flex-1"><Link href={`/player/${entry.profileId}`} className="truncate text-sm font-semibold hover:underline">{entry.username}{entry.profileId === profileId && <span className="ml-1 text-xs text-primary">(you)</span>}</Link><p className="text-xs text-muted-foreground">{formatTime(entry.elapsedSeconds)}</p></div>
                  <div className="shrink-0 text-right"><p className="font-mono text-sm font-bold">{entry.points.toLocaleString()}</p><p className="text-xs text-muted-foreground">points</p></div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
        <Link href="/leaderboard/jigsaw/" className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">View all-time leaderboard →</Link>
        <span className="mx-2 text-muted-foreground/50">·</span>
        <Link href="/jigsaw-challenges" className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground">Challenge a friend</Link>
      </div>
    </main>
  );
}
