import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Clock3, Flame, HelpCircle, Trophy } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { quizSubject, type QuizLevel, type QuizSubject } from "@/lib/quiz";

type DailyConfig = { date: string; subject: QuizSubject; level: QuizLevel; questions: number; seed: number };
type DailyEntry = { rank: number; profileId: number; username: string; avatar: string | null; points: number; elapsedSeconds: number; correct: number; questions: number };

export default function QuizDailyChallengePage() {
  const { profileId } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const subjectId = (params.get("subject") as QuizSubject) ?? "science";
  const subject = quizSubject(subjectId);
  usePageMeta({ title: `Daily ${subject.name} | Play Brain Games`, description: `Answer today's shared ${subject.name.toLowerCase()} quiz and compare your score with other players.`, path: `/quiz-challenge?subject=${subject.id}` });
  const configQuery = useQuery({ queryKey: ["/api/quiz-daily-challenge", subject.id], queryFn: () => customFetch<DailyConfig>(`/api/quiz-daily-challenge?subject=${subject.id}`), staleTime: 60_000 });
  const leaderboardQuery = useQuery({ queryKey: ["/api/quiz-daily-challenge/leaderboard", subject.id], queryFn: () => customFetch<{ date: string; entries: DailyEntry[] }>(`/api/quiz-daily-challenge/leaderboard?subject=${subject.id}`), staleTime: 30_000 });
  const statusQuery = useQuery({ queryKey: [`/api/quiz-daily-challenge/status/${profileId}`, subject.id], queryFn: () => customFetch<{ completed: boolean; attempts: number; bestPoints: number | null }>(`/api/quiz-daily-challenge/status/${profileId}?subject=${subject.id}`), enabled: Boolean(profileId) });
  const config = configQuery.data;
  const completed = statusQuery.data?.completed ?? false;
  const startHref = config ? `/quiz/${subject.id}?start=1&dailyDate=${config.date}&level=${config.level}&seed=${config.seed}` : `/quiz/${subject.id}`;
  return <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-12 pt-5">
    <div className="space-y-2 rounded-2xl border bg-card px-5 py-4">
      <Link href={`/quiz/${subject.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> {subject.name}</Link>
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={16} />{config ? new Date(`${config.date}T00:00:00Z`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : <Skeleton className="h-4 w-32" />}</div>
      <h1 className="flex items-center gap-2 font-serif text-3xl font-bold"><Flame className={`h-7 w-7 ${subject.theme.text}`} /> Daily {subject.name}</h1>
      <p className="text-sm text-muted-foreground">One shared quiz for everyone, refreshed at 00:00 UTC.</p>
    </div>
    <Card className={`border ${subject.theme.border} bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} shadow-md`}><CardContent className="space-y-4 pb-5 pt-6">
      {configQuery.isLoading ? <Skeleton className="h-12 w-full" /> : config ? <>
        <div className="flex items-center justify-between gap-3"><div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Today&apos;s shared quiz</p><p className="font-semibold">{subject.levels[config.level].label} · {config.questions} questions</p><p className="text-xs text-muted-foreground">Seed {config.seed}</p>{completed && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600"><Trophy size={13} /> Today&apos;s challenge completed</p>}{statusQuery.data?.bestPoints != null && <p className="text-xs text-muted-foreground">Your best: {statusQuery.data.bestPoints.toLocaleString()} points</p>}</div><Button asChild className={`shrink-0 gap-2 ${subject.theme.btn}`}><Link href={startHref}><HelpCircle size={16} /> {completed ? "Play again" : "Play"}</Link></Button></div>
        <div className={`flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground ${subject.theme.border}`}><Clock3 size={13} /> Refreshes at 00:00 UTC each day</div>
      </> : <p className="text-sm text-destructive">Today&apos;s quiz could not be loaded. Please try again.</p>}
    </CardContent></Card>
    <section className="space-y-3"><h2 className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-base font-semibold shadow-sm"><Trophy className={`h-4 w-4 ${subject.theme.text}`} /> Today&apos;s Leaderboard</h2><Card><CardContent className="divide-y p-3">{leaderboardQuery.data?.entries.length ? leaderboardQuery.data.entries.map((entry) => <div key={entry.profileId} className={`flex items-center gap-3 py-3 ${entry.profileId === profileId ? "rounded-lg bg-primary/5 px-2" : ""}`}><span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${subject.theme.soft}`}>{entry.rank}</span><div className="min-w-0 flex-1"><Link href={`/player/${entry.profileId}`} className="truncate text-sm font-semibold hover:underline">{entry.username}{entry.profileId === profileId ? " (you)" : ""}</Link><p className="text-xs text-muted-foreground">{entry.correct}/{entry.questions} correct · {Math.floor(entry.elapsedSeconds / 60)}:{String(entry.elapsedSeconds % 60).padStart(2, "0")}</p></div><div className="text-right"><p className="font-mono text-sm font-bold">{entry.points.toLocaleString()}</p><p className="text-xs text-muted-foreground">points</p></div></div>) : <p className="py-6 text-center text-sm text-muted-foreground">No completions yet today. Be the first!</p>}</CardContent></Card></section>
  </main>;
}
