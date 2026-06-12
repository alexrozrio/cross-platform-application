import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetPlayerStats } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Zap, Clock, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Stats() {
  const { profileId } = useAuth();
  const { data: stats, isLoading } = useGetPlayerStats(profileId as number, { query: { enabled: !!profileId } });

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