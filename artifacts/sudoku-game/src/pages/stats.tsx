import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetPlayerStats, useGetProfile, customFetch } from '@workspace/api-client-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Zap, Clock, Hash, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LevelCard } from '@/components/level-badge';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function StreakCalendar({ profileId }: { profileId: number }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const month = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;

  const { data: streakInfo } = useQuery({
    queryKey: [`/api/daily-challenge/streak/${profileId}`],
    queryFn: () => customFetch<{ currentStreak: number; longestStreak: number; lastChallengeDate: string | null; completedToday: boolean }>(
      `/api/daily-challenge/streak/${profileId}`
    ),
    enabled: !!profileId,
  });

  const { data: historyData } = useQuery({
    queryKey: [`/api/daily-challenge/history/${profileId}`, month],
    queryFn: () => customFetch<{ month: string; completedDates: string[] }>(
      `/api/daily-challenge/history/${profileId}?month=${month}`
    ),
    enabled: !!profileId,
  });

  const completedSet = new Set(historyData?.completedDates ?? []);

  // Build the grid: days of the month padded by weekday offset
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const todayStr = today.toISOString().slice(0, 10);

  const isPrevDisabled = viewDate <= new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const isNextDisabled = viewDate >= new Date(today.getFullYear(), today.getMonth(), 1);

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <Card className="shadow-md border-primary/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" /> Daily Challenge
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} disabled={isPrevDisabled} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</p>
          <button onClick={nextMonth} disabled={isNextDisabled} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
          ))}

          {/* Empty leading cells */}
          {Array.from({ length: startWeekday }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${month}-${String(day).padStart(2, '0')}`;
            const done = completedSet.has(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;

            return (
              <div
                key={day}
                title={done ? `Completed on ${dateStr}` : undefined}
                className={[
                  'aspect-square flex items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  done
                    ? 'bg-orange-500 text-white'
                    : isToday
                    ? 'ring-2 ring-orange-400 text-foreground'
                    : isFuture
                    ? 'text-muted-foreground/40'
                    : 'text-muted-foreground',
                ].join(' ')}
              >
                {done ? '🔥' : day}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          {completedSet.size} day{completedSet.size !== 1 ? 's' : ''} completed this month
        </p>
      </CardContent>
    </Card>
  );
}

export default function Stats() {
  const { profileId } = useAuth();
  const { data: stats, isLoading } = useGetPlayerStats(profileId as number, { query: { enabled: !!profileId } });
  const { data: profile } = useGetProfile(profileId as number, { query: { enabled: !!profileId } });

  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8 text-center text-muted-foreground">Play some games to see your stats!</div>;
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Your Statistics</h1>
        <p className="text-muted-foreground">Track your puzzle-solving journey.</p>
      </div>

      {profile && <LevelCard xp={profile.xp ?? 0} />}

      {profileId && <StreakCalendar profileId={profileId} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-primary/10 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Hash className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">Total Games</p>
            <p className="text-2xl font-bold">{stats.totalGames}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-primary/10 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-green-100 text-green-700 rounded-full">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold">{Math.round((stats.winRate || 0) * 100)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/10 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-orange-100 text-orange-700 rounded-full">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold">{stats.currentStreak || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/10 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">Total Wins</p>
            <p className="text-2xl font-bold">{stats.totalWins}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Best Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['easy', 'medium', 'hard', 'expert'] as const).map(diff => (
              <div key={diff} className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                <span className="capitalize font-medium">{diff}</span>
                <span className="font-mono text-lg font-bold text-primary">
                  {formatTime(stats.bestTimes?.[diff])}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}