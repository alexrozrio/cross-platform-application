import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Clock3, Flame, Images, Trophy } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ODD_IMAGE_LEVELS, type OddImageLevel } from "@/lib/odd-images";
import { getTheme } from "@/lib/themes";

type DailyConfig = { date: string; level: OddImageLevel; theme: string; seed: number };
type DailyEntry = { rank: number; profileId: number; username: string; avatar: string | null; points: number; elapsedSeconds: number };

export default function OddImagesDailyChallengePage() {
  const { profileId } = useAuth();
  usePageMeta({ title: "Daily Odd Images Challenge | Play Brain Games", description: "Find today's shared odd image puzzle and compare your score with other players.", path: "/odd-images-challenge" });
  const configQuery = useQuery({ queryKey: ["/api/odd-image-games/daily-challenge"], queryFn: () => customFetch<DailyConfig>("/api/odd-image-games/daily-challenge"), staleTime: 60_000 });
  const leaderboardQuery = useQuery({ queryKey: ["/api/odd-image-games/daily-challenge/leaderboard"], queryFn: () => customFetch<{ date: string; entries: DailyEntry[] }>("/api/odd-image-games/daily-challenge/leaderboard"), staleTime: 30_000 });
  const statusQuery = useQuery({ queryKey: [`/api/odd-image-games/daily-challenge/status/${profileId}`], queryFn: () => customFetch<{ completed: boolean; attempts: number; bestPoints: number | null }>(`/api/odd-image-games/daily-challenge/status/${profileId}`), enabled: Boolean(profileId) });
  const config = configQuery.data;
  const level = config ? ODD_IMAGE_LEVELS[config.level] : null;
  const theme = config ? getTheme(config.theme) : null;
  const completed = statusQuery.data?.completed ?? false;
  const startHref = config ? `/odd-images?play=1&dailyDate=${config.date}&level=${config.level}&theme=${encodeURIComponent(config.theme)}&seed=${config.seed}` : "/odd-images";
  return <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-12 pt-5">
    <div className="space-y-2 rounded-2xl border bg-card px-5 py-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Home</Link>
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={16} />{config ? new Date(`${config.date}T00:00:00Z`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : <Skeleton className="h-4 w-32" />}</div>
      <h1 className="flex items-center gap-2 font-serif text-3xl font-bold"><Flame className="h-7 w-7 text-teal-500" /> Daily Odd Images</h1>
      <p className="text-sm text-muted-foreground">One shared image grid for everyone, refreshed at 00:00 UTC.</p>
    </div>
    <Card className="border-teal-200/60 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md dark:border-teal-800/50 dark:from-teal-950/40 dark:to-cyan-950/30"><CardContent className="space-y-4 pb-5 pt-6">
      {configQuery.isLoading ? <Skeleton className="h-12 w-full" /> : config ? <>
        <div className="flex items-center justify-between gap-3"><div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Today&apos;s shared puzzle</p><p className="font-semibold">{theme?.name ?? config.theme} · {level?.label}</p><p className="text-xs text-muted-foreground">{level?.detail} · Seed {config.seed}</p>{completed && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600"><Trophy size={13} /> Today&apos;s challenge completed</p>}{statusQuery.data?.bestPoints != null && <p className="text-xs text-muted-foreground">Your best: {statusQuery.data.bestPoints.toLocaleString()} points</p>}</div><Button asChild className="shrink-0 gap-2 bg-teal-600 text-white hover:bg-teal-700"><Link href={startHref}><Images size={16} /> {completed ? "Play again" : "Play"}</Link></Button></div>
        <div className="flex items-center gap-1.5 border-t border-teal-200/70 pt-3 text-xs text-muted-foreground dark:border-teal-800/50"><Clock3 size={13} /> Refreshes at 00:00 UTC each day</div>
      </> : <p className="text-sm text-destructive">Today&apos;s puzzle could not be loaded. Please try again.</p>}
    </CardContent></Card>
    <section className="space-y-3"><h2 className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-base font-semibold shadow-sm"><Trophy className="h-4 w-4 text-teal-500" /> Today&apos;s Leaderboard</h2><Card><CardContent className="divide-y p-3">{leaderboardQuery.data?.entries.length ? leaderboardQuery.data.entries.map((entry) => <div key={entry.profileId} className={`flex items-center gap-3 py-3 ${entry.profileId === profileId ? "rounded-lg bg-primary/5 px-2" : ""}`}><span className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">{entry.rank}</span><div className="min-w-0 flex-1"><Link href={`/player/${entry.profileId}`} className="truncate text-sm font-semibold hover:underline">{entry.username}{entry.profileId === profileId ? " (you)" : ""}</Link><p className="text-xs text-muted-foreground">{Math.floor(entry.elapsedSeconds / 60)}:{String(entry.elapsedSeconds % 60).padStart(2, "0")}</p></div><div className="text-right"><p className="font-mono text-sm font-bold">{entry.points.toLocaleString()}</p><p className="text-xs text-muted-foreground">points</p></div></div>) : <p className="py-6 text-center text-sm text-muted-foreground">No completions yet today. Be the first!</p>}</CardContent></Card></section>
  </main>;
}
