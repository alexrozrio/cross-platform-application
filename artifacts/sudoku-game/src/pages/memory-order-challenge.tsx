import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Clock3, Eye, Flame, Trophy } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MEMORY_ORDER_LEVELS, type MemoryOrderLevel } from "@/lib/memory-order";
import { getTheme } from "@/lib/themes";

type DailyConfig = { date: string; level: MemoryOrderLevel; theme: string; seed: number };
type DailyEntry = { rank: number; profileId: number; username: string; avatar: string | null; points: number; elapsedSeconds: number };

export default function MemoryOrderDailyChallengePage() {
  const { profileId } = useAuth();
  usePageMeta({ title: "Daily Memory Order Challenge | Play Brain Games", description: "Memorize today's shared image sequence and compare your score with other players.", path: "/memory-order-challenge" });
  const configQuery = useQuery({ queryKey: ["/api/memory-order-games/daily-challenge"], queryFn: () => customFetch<DailyConfig>("/api/memory-order-games/daily-challenge"), staleTime: 60_000 });
  const leaderboardQuery = useQuery({ queryKey: ["/api/memory-order-games/daily-challenge/leaderboard"], queryFn: () => customFetch<{ date: string; entries: DailyEntry[] }>("/api/memory-order-games/daily-challenge/leaderboard"), staleTime: 30_000 });
  const statusQuery = useQuery({ queryKey: [`/api/memory-order-games/daily-challenge/status/${profileId}`], queryFn: () => customFetch<{ completed: boolean; attempts: number; bestPoints: number | null }>(`/api/memory-order-games/daily-challenge/status/${profileId}`), enabled: Boolean(profileId) });
  const config = configQuery.data;
  const level = config ? MEMORY_ORDER_LEVELS[config.level] : null;
  const theme = config ? getTheme(config.theme) : null;
  const completed = statusQuery.data?.completed ?? false;
  const startHref = config ? `/memory-order?play=1&dailyDate=${config.date}&level=${config.level}&theme=${encodeURIComponent(config.theme)}&seed=${config.seed}` : "/memory-order";
  return <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-12 pt-5">
    <div className="space-y-2 rounded-2xl border bg-card px-5 py-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Home</Link>
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={16} />{config ? new Date(`${config.date}T00:00:00Z`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : <Skeleton className="h-4 w-32" />}</div>
      <h1 className="flex items-center gap-2 font-serif text-3xl font-bold"><Flame className="h-7 w-7 text-violet-500" /> Daily Memory Order</h1>
      <p className="text-sm text-muted-foreground">One shared image sequence for everyone, refreshed at 00:00 UTC.</p>
    </div>
    <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50 to-purple-50 shadow-md dark:border-violet-800/50 dark:from-violet-950/40 dark:to-purple-950/30"><CardContent className="space-y-4 pb-5 pt-6">
      {configQuery.isLoading ? <Skeleton className="h-12 w-full" /> : config ? <>
        <div className="flex items-center justify-between gap-3"><div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Today&apos;s shared puzzle</p><p className="font-semibold">{theme?.name ?? config.theme} · {level?.label}</p><p className="text-xs text-muted-foreground">{level?.detail} · Seed {config.seed}</p>{completed && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600"><Trophy size={13} /> Today&apos;s challenge completed</p>}{statusQuery.data?.bestPoints != null && <p className="text-xs text-muted-foreground">Your best: {statusQuery.data.bestPoints.toLocaleString()} points</p>}</div><Button asChild className="shrink-0 gap-2 bg-violet-600 text-white hover:bg-violet-700"><Link href={startHref}><Eye size={16} /> {completed ? "Play again" : "Play"}</Link></Button></div>
        <div className="flex items-center gap-1.5 border-t border-violet-200/70 pt-3 text-xs text-muted-foreground dark:border-violet-800/50"><Clock3 size={13} /> Refreshes at 00:00 UTC each day</div>
      </> : <p className="text-sm text-destructive">Today&apos;s puzzle could not be loaded. Please try again.</p>}
    </CardContent></Card>
    <section className="space-y-3"><h2 className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-base font-semibold shadow-sm"><Trophy className="h-4 w-4 text-violet-500" /> Today&apos;s Leaderboard</h2><Card><CardContent className="divide-y p-3">{leaderboardQuery.data?.entries.length ? leaderboardQuery.data.entries.map((entry) => <div key={entry.profileId} className={`flex items-center gap-3 py-3 ${entry.profileId === profileId ? "rounded-lg bg-primary/5 px-2" : ""}`}><span className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">{entry.rank}</span><div className="min-w-0 flex-1"><Link href={`/player/${entry.profileId}`} className="truncate text-sm font-semibold hover:underline">{entry.username}{entry.profileId === profileId ? " (you)" : ""}</Link><p className="text-xs text-muted-foreground">{Math.floor(entry.elapsedSeconds / 60)}:{String(entry.elapsedSeconds % 60).padStart(2, "0")}</p></div><div className="text-right"><p className="font-mono text-sm font-bold">{entry.points.toLocaleString()}</p><p className="text-xs text-muted-foreground">points</p></div></div>) : <p className="py-6 text-center text-sm text-muted-foreground">No completions yet today. Be the first!</p>}</CardContent></Card></section>
  </main>;
}
