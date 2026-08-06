import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useCreateGame, customFetch } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, CalendarDays, Play, Clock, Flame, Zap, Star, ArrowLeft } from 'lucide-react';

interface DailyChallenge {
  puzzleId: number;
  date: string;
  difficulty: string;
  gridSize: number;
  grid: string;
  solution: string;
}

interface LeaderboardEntry {
  rank: number;
  profileId: number;
  username: string;
  avatar: string | null;
  elapsedSeconds: number;
  mistakeCount: number;
  completedAt: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastChallengeDate: string | null;
  completedToday: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300 shrink-0"><Trophy className="w-4 h-4" /></div>;
  if (rank === 2) return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 ring-1 ring-slate-300 shrink-0"><Medal className="w-4 h-4" /></div>;
  if (rank === 3) return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-100 text-orange-700 ring-1 ring-orange-300 shrink-0"><Award className="w-4 h-4" /></div>;
  return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground font-bold text-sm shrink-0">{rank}</div>;
}

function StreakDisplay({ streak }: { streak: StreakData }) {
  const flames = Math.min(streak.currentStreak, 7);
  return (
    <div className="flex items-stretch gap-3">
      <div className="flex-1 rounded-xl border bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border-orange-200/70 dark:border-orange-800/50 p-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          {Array.from({ length: Math.max(flames, 1) }, (_, i) => (
            <Flame
              key={i}
              className={`w-4 h-4 ${i < streak.currentStreak ? 'text-orange-500' : 'text-muted-foreground/20'}`}
            />
          ))}
        </div>
        <div className="text-2xl font-black text-orange-600">{streak.currentStreak}</div>
        <div className="text-xs text-muted-foreground font-medium">day streak</div>
      </div>
      <div className="flex-1 rounded-xl border bg-card p-4 text-center">
        <div className="flex items-center justify-center mb-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
        </div>
        <div className="text-2xl font-black text-foreground">{streak.longestStreak}</div>
        <div className="text-xs text-muted-foreground font-medium">best streak</div>
      </div>
      <div className="flex-1 rounded-xl border bg-card p-4 text-center">
        <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${streak.completedToday ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
          {streak.completedToday ? '✓ Done' : 'Pending'}
        </div>
        <div className="text-xs text-muted-foreground font-medium mt-1">today</div>
      </div>
    </div>
  );
}

export default function DailyChallenge() {
  const [, setLocation] = useLocation();
  const { profileId } = useAuth();
  const createGame = useCreateGame();

  const { data: challenge, isLoading: challengeLoading } = useQuery<DailyChallenge>({
    queryKey: ['daily-challenge'],
    queryFn: () => customFetch<DailyChallenge>('/api/daily-challenge'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawLeaderboard, isLoading: lbLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['daily-challenge-leaderboard'],
    queryFn: () => customFetch<LeaderboardEntry[]>('/api/daily-challenge/leaderboard'),
    refetchInterval: 30_000,
  });
  const leaderboard: LeaderboardEntry[] = Array.isArray(rawLeaderboard) ? rawLeaderboard : [];

  const { data: streak, isLoading: streakLoading } = useQuery<StreakData>({
    queryKey: ['daily-challenge-streak', profileId],
    queryFn: () => customFetch<StreakData>(`/api/daily-challenge/streak/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 30_000,
  });

  const completedToday = streak?.completedToday ?? leaderboard.some((e) => e.profileId === profileId);

  const handlePlay = async () => {
    if (!profileId || !challenge) return;
    const game = await createGame.mutateAsync({
      data: { profileId, puzzleId: challenge.puzzleId, difficulty: challenge.difficulty as any },
    });
    setLocation(`/game/${game.id}`);
  };

  return (
    <div className="max-w-lg mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1 bg-card rounded-2xl px-5 py-4 border border-border">
        <button
          onClick={() => setLocation('/sudoku')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Sudoku
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          {challenge ? formatDate(challenge.date) : <Skeleton className="h-4 w-40" />}
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
          <Flame className="w-7 h-7 text-orange-500" />
          Daily Challenge
        </h1>
        <p className="text-muted-foreground text-sm">
          One 9×9 Medium puzzle — same for everyone, resets each day.
        </p>
      </div>

      {/* Streak stats */}
      {profileId && (
        <div>
          {streakLoading ? (
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-24 rounded-xl" />
              <Skeleton className="flex-1 h-24 rounded-xl" />
              <Skeleton className="flex-1 h-24 rounded-xl" />
            </div>
          ) : streak ? (
            <StreakDisplay streak={streak} />
          ) : null}
        </div>
      )}

      {/* Play card */}
      <Card className="shadow-md border-orange-200/60 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30">
        <CardContent className="pt-6 pb-5 space-y-4">
          {challengeLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Today's puzzle</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold capitalize bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    {challenge?.difficulty}
                  </span>
                  <span className="text-sm text-muted-foreground">9×9 Classic</span>
                </div>
                {completedToday && (
                  <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <Trophy className="w-3 h-3" /> You've completed today's challenge!
                  </div>
                )}
              </div>
              <Button
                onClick={handlePlay}
                disabled={createGame.isPending}
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Play className="w-4 h-4" />
                {completedToday ? 'Play Again' : 'Play'}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t border-orange-100 dark:border-orange-800/40 pt-3 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Resets at midnight · Complete daily to build your streak
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Today's Leaderboard
          <span className="text-xs text-muted-foreground font-normal ml-auto">{leaderboard.length} completion{leaderboard.length !== 1 ? 's' : ''}</span>
        </h2>

        <Card className="shadow-md border-primary/10">
          {lbLoading ? (
            <CardContent className="pt-4 pb-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-14" />
                </div>
              ))}
            </CardContent>
          ) : leaderboard.length === 0 ? (
            <CardContent className="pt-8 pb-8 text-center">
              <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No completions yet today</p>
              <p className="text-xs text-muted-foreground mt-0.5">Be the first to finish!</p>
            </CardContent>
          ) : (
            <CardContent className="pt-2 pb-2 divide-y divide-border">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className={`flex items-center gap-3 py-3 ${entry.profileId === profileId ? 'bg-primary/5 -mx-6 px-6 rounded-lg' : ''}`}>
                  <RankBadge rank={entry.rank} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {entry.username}
                      {entry.profileId === profileId && <span className="text-primary text-xs ml-1">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.mistakeCount > 0 ? `${entry.mistakeCount} mistake${entry.mistakeCount !== 1 ? 's' : ''}` : 'No mistakes'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-sm">{formatTime(entry.elapsedSeconds)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
        <button
          onClick={() => setLocation('/leaderboard')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          View all-time leaderboard →
        </button>
      </div>
    </div>
  );
}
