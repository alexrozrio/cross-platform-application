import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useGetLeaderboard,
  useGetTournamentLeaderboard,
  customFetch,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Award,
  Star,
  CalendarDays,
  Calendar,
  Zap,
  ChevronDown,
  ChevronUp,
  Brain,
  Timer,
  Repeat2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { LevelBadge } from "@/components/level-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type MainTab = "alltime" | "weekly" | "monthly" | "memory";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const diffColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300 shrink-0">
        <Trophy className="w-4 h-4" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 ring-1 ring-slate-300 shrink-0">
        <Medal className="w-4 h-4" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-100 text-orange-700 ring-1 ring-orange-300 shrink-0">
        <Award className="w-4 h-4" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground font-bold text-sm shrink-0">
      {rank}
    </div>
  );
}

// ─── Collapsible XP guide (all-time tab) ──────────────────────────────────────

function XpGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-sm">How XP is earned</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            XP builds your rank — earned by completing puzzles
          </p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 bg-muted/10 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            XP per completed puzzle
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                {
                  diff: "easy",
                  label: "Easy",
                  xp: "1 XP",
                  cls: "bg-green-100 text-green-700",
                },
                {
                  diff: "medium",
                  label: "Medium",
                  xp: "2 XP",
                  cls: "bg-yellow-100 text-yellow-700",
                },
                {
                  diff: "hard",
                  label: "Hard",
                  xp: "3 XP",
                  cls: "bg-orange-100 text-orange-700",
                },
                {
                  diff: "expert",
                  label: "Expert",
                  xp: "5 XP",
                  cls: "bg-red-100 text-red-700",
                },
              ] as const
            ).map(({ diff, label, xp, cls }) => (
              <div key={diff} className="text-center">
                <div
                  className={`text-xs font-bold rounded-full px-2 py-1 mb-1 ${cls}`}
                >
                  {label}
                </div>
                <p className="text-xs font-bold text-foreground">{xp}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            XP is added to your total after every completed game, regardless of
            speed or mistakes. Harder puzzles reward more XP.
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
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-sm">How points are calculated</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Speed, difficulty, mistakes and hints all matter
          </p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 bg-muted/10 space-y-4">
          {/* Modifiers */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Score modifiers
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span>⚡ Fast finish bonus</span>
              <span className="font-mono text-right text-green-600 font-semibold">
                up to +50%
              </span>
              <span>❌ Per mistake penalty</span>
              <span className="font-mono text-right text-red-500">
                −5% each
              </span>
              <span>💡 Per hint penalty</span>
              <span className="font-mono text-right text-orange-500">
                −10% each
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Fast bonus: finish before par time to earn up to +50%. The faster,
              the higher the bonus.
            </p>
          </div>
          {/* Sudoku base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🔢 Sudoku — base points × difficulty
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted/50 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Grid</span>
                <span className="text-center text-green-700">Easy</span>
                <span className="text-center text-yellow-700">Medium</span>
                <span className="text-center text-orange-700">Hard</span>
                <span className="text-center text-red-700">Expert</span>
              </div>
              {[
                { label: "3×3", base: 100, par: "2:00" },
                { label: "4×4", base: 250, par: "5:00" },
                { label: "9×9", base: 1000, par: "15:00" },
                { label: "16×16", base: 2500, par: "45:00" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                >
                  <span className="font-semibold">
                    {row.label}
                    <span className="text-[9px] text-muted-foreground font-normal block">
                      par {row.par}
                    </span>
                  </span>
                  <span className="text-center font-mono text-green-700">
                    {row.base}
                  </span>
                  <span className="text-center font-mono text-yellow-700">
                    {Math.round(row.base * 1.5)}
                  </span>
                  <span className="text-center font-mono text-orange-700">
                    {row.base * 2}
                  </span>
                  <span className="text-center font-mono text-red-700">
                    {row.base * 3}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Final score = base × (1 + time bonus) × mistake factor × hint
              factor. Min 10 pts.
            </p>
          </div>

          {/* Memory Match base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🃏 Memory Match — base points (All tab only)
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-4 bg-muted/50 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Max pts</span>
              </div>
              {[
                {
                  label: "Beginner",
                  base: 150,
                  par: "0:25",
                  max: 225,
                  cls: "text-green-700",
                },
                {
                  label: "Easy",
                  base: 500,
                  par: "1:00",
                  max: 750,
                  cls: "text-blue-700",
                },
                {
                  label: "Medium",
                  base: 1200,
                  par: "2:00",
                  max: 1800,
                  cls: "text-yellow-700",
                },
                {
                  label: "Hard",
                  base: 2500,
                  par: "3:20",
                  max: 3750,
                  cls: "text-orange-700",
                },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                >
                  <span className={`font-semibold ${row.cls}`}>
                    {row.label}
                  </span>
                  <span className="text-center font-mono">{row.base}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono text-green-600">
                    ~{row.max}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × (1 + speed bonus) × flip factor &nbsp;·&nbsp; speed
              bonus up to +50%, −2% per extra flip.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── All-time leaderboard ─────────────────────────────────────────────────────

const GRID_LABELS: Record<string, string> = {
  all: "All Grids",
  "3": "3×3 Baby",
  "4": "4×4 Mini",
  "9": "9×9 Classic",
  "16": "16×16 Pro",
};

function AlltimeBoard({ myProfileId }: { myProfileId?: number }) {
  const [gridFilter, setGridFilter] = useState<"all" | "3" | "4" | "9" | "16">(
    "all",
  );
  const gridSize =
    gridFilter === "all" ? undefined : (Number(gridFilter) as 3 | 4 | 9 | 16);
  const { data, isLoading } = useGetLeaderboard(
    gridSize !== undefined
      ? { gridSize: gridSize as any, limit: 50 }
      : ({ limit: 50 } as any),
  );

  return (
    <div className="space-y-5">
      <Tabs
        defaultValue="all"
        onValueChange={(v) => setGridFilter(v as typeof gridFilter)}
        className="w-full"
      >
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
            <Zap className="w-5 h-5 text-primary" />
            Fastest Times — {GRID_LABELS[gridFilter]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">
                {gridFilter === "all"
                  ? "No completed games yet."
                  : `No entries yet for ${gridSize}×${gridSize}.`}
              </p>
              <p className="text-sm mt-1">
                Complete a puzzle to claim the top spot!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {data.map((entry) => {
                const isMe =
                  myProfileId !== undefined && entry.profileId === myProfileId;
                return (
                  <div
                    key={`${entry.profileId}-${entry.rank}`}
                    className={`flex items-center justify-between px-5 py-4 transition-colors ${isMe ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-center gap-4">
                      <RankBadge rank={entry.rank} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`font-semibold truncate ${isMe ? "text-primary" : ""}`}
                          >
                            {entry.username}
                          </p>
                          {isMe && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                              You
                            </span>
                          )}
                          {entry.xp !== undefined && (
                            <LevelBadge xp={entry.xp} size="xs" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {entry.mistakeCount ?? 0} mistake
                            {entry.mistakeCount !== 1 ? "s" : ""}
                          </span>
                          {entry.difficulty && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${diffColor[entry.difficulty] ?? ""}`}
                            >
                              {entry.difficulty}
                            </span>
                          )}
                          {gridFilter === "all" && entry.gridSize && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-blue-50 text-blue-700 border-blue-200">
                              {entry.gridSize}×{entry.gridSize}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p
                        className={`font-black text-xl tabular-nums ${isMe ? "text-primary" : "text-primary"}`}
                      >
                        {(entry as any).points != null
                          ? ((entry as any).points as number).toLocaleString()
                          : formatTime(entry.elapsedSeconds)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(entry as any).points != null ? "pts" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <XpGuide />
    </div>
  );
}

// ─── Tournament leaderboard ───────────────────────────────────────────────────

interface BreakdownData {
  sudoku: { gridSize: number; points: number; games: number }[];
  memory: { gridSize: number; points: number; games: number }[];
}

const SUDOKU_GRID_NAMES: Record<number, string> = {
  3: "3×3",
  4: "4×4",
  9: "9×9",
  16: "16×16",
};
const MEMORY_LEVEL_NAMES: Record<number, string> = {
  2: "Beginner",
  4: "Easy",
  6: "Medium",
  8: "Hard",
};

function BreakdownPanel({
  profileId,
  type,
  period,
}: {
  profileId: number;
  type: "weekly" | "monthly";
  period: string;
}) {
  const [bdTab, setBdTab] = useState<"sudoku" | "memory">("sudoku");
  const { data, isLoading } = useQuery<BreakdownData>({
    queryKey: ["tournament-breakdown", profileId, type, period],
    queryFn: () =>
      customFetch<BreakdownData>(
        `/api/tournaments/breakdown?profileId=${profileId}&type=${type}&period=${encodeURIComponent(period)}`,
      ),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-4 pt-2 space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="px-5 pb-4 pt-1 border-t bg-muted/20">
      {/* mini tabs */}
      <div className="flex gap-1 mt-2 mb-3">
        <button
          onClick={() => setBdTab("sudoku")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${bdTab === "sudoku" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          🔢 Sudoku
        </button>
        <button
          onClick={() => setBdTab("memory")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${bdTab === "memory" ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          🃏 Memory
        </button>
      </div>

      {bdTab === "sudoku" && (
        <div className="grid grid-cols-4 gap-2">
          {(
            data?.sudoku ??
            [3, 4, 9, 16].map((gs) => ({ gridSize: gs, points: 0, games: 0 }))
          ).map((item) => (
            <div
              key={item.gridSize}
              className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "bg-background border-primary/20" : "bg-muted/30 border-border opacity-50"}`}
            >
              <p className="text-xs font-bold text-foreground">
                {SUDOKU_GRID_NAMES[item.gridSize]}
              </p>
              <p className="text-lg font-black text-primary mt-0.5 tabular-nums leading-tight">
                {item.points > 0 ? item.points.toLocaleString() : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {item.games > 0
                  ? `${item.games} game${item.games !== 1 ? "s" : ""}`
                  : "no games"}
              </p>
            </div>
          ))}
        </div>
      )}

      {bdTab === "memory" && (
        <div className="grid grid-cols-4 gap-2">
          {(
            data?.memory ??
            [2, 4, 6, 8].map((gs) => ({ gridSize: gs, points: 0, games: 0 }))
          ).map((item) => (
            <div
              key={item.gridSize}
              className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "bg-background border-violet-300" : "bg-muted/30 border-border opacity-50"}`}
            >
              <p className="text-xs font-bold text-foreground">
                {MEMORY_LEVEL_NAMES[item.gridSize]}
              </p>
              <p className="text-lg font-black text-violet-600 mt-0.5 tabular-nums leading-tight">
                {item.points > 0 ? item.points.toLocaleString() : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {item.games > 0
                  ? `${item.games} game${item.games !== 1 ? "s" : ""}`
                  : "no games"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TournamentBoard({
  type,
  myProfileId,
}: {
  type: "weekly" | "monthly";
  myProfileId?: number;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rankDelta, setRankDelta] = useState<number | null>(null);

  const prevRankRef = useRef<number | null>(null);
  const isFirstFetchRef = useRef(true);

  const { data, isLoading } = useGetTournamentLeaderboard({ type } as any, {
    query: { refetchInterval: 30_000 },
  });

  // Detect rank changes across refetches and show toast + delta badge
  useEffect(() => {
    if (!data?.entries || !myProfileId) return;
    const myEntry = data.entries.find((e) => e.profileId === myProfileId);
    const newRank = myEntry?.rank ?? null;

    if (isFirstFetchRef.current) {
      // First load — just record, no notification
      prevRankRef.current = newRank;
      isFirstFetchRef.current = false;
      return;
    }

    if (
      newRank !== null &&
      prevRankRef.current !== null &&
      newRank !== prevRankRef.current
    ) {
      const delta = prevRankRef.current - newRank; // positive = moved up
      setRankDelta(delta);

      if (delta > 0) {
        toast.success(
          `You moved up ${delta} spot${delta !== 1 ? "s" : ""}! 🎉`,
          {
            description: `Now ranked #${newRank} on the ${type} leaderboard.`,
            duration: 6000,
          },
        );
      } else {
        toast(
          `You dropped ${Math.abs(delta)} spot${Math.abs(delta) !== 1 ? "s" : ""}.`,
          {
            description: `Now ranked #${newRank}. Keep playing to climb back up!`,
            duration: 5000,
          },
        );
      }

      // Clear the visual delta badge after 12 s
      setTimeout(() => setRankDelta(null), 12000);
    }

    prevRankRef.current = newRank;
  }, [data, myProfileId, type]);

  const Icon = type === "weekly" ? CalendarDays : Calendar;
  const label = type === "weekly" ? "Weekly Tournament" : "Monthly Tournament";

  const toggleRow = (profileId: number) => {
    setExpandedId((prev) => (prev === profileId ? null : profileId));
  };

  return (
    <div className="space-y-5">
      {/* Period info */}
      {data && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          <Icon className="w-4 h-4" />
          <span>
            Current period:{" "}
            <span className="font-semibold text-foreground">
              {data.periodLabel}
            </span>
          </span>
        </div>
      )}

      <Card className="shadow-md border-primary/10">
        <CardHeader className="bg-card pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            {label} — Total Score Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || !data.entries || data.entries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">
                No games yet this {type === "weekly" ? "week" : "month"}.
              </p>
              <p className="text-sm mt-1">
                Complete puzzles to earn points and climb the rankings!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {data.entries.map((entry) => {
                const isMe =
                  myProfileId !== undefined && entry.profileId === myProfileId;
                const isExpanded = expandedId === entry.profileId;
                return (
                  <div key={entry.profileId}>
                    <button
                      onClick={() => toggleRow(entry.profileId)}
                      className={`w-full flex items-center justify-between px-5 py-4 transition-colors text-left ${isMe ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <RankBadge rank={entry.rank} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={`font-semibold truncate ${isMe ? "text-primary" : ""}`}
                            >
                              {entry.username}
                            </p>
                            {isMe && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                                You
                              </span>
                            )}
                            {isMe && rankDelta !== null && (
                              <span
                                className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 border flex items-center gap-0.5 animate-in fade-in duration-300 ${
                                  rankDelta > 0
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : rankDelta < 0
                                      ? "bg-red-100 text-red-600 border-red-200"
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                {rankDelta > 0 ? (
                                  <>
                                    <TrendingUp className="w-2.5 h-2.5" /> +
                                    {rankDelta}
                                  </>
                                ) : rankDelta < 0 ? (
                                  <>
                                    <TrendingDown className="w-2.5 h-2.5" />{" "}
                                    {rankDelta}
                                  </>
                                ) : (
                                  <>
                                    <Minus className="w-2.5 h-2.5" /> 0
                                  </>
                                )}
                              </span>
                            )}
                            {(entry as any).streak >= 2 && (
                              <span
                                className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 border flex items-center gap-0.5 ${
                                  (entry as any).streak >= 5
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : "bg-amber-100 text-amber-700 border-amber-200"
                                }`}
                              >
                                🔥 {(entry as any).streak}w
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                            {(entry as any).sudokuGamesPlayed > 0 && (
                              <span>
                                🔢 {(entry as any).sudokuGamesPlayed} sudoku
                              </span>
                            )}
                            {(entry as any).memoryGamesPlayed > 0 && (
                              <span>
                                🃏 {(entry as any).memoryGamesPlayed} memory
                              </span>
                            )}
                            {(entry as any).sudokuGamesPlayed === 0 &&
                              (entry as any).memoryGamesPlayed === 0 && (
                                <span>
                                  {entry.gamesPlayed} game
                                  {entry.gamesPlayed !== 1 ? "s" : ""}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="text-right">
                          <p className="text-xl font-black text-primary tabular-nums">
                            {entry.totalPoints.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            total pts
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </button>

                    {isExpanded && data.period && (
                      <BreakdownPanel
                        profileId={entry.profileId}
                        type={type}
                        period={data.period}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <PointsGuide />
    </div>
  );
}

// ─── Memory scoring guide ─────────────────────────────────────────────────────

function MemoryScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-sm">
            How points &amp; XP are calculated
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Score is based on difficulty, speed, and efficiency
          </p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 bg-muted/10 space-y-4">
          {/* Base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Base points &amp; par time per difficulty
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-4 bg-muted/50 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">Par time</span>
                <span className="text-center">XP</span>
              </div>
              {[
                {
                  label: "Beginner",
                  cls: "text-green-700",
                  base: "150",
                  par: "0:25",
                  xp: "1 XP",
                },
                {
                  label: "Easy",
                  cls: "text-blue-700",
                  base: "500",
                  par: "1:00",
                  xp: "1 XP",
                },
                {
                  label: "Medium",
                  cls: "text-yellow-700",
                  base: "1,200",
                  par: "2:00",
                  xp: "2 XP",
                },
                {
                  label: "Hard",
                  cls: "text-orange-700",
                  base: "2,500",
                  par: "3:20",
                  xp: "3 XP",
                },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 px-3 py-2 text-xs ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                >
                  <span className={`font-semibold ${row.cls}`}>
                    {row.label}
                  </span>
                  <span className="text-center font-mono">{row.base}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-bold text-amber-600">
                    {row.xp}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Score modifiers */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Score modifiers
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span>⚡ Fast finish bonus</span>
              <span className="font-mono text-right text-green-600 font-semibold">
                up to +50%
              </span>
              <span>🔁 Per extra flip penalty</span>
              <span className="font-mono text-right text-red-500">
                −2% each
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Speed bonus applies when you finish under par time. Minimum flips
              = 2 × number of pairs.
            </p>
          </div>
          {/* Formula */}
          <div className="rounded-lg bg-muted/30 px-4 py-3 text-[11px] text-muted-foreground font-mono leading-relaxed">
            score = base × (1 + time bonus) × flip factor &nbsp;·&nbsp; min 10
            pts
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Daily &amp; weekly challenge bonuses award extra XP and gems on top
            of the base XP above.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Memory Match leaderboard ─────────────────────────────────────────────────

type MemorySize = 2 | 4 | 6 | 8;
type MemoryTab = "all" | MemorySize;

const MEMORY_SIZES: { size: MemorySize; label: string; pairs: number }[] = [
  { size: 2, label: "Beginner", pairs: 4 },
  { size: 4, label: "Easy", pairs: 8 },
  { size: 6, label: "Medium", pairs: 16 },
  { size: 8, label: "Hard", pairs: 32 },
];

interface MemoryEntry {
  profileId: number;
  username: string;
  avatar: string | null;
  profileXp?: number;
  points: number;
  xpEarned: number | null;
  elapsedSeconds: number | null;
  flips: number | null;
  completedAt: string | null;
  // "All" tab extras
  gamesPlayed?: number;
  totalXp?: number;
}

function MemoryBoard({ myProfileId }: { myProfileId?: number }) {
  const [tab, setTab] = useState<MemoryTab>("all");
  const [data, setData] = useState<MemoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    const url =
      tab === "all"
        ? "/api/memory-games/leaderboard?gridSize=all"
        : `/api/memory-games/leaderboard?gridSize=${tab}`;
    customFetch<MemoryEntry[]>(url)
      .then((rows) => setData(rows))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const currentSize = MEMORY_SIZES.find((o) => o.size === tab);

  const cardTitle =
    tab === "all"
      ? "Memory Match — All Levels Combined"
      : `Memory Match — ${currentSize?.label} (${currentSize?.pairs} pairs)`;

  return (
    <div className="space-y-5">
      <Tabs
        value={String(tab)}
        onValueChange={(v) =>
          setTab(v === "all" ? "all" : (Number(v) as MemorySize))
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          {MEMORY_SIZES.map((opt) => (
            <TabsTrigger key={opt.size} value={String(opt.size)}>
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="shadow-md border-primary/10">
        <CardHeader className="bg-card pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-500" />
            {cardTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">
                {tab === "all"
                  ? "No Memory Match games played yet."
                  : "No completed games yet for this level."}
              </p>
              <p className="text-sm mt-1">
                Play Memory Match to claim the top spot!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {data.map((entry, i) => {
                const rank = i + 1;
                const isMe =
                  myProfileId !== undefined && entry.profileId === myProfileId;
                const timeStr =
                  entry.elapsedSeconds != null
                    ? `${Math.floor(entry.elapsedSeconds / 60)}:${String(entry.elapsedSeconds % 60).padStart(2, "0")}`
                    : null;
                return (
                  <div
                    key={`${entry.profileId}-${i}`}
                    className={`flex items-center justify-between px-5 py-4 transition-colors ${isMe ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-center gap-4">
                      <RankBadge rank={rank} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`font-semibold truncate ${isMe ? "text-primary" : ""}`}
                          >
                            {entry.username}
                          </p>
                          {isMe && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                              You
                            </span>
                          )}
                          {entry.profileXp != null && (
                            <LevelBadge xp={entry.profileXp} size="xs" />
                          )}
                          {entry.xpEarned != null && entry.xpEarned > 0 && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5">
                              +{entry.xpEarned} XP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          {tab === "all" ? (
                            <span>
                              {(entry as any).gamesPlayed ?? 0} game
                              {((entry as any).gamesPlayed ?? 0) !== 1
                                ? "s"
                                : ""}{" "}
                              across all levels
                            </span>
                          ) : (
                            <>
                              {timeStr && (
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  {timeStr}
                                </span>
                              )}
                              {entry.flips != null && (
                                <span className="flex items-center gap-1">
                                  <Repeat2 className="w-3 h-3" />
                                  {entry.flips} flips
                                </span>
                              )}
                            </>
                          )}
                          {entry.completedAt && (
                            <span>
                              {new Date(entry.completedAt).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p
                        className={`font-black text-xl tabular-nums ${isMe ? "text-primary" : "text-primary"}`}
                      >
                        {entry.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        pts
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory scoring guide */}
      <MemoryScoringGuide />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [tab, setTab] = useState<MainTab>("weekly");
  const { profileId } = useAuth();
  const myProfileId = profileId ?? undefined;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Compete in weekly and monthly tournaments.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as MainTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weekly" className="gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="alltime" className="flex-col gap-0 leading-tight py-1.5">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />Sudoku</span>
            <span className="text-[9px] font-normal opacity-60 -mt-0.5">all-time</span>
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex-col gap-0 leading-tight py-1.5">
            <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5" />Memory</span>
            <span className="text-[9px] font-normal opacity-60 -mt-0.5">all-time</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "alltime" && <AlltimeBoard myProfileId={myProfileId} />}
      {tab === "weekly" && (
        <TournamentBoard type="weekly" myProfileId={myProfileId} />
      )}
      {tab === "monthly" && (
        <TournamentBoard type="monthly" myProfileId={myProfileId} />
      )}
      {tab === "memory" && <MemoryBoard myProfileId={myProfileId} />}
    </div>
  );
}
