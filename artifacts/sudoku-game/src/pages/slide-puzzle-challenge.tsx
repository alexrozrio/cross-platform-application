import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Clock3, Flame, Grid3x3, Trophy } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty, type SlidePuzzleTileStyle } from "@/lib/slide-puzzle";

type DailyConfig = { date: string; difficulty: SlidePuzzleDifficulty; tileStyle: SlidePuzzleTileStyle; themeId: string | null; seed: number };
type DailyEntry = { rank: number; profileId: number; username: string; avatar: string | null; points: number; elapsedSeconds: number };

const STYLE_LABELS: Record<SlidePuzzleTileStyle, string> = { numbers: "Numbers", alphabet: "Alphabet", icons: "Pictures" };

export default function SlidePuzzleDailyChallengePage() {
  const { profileId } = useAuth();
  usePageMeta({ title: "Daily Slide Puzzle Challenge | Play Brain Games", description: "Solve today's shared slide puzzle and compare your score with other players.", path: "/slide-puzzle-challenge" });
  const configQuery = useQuery({ queryKey: ["/api/slide-puzzle-daily-challenge"], queryFn: () => customFetch<DailyConfig>("/api/slide-puzzle-daily-challenge"), staleTime: 60_000 });
  const leaderboardQuery = useQuery({ queryKey: ["/api/slide-puzzle-daily-challenge/leaderboard"], queryFn: () => customFetch<{ date: string; entries: DailyEntry[] }>("/api/slide-puzzle-daily-challenge/leaderboard"), staleTime: 30_000 });
  const statusQuery = useQuery({ queryKey: [`/api/slide-puzzle-daily-challenge/status/${profileId}`], queryFn: () => customFetch<{ completed: boolean; attempts: number; bestPoints: number | null }>(`/api/slide-puzzle-daily-challenge/status/${profileId}`), enabled: Boolean(profileId) });
  const config = configQuery.data;
  const level = config ? SLIDE_PUZZLE_LEVELS[config.difficulty] : null;
  const completed = statusQuery.data?.completed ?? false;
  const startHref = config ? `/slide-puzzle?start=1&dailyDate=${config.date}&difficulty=${config.difficulty}&style=${config.tileStyle}${config.themeId ? `&theme=${config.themeId}` : ""}&seed=${config.seed}` : "/slide-puzzle";
  return <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-12 pt-5">
    <div className="space-y-2 rounded-2xl border bg-card px-5 py-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Home</Link>
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={16} />{config ? new Date(`${config.date}T00:00:00Z`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : <Skeleton className="h-4 w-32" />}</div>
      <h1 className="flex items-center gap-2 font-serif text-3xl font-bold"><Flame className="h-7 w-7 text-sky-500" /> Daily Slide Puzzle</h1>
      <p className="text-sm text-muted-foreground">One shared scramble for everyone, refreshed at 00:00 UTC.</p>
    </div>
    <Card className="border-sky-200/60 bg-gradient-to-br from-sky-50 to-cyan-50 shadow-md dark:border-sky-800/50 dark:from-sky-950/40 dark:to-cyan-950/30"><CardContent className="space-y-4 pb-5 pt-6">
      {configQuery.isLoading ? <Skeleton className="h-12 w-full" /> : config ? <>
        <div className="flex items-center justify-between gap-3"><div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Today&apos;s shared board</p><p className="font-semibold">{level?.label} · {level?.size}×{level?.size} · {STYLE_LABELS[config.tileStyle]} tiles</p><p className="text-xs text-muted-foreground">Seed {config.seed}</p>{completed && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600"><Trophy size={13} /> Today&apos;s challenge completed</p>}{statusQuery.data?.bestPoints != null && <p className="text-xs text-muted-foreground">Your best: {statusQuery.data.bestPoints.toLocaleString()} points</p>}</div><Button asChild className="shrink-0 gap-2 bg-sky-600 text-white hover:bg-sky-700"><Link href={startHref}><Grid3x3 size={16} /> {completed ? "Play again" : "Play"}</Link></Button></div>
        <div className="flex items-center gap-1.5 border-t border-sky-200/70 pt-3 text-xs text-muted-foreground dark:border-sky-800/50"><Clock3 size={13} /> Refreshes at 00:00 UTC each day</div>
      </> : <p className="text-sm text-destructive">Today&apos;s board could not be loaded. Please try again.</p>}
    </CardContent></Card>
    <section className="space-y-3"><h2 className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-base font-semibold shadow-sm"><Trophy className="h-4 w-4 text-sky-500" /> Today&apos;s Leaderboard</h2><Card><CardContent className="divide-y p-3">{leaderboardQuery.data?.entries.length ? leaderboardQuery.data.entries.map((entry) => <div key={entry.profileId} className={`flex items-center gap-3 py-3 ${entry.profileId === profileId ? "rounded-lg bg-primary/5 px-2" : ""}`}><span className="grid h-9 w-9 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">{entry.rank}</span><div className="min-w-0 flex-1"><Link href={`/player/${entry.profileId}`} className="truncate text-sm font-semibold hover:underline">{entry.username}{entry.profileId === profileId ? " (you)" : ""}</Link><p className="text-xs text-muted-foreground">{Math.floor(entry.elapsedSeconds / 60)}:{String(entry.elapsedSeconds % 60).padStart(2, "0")}</p></div><div className="text-right"><p className="font-mono text-sm font-bold">{entry.points.toLocaleString()}</p><p className="text-xs text-muted-foreground">points</p></div></div>) : <p className="py-6 text-center text-sm text-muted-foreground">No completions yet today. Be the first!</p>}</CardContent></Card></section>
  </main>;
}
