import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Puzzle, Share2, Trophy } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const startHref = config
    ? `/jigsaw?gridSize=${config.gridSize}&level=${config.level}&imageKey=${config.imageKey}&dailyDate=${config.date}&start=1`
    : "/jigsaw";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-12 pt-5 sm:px-7">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> All games
        </Link>
        <Link href="/leaderboard/jigsaw" className="text-sm font-semibold text-primary hover:underline">Jigsaw leaderboard</Link>
      </header>

      <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 p-5 shadow-sm dark:border-amber-900/50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-emerald-950/20 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300"><CalendarDays size={15} /> Daily Jigsaw</p>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">One picture. One shared challenge.</h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Everyone gets the same board today. Assemble the image, finish quickly, and earn points based on the board size, level, and your time.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void shareChallenge()} className="gap-2"><Share2 size={16} /> Share</Button>
            <Button asChild className="gap-2 bg-amber-700 text-white hover:bg-amber-800">
              <Link href={startHref}><Puzzle size={16} /> Play today's puzzle</Link>
            </Button>
          </div>
        </div>

        {configQuery.isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : config ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-amber-200/80 bg-white/70 p-3 dark:bg-background/60"><p className="text-xs text-muted-foreground">Board</p><p className="mt-1 font-serif text-2xl font-bold">{config.gridSize}×{config.gridSize}</p></div>
            <div className="rounded-xl border border-amber-200/80 bg-white/70 p-3 dark:bg-background/60"><p className="text-xs text-muted-foreground">Level</p><p className="mt-1 font-serif text-2xl font-bold">{config.level}</p></div>
            <div className="rounded-xl border border-amber-200/80 bg-white/70 p-3 dark:bg-background/60"><p className="text-xs text-muted-foreground">Picture</p><p className="mt-1 font-serif text-2xl font-bold">#{config.imageKey}</p></div>
            <div className="rounded-xl border border-amber-200/80 bg-white/70 p-3 dark:bg-background/60">
              <p className="text-xs text-muted-foreground">Your best today</p>
              <p className="mt-1 flex items-center gap-1.5 font-serif text-2xl font-bold">{statusQuery.data?.bestPoints?.toLocaleString() ?? "—"}{statusQuery.data?.completed && <CheckCircle2 size={17} className="text-green-600" />}</p>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-destructive">Today's puzzle could not be loaded. Please try again shortly.</p>
        )}
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-600" /> Today's leaderboard</CardTitle>
          <span className="text-xs text-muted-foreground">Best score per player</span>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboardQuery.isLoading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)
            : (leaderboardQuery.data?.entries ?? []).length === 0 ? (
              <p className="rounded-xl bg-muted/50 p-5 text-center text-sm text-muted-foreground">No completed Jigsaw challenges yet today. Be the first to post a score.</p>
            ) : (leaderboardQuery.data?.entries ?? []).map((entry) => (
              <div key={entry.profileId} className="flex items-center gap-3 rounded-xl border bg-card px-3 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{entry.rank}</span>
                <Link href={`/player/${entry.profileId}`} className="min-w-0 flex-1 truncate font-semibold hover:underline">{entry.username}</Link>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={13} />{formatTime(entry.elapsedSeconds)}</span>
                <span className="min-w-16 text-right font-bold tabular-nums">{entry.points.toLocaleString()} pts</span>
              </div>
            ))}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link href="/leaderboard/jigsaw" className="text-sm font-semibold text-primary hover:underline">View all-time Jigsaw leaderboard →</Link>
            <Link href="/jigsaw-challenges" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Challenge a friend</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
