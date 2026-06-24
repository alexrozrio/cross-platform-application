import React, { useState } from 'react';
import { useGetLeaderboard, useGetTournamentLeaderboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Star, CalendarDays, Calendar, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { LevelBadge } from '@/components/level-badge';
import { Skeleton } from '@/components/ui/skeleton';

type MainTab = 'alltime' | 'weekly' | 'monthly';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const diffColor: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-orange-100 text-orange-700 border-orange-200',
  expert: 'bg-red-100 text-red-700 border-red-200',
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300 shrink-0"><Trophy className="w-4 h-4" /></div>;
  if (rank === 2) return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 ring-1 ring-slate-300 shrink-0"><Medal className="w-4 h-4" /></div>;
  if (rank === 3) return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-100 text-orange-700 ring-1 ring-orange-300 shrink-0"><Award className="w-4 h-4" /></div>;
  return <div className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground font-bold text-sm shrink-0">{rank}</div>;
}

// ─── Collapsible XP guide (all-time tab) ──────────────────────────────────────

function XpGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-sm">How XP is earned</p>
          <p className="text-xs text-muted-foreground mt-0.5">XP builds your rank — earned by completing puzzles</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 bg-muted/10 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">XP per completed puzzle</p>
          <div className="grid grid-cols-4 gap-2">
            {([
              { diff: 'easy',   label: 'Easy',   xp: '1 XP',  cls: 'bg-green-100 text-green-700' },
              { diff: 'medium', label: 'Medium', xp: '2 XP',  cls: 'bg-yellow-100 text-yellow-700' },
              { diff: 'hard',   label: 'Hard',   xp: '3 XP',  cls: 'bg-orange-100 text-orange-700' },
              { diff: 'expert', label: 'Expert', xp: '5 XP',  cls: 'bg-red-100 text-red-700' },
            ] as const).map(({ diff, label, xp, cls }) => (
              <div key={diff} className="text-center">
                <div className={`text-xs font-bold rounded-full px-2 py-1 mb-1 ${cls}`}>{label}</div>
                <p className="text-xs font-bold text-foreground">{xp}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            XP is added to your total after every completed game, regardless of speed or mistakes. Harder puzzles reward more XP.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Collapsible points guide (tournament tabs) ────────────────────────────────

function PointsGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-sm">How points are calculated</p>
          <p className="text-xs text-muted-foreground mt-0.5">Speed, difficulty, mistakes and hints all matter</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 bg-muted/10 space-y-4">
          {/* Modifiers */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score modifiers</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span>⚡ Fast finish bonus</span><span className="font-mono text-right text-green-600 font-semibold">up to +50%</span>
              <span>❌ Per mistake penalty</span><span className="font-mono text-right text-red-500">−5% each</span>
              <span>💡 Per hint penalty</span><span className="font-mono text-right text-orange-500">−10% each</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Fast bonus: finish before par time to earn up to +50%. The faster, the higher the bonus.
            </p>
          </div>
          {/* Base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Base points × difficulty</p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted/50 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Grid</span>
                <span className="text-center text-green-700">Easy</span>
                <span className="text-center text-yellow-700">Medium</span>
                <span className="text-center text-orange-700">Hard</span>
                <span className="text-center text-red-700">Expert</span>
              </div>
              {[
                { label: '3×3',   base: 100,  par: '2:00' },
                { label: '4×4',   base: 250,  par: '5:00' },
                { label: '9×9',   base: 1000, par: '15:00' },
                { label: '16×16', base: 2500, par: '45:00' },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? 'bg-muted/20' : ''}`}>
                  <span className="font-semibold">
                    {row.label}
                    <span className="text-[9px] text-muted-foreground font-normal block">par {row.par}</span>
                  </span>
                  <span className="text-center font-mono text-green-700">{row.base}</span>
                  <span className="text-center font-mono text-yellow-700">{Math.round(row.base * 1.5)}</span>
                  <span className="text-center font-mono text-orange-700">{row.base * 2}</span>
                  <span className="text-center font-mono text-red-700">{row.base * 3}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Final score = base × (1 + time bonus) × mistake factor × hint factor. Min 10 pts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── All-time leaderboard ─────────────────────────────────────────────────────

const GRID_LABELS: Record<string, string> = {
  all: 'All Grids',
  '3': '3×3 Baby',
  '4': '4×4 Mini',
  '9': '9×9 Classic',
  '16': '16×16 Pro',
};

function AlltimeBoard() {
  const [gridFilter, setGridFilter] = useState<'all' | '3' | '4' | '9' | '16'>('all');
  const gridSize = gridFilter === 'all' ? undefined : Number(gridFilter) as 3 | 4 | 9 | 16;
  const { data, isLoading } = useGetLeaderboard(
    gridSize !== undefined ? { gridSize: gridSize as any, limit: 50 } : { limit: 50 } as any,
  );

  return (
    <div className="space-y-5">
      <Tabs defaultValue="all" onValueChange={(v) => setGridFilter(v as typeof gridFilter)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="9">9×9</TabsTrigger>
          <TabsTrigger value="16">16×16</TabsTrigger>
          <TabsTrigger value="4">4×4</TabsTrigger>
          <TabsTrigger value="3">3×3</TabsTrigger>
        </TabsList>
      </Tabs>

      <XpGuide />

      <Card className="shadow-md border-primary/10">
        <CardHeader className="bg-card pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Fastest Times — {GRID_LABELS[gridFilter]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : !data || data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">
                {gridFilter === 'all'
                  ? 'No completed games yet.'
                  : `No entries yet for ${gridSize}×${gridSize}.`}
              </p>
              <p className="text-sm mt-1">Complete a puzzle to claim the top spot!</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.map((entry) => (
                <div key={`${entry.profileId}-${entry.rank}`} className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <RankBadge rank={entry.rank} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{entry.username}</p>
                        {entry.xp !== undefined && <LevelBadge xp={entry.xp} size="xs" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{entry.mistakeCount ?? 0} mistake{entry.mistakeCount !== 1 ? 's' : ''}</span>
                        {entry.difficulty && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${diffColor[entry.difficulty] ?? ''}`}>{entry.difficulty}</span>
                        )}
                        {gridFilter === 'all' && entry.gridSize && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-blue-50 text-blue-700 border-blue-200">{entry.gridSize}×{entry.gridSize}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-mono text-xl font-bold text-primary tabular-nums">{formatTime(entry.elapsedSeconds)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(entry.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tournament leaderboard ───────────────────────────────────────────────────

function TournamentBoard({ type }: { type: 'weekly' | 'monthly' }) {
  const [gridSize, setGridSize] = useState<3 | 4 | 9 | 16 | undefined>(undefined);
  const { data, isLoading } = useGetTournamentLeaderboard(
    { type, ...(gridSize !== undefined ? { gridSize: gridSize as any } : {}) },
    { query: { refetchInterval: 60_000 } }
  );

  const Icon = type === 'weekly' ? CalendarDays : Calendar;
  const label = type === 'weekly' ? 'Weekly Tournament' : 'Monthly Tournament';

  return (
    <div className="space-y-5">
      {/* Period info */}
      {data && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          <Icon className="w-4 h-4" />
          <span>Current period: <span className="font-semibold text-foreground">{data.periodLabel}</span></span>
        </div>
      )}

      {/* Grid filter */}
      <Tabs defaultValue="all" onValueChange={(v) => setGridSize(v === 'all' ? undefined : Number(v) as 3 | 4 | 9 | 16)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="9">9×9</TabsTrigger>
          <TabsTrigger value="16">16×16</TabsTrigger>
          <TabsTrigger value="4">4×4</TabsTrigger>
          <TabsTrigger value="3">3×3</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="shadow-md border-primary/10">
        <CardHeader className="bg-card pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            {label} — Points Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : !data || !data.entries || data.entries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No games yet this {type === 'weekly' ? 'week' : 'month'}.</p>
              <p className="text-sm mt-1">Complete puzzles to earn points and climb the rankings!</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.entries.map((entry) => (
                <div key={entry.profileId} className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <RankBadge rank={entry.rank} />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{entry.username}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xl font-black text-primary tabular-nums">
                      {entry.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PointsGuide />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [tab, setTab] = useState<MainTab>('weekly');

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">Compete in weekly and monthly tournaments.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as MainTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly" className="gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="gap-1.5"><Calendar className="w-3.5 h-3.5" />Monthly</TabsTrigger>
          <TabsTrigger value="alltime" className="gap-1.5"><Zap className="w-3.5 h-3.5" />All-time</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'alltime' && <AlltimeBoard />}
      {tab === 'weekly' && <TournamentBoard type="weekly" />}
      {tab === 'monthly' && <TournamentBoard type="monthly" />}
    </div>
  );
}
