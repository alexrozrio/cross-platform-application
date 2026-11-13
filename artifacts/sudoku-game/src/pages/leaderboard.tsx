import React, { useState, useEffect, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
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
  Puzzle,
  Search,
  Bomb,
  Grid3x3,
  Timer,
  Repeat2,
  TrendingUp,
  TrendingDown,
  Minus,
  CircleHelp,
} from "lucide-react";
import { LevelBadge } from "@/components/level-badge";
import { usePageMeta } from "@/components/page-meta";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { showEventModal } from "@/hooks/use-event-modal";
import { quizGameId, quizSubject, type QuizSubject } from "@/lib/quiz";

type MainTab = "alltime" | "weekly" | "monthly";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Derive the UTC end Date from a period string ("YYYY-WNN" or "YYYY-MM"). */
function periodEndDate(period: string): Date {
  if (period.includes("-W")) {
    const [yearStr, weekStr] = period.split("-W");
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() || 7) - 1));
    const start = new Date(startOfWeek1);
    start.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return end;
  } else {
    const [yearStr, monthStr] = period.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1;
    return new Date(Date.UTC(year, month + 1, 1));
  }
}

/** Returns a live "Xd Yh Zm remaining" string, ticking every minute. */
function usePeriodCountdown(period: string | undefined): string {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!period) { setDisplay(""); return; }

    const compute = () => {
      const end = periodEndDate(period);
      const diffMs = end.getTime() - Date.now();
      if (diffMs <= 0) { setDisplay("Ended"); return; }
      const totalSec = Math.floor(diffMs / 1000);
      const days  = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins  = Math.floor((totalSec % 3600) / 60);
      const parts: string[] = [];
      if (days  > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      setDisplay(parts.join(" ") + " remaining");
    };

    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [period]);

  return display;
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
        <div className="border-t border-border px-5 py-4 bg-muted space-y-3">
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
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Applies to all grid sizes — 3×3, 4×4, <span className="font-semibold text-foreground">6×6</span>, 9×9, and 16×16.
          </p>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Jigsaw XP by level</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ level: "Easy", xp: 1 }, { level: "Medium", xp: 2 }, { level: "Hard", xp: 3 }].map((item) => (
                <div key={item.level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{item.level}</p>
                  <p className="text-xs font-bold text-amber-600">{item.xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Jigsaw XP is awarded for each completed picture puzzle and increases with the selected level.</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Word Search XP by difficulty</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[{ level: "Beginner", xp: 1 }, { level: "Easy", xp: 1 }, { level: "Medium", xp: 2 }, { level: "Hard", xp: 3 }].map((item) => (
                <div key={item.level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{item.level}</p>
                  <p className="text-xs font-bold text-violet-600">{item.xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Word Search XP is awarded for each completed puzzle and increases with the selected difficulty.</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Minesweeper XP by difficulty</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[{ level: "Beginner", xp: 1 }, { level: "Easy", xp: 1 }, { level: "Medium", xp: 2 }, { level: "Hard", xp: 3 }].map((item) => (
                <div key={item.level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{item.level}</p>
                  <p className="text-xs font-bold text-emerald-600">{item.xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Minesweeper XP is awarded for each cleared minefield and increases with the selected difficulty. Only wins earn XP.</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Slide Puzzle XP by board size</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[{ level: "2×2", xp: 1 }, { level: "3×3", xp: 1 }, { level: "4×4", xp: 2 }, { level: "5×5", xp: 3 }].map((item) => (
                <div key={item.level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{item.level}</p>
                  <p className="text-xs font-bold text-sky-600">{item.xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Slide Puzzle XP is awarded for each solved board and increases with the selected size. Only wins earn XP.</p>
          </div>
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
        <div className="border-t border-border px-5 py-4 bg-muted space-y-4">
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
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🧩 Jigsaw — base points by board size
            </p>
            <div className="rounded-xl border overflow-x-auto text-xs">
              <div className="min-w-[340px]">
                <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                  <span>Board</span><span className="text-center">Base</span><span className="text-center">Easy par</span><span className="text-center">Medium</span><span className="text-center">Hard</span>
                </div>
                {[
                  { size: 2, base: 100, par: "0:45", gems: 1 },
                  { size: 3, base: 250, par: "1:30", gems: 2 },
                  { size: 4, base: 500, par: "2:30", gems: 3 },
                  { size: 5, base: 1000, par: "4:00", gems: 3 },
                ].map((row, i) => (
                  <div key={row.size} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                    <span className="font-semibold">{row.size}×{row.size}<span className="block text-[9px] font-normal text-muted-foreground">{row.gems} gem{row.gems === 1 ? "" : "s"} on win</span></span>
                    <span className="text-center font-mono">{row.base}</span><span className="text-center font-mono">{row.par}</span><span className="text-center font-mono">×1.5</span><span className="text-center font-mono">×2</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Medium and Hard multiply base points by 1.5× and 2×. Finish under par for up to +50%; each extra move costs 2% and each tip costs 10% (each penalty has a 50% floor). XP per win: Easy 1, Medium 2, Hard 3.
            </p>
          </div>
          {/* Sudoku base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🔢 Sudoku — base points × difficulty
            </p>
            <div className="rounded-xl border overflow-x-auto text-xs">
              <div className="min-w-[280px]">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Grid</span>
                <span className="text-center text-green-700">Easy</span>
                <span className="text-center text-yellow-700">Med</span>
                <span className="text-center text-orange-700">Hard</span>
                <span className="text-center text-red-700">Expert</span>
              </div>
              {[
                { label: "3×3", base: 100, par: "2:00" },
                { label: "4×4", base: 250, par: "5:00" },
                { label: "6×6", base: 500, par: "10:00" },
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
              </div>{/* close min-w-[280px] */}
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
              <div className="grid grid-cols-4 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
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
                  base: 1600,
                  par: "2:00",
                  max: 2400,
                  cls: "text-yellow-700",
                },
                {
                  label: "Hard",
                  base: 5000,
                  par: "5:00",
                  max: 7500,
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
              bonus up to +50%, −2% per extra flip, floor 50%. Hard always
              beats Medium at every skill level.
            </p>
          </div>

          {/* Word Search base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🔎 Word Search — base points × difficulty
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Min tries</span>
                <span className="text-center">Gems</span>
              </div>
              {[
                { label: "Beginner", base: 120, par: "2:00", tries: 6, gems: 1, cls: "text-green-700" },
                { label: "Easy", base: 280, par: "4:00", tries: 8, gems: 2, cls: "text-blue-700" },
                { label: "Medium", base: 650, par: "7:00", tries: 10, gems: 3, cls: "text-yellow-700" },
                { label: "Hard", base: 1300, par: "12:00", tries: 12, gems: 4, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.tries}</span>
                  <span className="text-center font-mono">{row.gems} 💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × (1 + time bonus up to +50%) × try factor × tip factor &nbsp;·&nbsp; −2.5% per try beyond the word count (floor 45%), −20% per hint (floor 60%), min 10 pts. XP: Beginner/Easy 1, Medium 2, Hard 3.
            </p>
          </div>

          {/* Minesweeper base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              💣 Minesweeper — base points × difficulty
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Board</span>
                <span className="text-center">Gems</span>
              </div>
              {[
                { label: "Beginner", base: 150, par: "1:30", board: "6×6 · 5 mines", gems: 1, cls: "text-green-700" },
                { label: "Easy", base: 350, par: "3:00", board: "8×8 · 12 mines", gems: 2, cls: "text-blue-700" },
                { label: "Medium", base: 800, par: "6:00", board: "12×12 · 24 mines", gems: 3, cls: "text-yellow-700" },
                { label: "Hard", base: 1600, par: "10:00", board: "14×14 · 34 mines", gems: 4, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono text-[10px]">{row.board}</span>
                  <span className="text-center font-mono">{row.gems} 💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Only wins score. score = base × (1 + time bonus up to +50%) × mistake factor × hint factor &nbsp;·&nbsp; −15% per mine hit (floor 40%), −20% per hint (floor 60%), min 10 pts. Three mine hits ends the game. XP: Beginner/Easy 1, Medium 2, Hard 3.
            </p>
          </div>

          {/* Slide Puzzle base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🧩 Slide Puzzle — base points × board size
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Board</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Par moves</span>
                <span className="text-center">Gems</span>
              </div>
              {[
                { label: "2×2", base: 120, par: "1:30", moves: 12, gems: 1, cls: "text-green-700" },
                { label: "3×3", base: 300, par: "5:00", moves: 60, gems: 2, cls: "text-blue-700" },
                { label: "4×4", base: 700, par: "20:00", moves: 160, gems: 3, cls: "text-yellow-700" },
                { label: "5×5", base: 1500, par: "45:00", moves: 320, gems: 4, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.moves}</span>
                  <span className="text-center font-mono">{row.gems} 💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Only wins score. score = base × (1 + time bonus up to +50%) × move factor × hint factor &nbsp;·&nbsp; move factor scales 60–100% toward the par move count, −15% per hint (floor 70%), min 10 pts. XP: 2×2/3×3 = 1, 4×4 = 2, 5×5 = 3.
            </p>
          </div>

          {/* Game Modes */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🎮 Game Modes
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Your Game Mode (set in Profile) controls which grid sizes and difficulties are available to you across all games and challenges.
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-7 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Mode</span>
                <span className="text-center">Sudoku</span>
                <span className="text-center">Memory Match</span>
                <span className="text-center">Jigsaw</span>
                <span className="text-center">Word Search</span>
                <span className="text-center">Minesweeper</span>
                <span className="text-center">Slide Puzzle</span>
              </div>
              {[
                {
                  mode: "👶 Kids",
                  sudoku: "3×3 Baby · 4×4 Mini",
                  memory: "4 pairs · 8 pairs",
                  jigsaw: "2×2 · 3×3",
                  wordSearch: "Beginner · Easy",
                  minesweeper: "Beginner · Easy",
                  slidePuzzle: "2×2 · 3×3",
                  cls: "text-green-700",
                },
                {
                  mode: "🧑 Adult",
                  sudoku: "9×9 Classic · 16×16 Pro",
                  memory: "16 pairs · 32 pairs",
                  jigsaw: "4×4 · 5×5",
                  wordSearch: "Medium · Hard",
                  minesweeper: "Medium · Hard",
                  slidePuzzle: "4×4 · 5×5",
                  cls: "text-blue-700",
                },
                {
                  mode: "🌍 4 All",
                  sudoku: "All four sizes",
                  memory: "All four sizes",
                  jigsaw: "All four sizes",
                  wordSearch: "All four levels",
                  minesweeper: "All four levels",
                  slidePuzzle: "All four sizes",
                  cls: "text-violet-700",
                },
              ].map((row, i) => (
                <div
                  key={row.mode}
                  className={`grid grid-cols-7 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                >
                  <span className={`font-semibold ${row.cls}`}>{row.mode}</span>
                  <span className="text-center text-muted-foreground">{row.sudoku}</span>
                  <span className="text-center text-muted-foreground">{row.memory}</span>
                  <span className="text-center text-muted-foreground">{row.jigsaw}</span>
                  <span className="text-center text-muted-foreground">{row.wordSearch}</span>
                  <span className="text-center text-muted-foreground">{row.minesweeper}</span>
                  <span className="text-center text-muted-foreground">{row.slidePuzzle}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Leaderboard scores from all modes appear together — a Kids-mode player and an Adult-mode player can both rank on the same board.
              Change your mode anytime under Profile → Game Mode.
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
  "6": "6×6 Dual",
  "9": "9×9 Classic",
  "16": "16×16 Pro",
};

function AlltimeBoard({ myProfileId }: { myProfileId?: number }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data, isLoading } = useGetLeaderboard({ limit: 50 } as any);

  return (
    <div className="space-y-3 sm:space-y-5">
      <Card className="shadow-md border-primary/10">
        <CardHeader className="bg-card pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Sudoku — All Grids Combined
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
              <p className="font-medium">No completed games yet.</p>
              <p className="text-sm mt-1">Complete a puzzle to claim the top spot!</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.map((entry) => {
                const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
                const isExpanded = expandedId === entry.profileId;
                return (
                  <div key={`${entry.profileId}-${entry.rank}`}>
                    <button
                      data-testid={`leaderboard-sudoku-row-${entry.profileId}`}
                      onClick={() => setExpandedId((p) => p === entry.profileId ? null : entry.profileId)}
                      className={`w-full flex items-center justify-between gap-2 px-3 sm:px-5 py-4 transition-colors text-left ${isMe ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2 sm:gap-4">
                        <RankBadge rank={entry.rank} />
                        <div className="min-w-0 flex-1">
                          <div className="min-w-0 flex items-center gap-2 flex-wrap">
                            <p title={entry.username} className={`min-w-0 flex-1 font-semibold truncate ${isMe ? "text-primary" : ""}`}>
                              {entry.username}
                            </p>
                            {isMe && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full px-2 py-0.5">You</span>
                            )}
                            {entry.xp !== undefined && <LevelBadge xp={entry.xp} size="xs" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(entry as any).gamesPlayed ?? 0} game{((entry as any).gamesPlayed ?? 0) !== 1 ? "s" : ""} across all grids
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-1 sm:ml-4">
                        <div className="text-right">
                          <p data-testid={`leaderboard-sudoku-score-${entry.profileId}`} className="font-black text-lg sm:text-xl tabular-nums whitespace-nowrap text-primary">
                            {((entry as any).points as number ?? 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">pts</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <PlayerDetailsPanel profileId={entry.profileId} game="sudoku" myProfileId={myProfileId} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <XpGuide />
      <PointsGuide />
    </div>
  );
}

// ─── Tournament leaderboard ───────────────────────────────────────────────────

interface BreakdownData {
  sudoku: { gridSize: number; points: number; games: number }[];
  memory: { gridSize: number; points: number; games: number }[];
  jigsaw: { gridSize: number; points: number; games: number }[];
  wordSearch: { difficulty: string; points: number; games: number }[];
  minesweeper: { difficulty: string; points: number; games: number }[];
  slidePuzzle: { difficulty: string; points: number; games: number }[];
}

const SUDOKU_GRID_NAMES: Record<number, string> = {
  3: "3×3",
  4: "4×4",
  6: "6×6",
  9: "9×9",
  16: "16×16",
};
const MEMORY_LEVEL_NAMES: Record<number, string> = {
  2: "Beginner",
  4: "Easy",
  6: "Medium",
  8: "Hard",
};
const JIGSAW_GRID_NAMES: Record<number, string> = {
  2: "2×2 Baby",
  3: "3×3 Child",
  4: "4×4 Adult",
  5: "5×5 Adult",
};
const MINESWEEPER_DIFFICULTY_NAMES: Record<string, string> = {
  beginner: "6×6 · 5 mines",
  easy: "8×8 · 12 mines",
  medium: "12×12 · 24 mines",
  hard: "14×14 · 34 mines",
};
const SLIDE_PUZZLE_DIFFICULTY_NAMES: Record<string, string> = {
  "2x2": "3 tiles",
  "3x3": "8 tiles",
  "4x4": "15 tiles",
  "5x5": "24 tiles",
};
type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle";

function BreakdownPanel({
  profileId,
  type,
  period,
  defaultGame,
  onlyGame,
}: {
  profileId: number;
  type: "weekly" | "monthly" | "alltime";
  period: string;
  defaultGame?: GameTab;
  onlyGame?: GameTab;
}) {
  const [bdTab, setBdTab] = useState<GameTab>(onlyGame ?? defaultGame ?? "sudoku");
  const { data, isLoading } = useQuery<BreakdownData>({
    queryKey: ["tournament-breakdown", profileId, type, period],
    queryFn: () =>
      customFetch<BreakdownData>(
        `/api/tournaments/breakdown?profileId=${profileId}&type=${type}&period=${encodeURIComponent(period)}`,
      ),
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: type === "alltime" ? 60_000 : 30_000,
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
      {/* mini tabs — hidden when a specific game is locked in */}
      {!onlyGame && (
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
          <button
            onClick={() => setBdTab("jigsaw")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${bdTab === "jigsaw" ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            🧩 Jigsaw
          </button>
          <button onClick={() => setBdTab("word-search")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "word-search" ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔎 Word Search
          </button>
          <button onClick={() => setBdTab("minesweeper")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "minesweeper" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            💣 Minesweeper
          </button>
          <button onClick={() => setBdTab("slide-puzzle")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "slide-puzzle" ? "bg-sky-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🧩 Slide Puzzle
          </button>
        </div>
      )}
      {onlyGame && <div className="mt-2" />}

      {bdTab === "sudoku" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            data?.sudoku ??
            [3, 4, 6, 9, 16].map((gs) => ({ gridSize: gs, points: 0, games: 0 }))
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
      {bdTab === "jigsaw" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.jigsaw ?? [2, 3, 4, 5].map((gridSize) => ({ gridSize, points: 0, games: 0 }))).map((item) => (
            <div key={item.gridSize} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-amber-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{JIGSAW_GRID_NAMES[item.gridSize]}</p>
              <p className="mt-0.5 text-lg font-black leading-tight tabular-nums text-amber-700 dark:text-amber-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "word-search" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.wordSearch ?? ["beginner", "easy", "medium", "hard"].map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-violet-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold capitalize text-foreground">{item.difficulty}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-violet-700 dark:text-violet-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "minesweeper" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.minesweeper ?? ["beginner", "easy", "medium", "hard"].map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-emerald-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold capitalize text-foreground">{item.difficulty}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-emerald-700 dark:text-emerald-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{MINESWEEPER_DIFFICULTY_NAMES[item.difficulty]}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "slide-puzzle" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.slidePuzzle ?? ["2x2", "3x3", "4x4", "5x5"].map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-sky-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{item.difficulty}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-sky-700 dark:text-sky-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{SLIDE_PUZZLE_DIFFICULTY_NAMES[item.difficulty]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Per-player details panel (used in all-time game boards) ────────────────

function PlayerDetailsPanel({
  profileId,
  game,
  myProfileId,
}: {
  profileId: number;
  game: GameTab;
  myProfileId?: number;
}) {
  const isMe = myProfileId === profileId;

  return (
    <div className="border-t bg-muted/10">
      <BreakdownPanel profileId={profileId} type="alltime" period="all-time" onlyGame={game} />

      {isMe && (
        <div className="px-5 pb-3">
          <Link
            href={`/profile?tab=${game}`}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View your full stats →
          </Link>
        </div>
      )}
    </div>
  );
}

function TournamentBoard({
  type,
  myProfileId,
}: {
  type: "weekly" | "monthly" | "alltime";
  myProfileId?: number;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rankDeltas, setRankDeltas] = useState<Record<"weekly" | "monthly", number | null>>({
    weekly: null,
    monthly: null,
  });

  // Keep each tournament period's baseline separate. The board stays mounted
  // while its type changes, so a single previous-rank ref compares weekly rank
  // against monthly rank and falsely reports a change whenever tabs switch.
  const prevRanksRef = useRef<Record<"weekly" | "monthly", number | null | undefined>>({
    weekly: undefined,
    monthly: undefined,
  });
  const trackedProfileIdRef = useRef(myProfileId);

  const { data, isLoading } = useGetTournamentLeaderboard({ type }, {
    query: {
      queryKey: ["/api/tournaments/leaderboard", { type }],
      refetchInterval: type === "alltime" ? 60_000 : 30_000,
    },
  });

  // Detect rank changes across refetches and show a persistent event + delta badge
  useEffect(() => {
    if (trackedProfileIdRef.current !== myProfileId) {
      trackedProfileIdRef.current = myProfileId;
      prevRanksRef.current = { weekly: undefined, monthly: undefined };
      setRankDeltas({ weekly: null, monthly: null });
    }

    if (!data?.entries || !myProfileId) return;
    const myEntry = data.entries.find((e) => e.profileId === myProfileId);
    const newRank = myEntry?.rank ?? null;

    if (type === "alltime") return;

    const previousRank = prevRanksRef.current[type];
    if (previousRank === undefined) {
      // First load for this period — establish its own baseline without alerting.
      prevRanksRef.current[type] = newRank;
      return;
    }

    if (
      newRank !== null &&
      previousRank !== null &&
      newRank !== previousRank
    ) {
      const delta = previousRank - newRank; // positive = moved up
      setRankDeltas((previous) => ({ ...previous, [type]: delta }));

      if (delta > 0) {
        showEventModal({
          type: "tournament_rank_up",
          delta,
          newRank,
          period: type as "weekly" | "monthly",
        });
      } else {
        showEventModal({
          type: "tournament_rank_down",
          delta,
          newRank,
          period: type as "weekly" | "monthly",
        });
      }

    }

    prevRanksRef.current[type] = newRank;
  }, [data, myProfileId, type]);

  const rankDelta = type === "alltime" ? null : rankDeltas[type];
  const Icon = type === "weekly" ? CalendarDays : type === "monthly" ? Calendar : Zap;
  const label = type === "weekly"
    ? "Weekly Tournament"
    : type === "monthly"
      ? "Monthly Tournament"
      : "All-Time Leaderboard";
  const countdown = usePeriodCountdown(type === "alltime" ? undefined : data?.period);

  const toggleRow = (profileId: number) => {
    setExpandedId((prev) => (prev === profileId ? null : profileId));
  };

  return (
    <div className="space-y-5">
      {/* Period info + countdown */}
      {data && (
        <div className="leaderboard-period-info flex flex-wrap items-center justify-between gap-2 bg-card rounded-xl sm:rounded-2xl border border-border px-3 py-2 sm:px-4 sm:py-3">
          <div className="leaderboard-period-label flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <Icon className="w-4 h-4 shrink-0" />
            <span className="min-w-0 break-words leading-snug">
              <span className="hidden sm:inline">
                {type === "alltime" ? "Ranking period: " : "Current period: "}
              </span>
              <span className="font-semibold text-foreground">
                {data.periodLabel}
              </span>
            </span>
          </div>
          {countdown && (
            <div className="leaderboard-period-countdown flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 shrink-0">
              <Timer className="w-3 h-3" />
              <span className="leaderboard-countdown-full">{countdown}</span>
              <span className="leaderboard-countdown-compact">
                {countdown.replace(/\s+remaining$/, "")}
              </span>
            </div>
          )}
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
                {type === "alltime"
                  ? "No completed games yet."
                  : `No games yet this ${type === "weekly" ? "week" : "month"}.`}
              </p>
              <p className="text-sm mt-1">
                Complete Sudoku, Memory Match, Jigsaw, Word Search, or Minesweeper games to earn points and climb the rankings!
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
                      data-testid={`leaderboard-tournament-row-${type}-${entry.profileId}`}
                      onClick={() => toggleRow(entry.profileId)}
                      className={`w-full flex items-center justify-between gap-2 px-3 sm:px-5 py-4 transition-colors text-left ${isMe ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2 sm:gap-4">
                        <RankBadge rank={entry.rank} />
                        <div className="min-w-0 flex-1">
                          <div className="min-w-0 flex items-center gap-2 flex-wrap">
                            <p
                              title={entry.username}
                              className={`min-w-0 flex-1 font-semibold truncate ${isMe ? "text-primary" : ""}`}
                            >
                              {entry.username}
                            </p>
                            {(entry as any).xp !== undefined && (
                              <LevelBadge xp={(entry as any).xp} size="xs" />
                            )}
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
                            {(entry as any).jigsawGamesPlayed > 0 && (
                              <span>
                                🧩 {(entry as any).jigsawGamesPlayed} jigsaw
                              </span>
                            )}
                            {(entry as any).wordSearchGamesPlayed > 0 && (
                              <span>🔎 {(entry as any).wordSearchGamesPlayed} word search</span>
                            )}
                            {(entry as any).minesweeperGamesPlayed > 0 && (
                              <span>💣 {(entry as any).minesweeperGamesPlayed} minesweeper</span>
                            )}
                            {(entry as any).slidePuzzleGamesPlayed > 0 && (
                              <span>🧩 {(entry as any).slidePuzzleGamesPlayed} slide puzzle</span>
                            )}
                            {(entry as any).sudokuGamesPlayed === 0 &&
                              (entry as any).memoryGamesPlayed === 0 &&
                              (entry as any).jigsawGamesPlayed === 0 &&
                              (entry as any).wordSearchGamesPlayed === 0 &&
                              (entry as any).minesweeperGamesPlayed === 0 &&
                              (entry as any).slidePuzzleGamesPlayed === 0 && (
                                <span>
                                  {entry.gamesPlayed} game
                                  {entry.gamesPlayed !== 1 ? "s" : ""}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-1 sm:ml-4">
                        <div className="text-right">
                          <p data-testid={`leaderboard-tournament-score-${type}-${entry.profileId}`} className="text-lg sm:text-xl font-black text-primary tabular-nums whitespace-nowrap">
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
        <div className="border-t border-border px-5 py-4 bg-muted space-y-4">
          {/* Base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Base points &amp; par time per difficulty
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
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
                  base: "1,600",
                  par: "2:00",
                  xp: "2 XP",
                },
                {
                  label: "Hard",
                  cls: "text-orange-700",
                  base: "5,000",
                  par: "5:00",
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
                −2% each (floor 50%)
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Speed bonus applies when you finish under par time. Minimum flips
              = 2 × number of pairs. Hard always scores more than Medium at
              every skill level.
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

          {/* Game Modes */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🎮 Game Modes
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Your Game Mode (set in Profile) controls which grid sizes are available for Memory Match.
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-muted/50 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Mode</span>
                <span className="text-center">Unlocked sizes</span>
              </div>
              {[
                { mode: "👶 Kids",  sizes: "4 pairs (2×4) · 8 pairs (4×4)",   cls: "text-green-700" },
                { mode: "🧑 Adult", sizes: "16 pairs (8×4) · 32 pairs (8×8)", cls: "text-blue-700"  },
                { mode: "🌍 4 All", sizes: "All four sizes",                   cls: "text-violet-700" },
              ].map((row, i) => (
                <div
                  key={row.mode}
                  className={`grid grid-cols-2 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                >
                  <span className={`font-semibold ${row.cls}`}>{row.mode}</span>
                  <span className="text-center text-muted-foreground">{row.sizes}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              All modes compete on the same leaderboard. Change your mode anytime under Profile → Game Mode.
            </p>
          </div>
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
  const [data, setData] = useState<MemoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    customFetch<MemoryEntry[]>("/api/memory-games/leaderboard?gridSize=all")
      .then((rows) => setData(rows))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <Card className="shadow-md border-purple-200/60">
        <CardHeader className="bg-card pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-500" />
            Memory Match — All Levels Combined
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
              <p className="font-medium">No Memory Match games played yet.</p>
              <p className="text-sm mt-1">Play Memory Match to claim the top spot!</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.map((entry, i) => {
                const rank = i + 1;
                const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
                const isExpanded = expandedId === entry.profileId;
                return (
                  <div key={`${entry.profileId}-${i}`}>
                    <button
                      data-testid={`leaderboard-memory-row-${entry.profileId}`}
                      onClick={() => setExpandedId((p) => p === entry.profileId ? null : entry.profileId)}
                      className={`w-full flex items-center justify-between gap-2 px-3 sm:px-5 py-4 transition-colors text-left ${isMe ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2 sm:gap-4">
                        <RankBadge rank={rank} />
                        <div className="min-w-0 flex-1">
                          <div className="min-w-0 flex items-center gap-2 flex-wrap">
                            <p title={entry.username} className={`min-w-0 flex-1 font-semibold truncate ${isMe ? "text-primary" : ""}`}>
                              {entry.username}
                            </p>
                            {isMe && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full px-2 py-0.5">You</span>
                            )}
                            {entry.profileXp != null && <LevelBadge xp={entry.profileXp} size="xs" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(entry as any).gamesPlayed ?? 0} game{((entry as any).gamesPlayed ?? 0) !== 1 ? "s" : ""} across all levels
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-1 sm:ml-4">
                        <div className="text-right">
                          <p data-testid={`leaderboard-memory-score-${entry.profileId}`} className="font-black text-lg sm:text-xl tabular-nums whitespace-nowrap text-violet-600">
                            {entry.points.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">pts</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <PlayerDetailsPanel profileId={entry.profileId} game="memory" myProfileId={myProfileId} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MemoryScoringGuide />
    </div>
  );
}

type JigsawLeaderboardEntry = {
  rank: number;
  profileId: number;
  username: string;
  avatar: string | null;
  totalPoints: number;
  gamesPlayed: number;
  bestTime: number;
  sizes: Record<number, { points: number; games: number }>;
};

function JigsawScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/70 dark:border-amber-900/50">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Jigsaw points are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Board size, level, time, moves, and tips all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ size: 2, base: 100, par: 45, gems: 1 }, { size: 3, base: 250, par: 90, gems: 2 }, { size: 4, base: 500, par: 150, gems: 3 }, { size: 5, base: 1_000, par: 240, gems: 3 }].map((item) => (
              <div key={item.size} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.size}×{item.size} board</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Easy par {formatTime(item.par)}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎 per win</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Level multipliers and XP</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">Multiplier</span><span className="text-center">XP</span><span className="text-center">Par time</span></div>
              {[
                { label: "Easy", multiplier: "×1", xp: "1 XP", par: "Base" },
                { label: "Medium", multiplier: "×1.5", xp: "2 XP", par: "+35%" },
                { label: "Hard", multiplier: "×2", xp: "3 XP", par: "+70%" },
              ].map((row, index) => <div key={row.label} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}><span className="font-semibold">{row.label}</span><span className="text-center font-mono">{row.multiplier}</span><span className="text-center font-semibold text-amber-600">{row.xp}</span><span className="text-center font-mono">{row.par}</span></div>)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × level multiplier × (1 + time bonus) × move factor × tip factor</p>
            <p className="mt-1 leading-relaxed">Finish under par for up to +50%. Each move beyond one placement per piece reduces points by 2%, and each tip or preview reduces points by 10%; both penalties stop at a 50% factor. Minimum score: 10 points. Gems: 1 for 2×2, 2 for 3×3, and 3 for 4×4 or 5×5.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function JigsawBoard({ myProfileId }: { myProfileId?: number }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/jigsaw-games/leaderboard", "all"],
    queryFn: () => customFetch<{ gridSize: number | "all"; entries: JigsawLeaderboardEntry[] }>("/api/jigsaw-games/leaderboard?gridSize=all"),
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-5">
      <Card className="border-amber-200/70 shadow-md dark:border-amber-900/50">
        <CardHeader className="border-b bg-card pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Puzzle className="h-5 w-5 text-amber-600" /> Jigsaw — All Board Sizes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : isError ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Jigsaw leaderboard could not be loaded. Please try again.</div>
          ) : !data?.entries.length ? (
            <div className="p-12 text-center text-muted-foreground">
              <Puzzle className="mx-auto mb-3 h-10 w-10 opacity-20" />
              <p className="font-medium">No completed Jigsaw games yet.</p>
              <p className="mt-1 text-sm">Complete a picture puzzle to claim the top spot.</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.entries.map((entry) => {
                const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
                const isExpanded = expandedId === entry.profileId;
                return (
                  <div key={entry.profileId}>
                    <button onClick={() => setExpandedId((current) => current === entry.profileId ? null : entry.profileId)} className={`flex w-full items-center justify-between gap-2 px-3 py-4 text-left transition-colors sm:px-5 ${isMe ? "bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-950/20" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}>
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                        <RankBadge rank={entry.rank} />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-amber-800 dark:text-amber-300" : ""}`}>{entry.username}</p>
                            {isMe && <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""} · best time {formatTime(entry.bestTime)}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right">
                          <p className="whitespace-nowrap text-lg font-black tabular-nums text-amber-700 dark:text-amber-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">pts</p>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {isExpanded && <PlayerDetailsPanel profileId={entry.profileId} game="jigsaw" myProfileId={myProfileId} />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <JigsawScoringGuide />
    </div>
  );
}

function WordSearchScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-violet-200/70 dark:border-violet-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Word Search points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Difficulty, speed, tries, and hints all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "Beginner", base: 120, par: "2:00", tries: 6, gems: 1 }, { level: "Easy", base: 280, par: "4:00", tries: 8, gems: 2 }, { level: "Medium", base: 650, par: "7:00", tries: 10, gems: 3 }, { level: "Hard", base: 1300, par: "12:00", tries: 12, gems: 4 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎 · {item.tries} min tries</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP by difficulty</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Difficulty</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Grid</span></div>
              {[
                { label: "Beginner", xp: "1 XP", gems: "1 💎", grid: "6×6" },
                { label: "Easy", xp: "1 XP", gems: "2 💎", grid: "8×8" },
                { label: "Medium", xp: "2 XP", gems: "3 💎", grid: "12×12" },
                { label: "Hard", xp: "3 XP", gems: "4 💎", grid: "14×14" },
              ].map((row, index) => <div key={row.label} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}><span className="font-semibold">{row.label}</span><span className="text-center font-semibold text-amber-600">{row.xp}</span><span className="text-center font-mono">{row.gems}</span><span className="text-center font-mono">{row.grid}</span></div>)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × (1 + time bonus) × try factor × tip factor</p>
            <p className="mt-1 leading-relaxed">Finish under par time for up to +50%. Each selection try beyond the word count reduces points by 2.5% (floor 45%), and each hint reduces points by 20% (floor 60%). Minimum score: 10 points.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type WordSearchLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function WordSearchBoard({ myProfileId }: { myProfileId?: number }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/word-search-games/leaderboard"],
    queryFn: () => customFetch<WordSearchLeaderboardEntry[]>("/api/word-search-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-violet-200/60 dark:border-violet-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg"><Search className="h-5 w-5 text-violet-600" /> Word Search — All Difficulties</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Word Search leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Search className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Word Search games yet.</p><p className="mt-1 text-sm">Complete a puzzle to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            const isExpanded = expandedId === entry.profileId;
            return <div key={entry.profileId}>
              <button onClick={() => setExpandedId((current) => current === entry.profileId ? null : entry.profileId)} className={`flex w-full items-center justify-between gap-2 px-3 py-4 text-left transition-colors sm:px-5 ${isMe ? "bg-violet-50/70 hover:bg-violet-50 dark:bg-violet-950/20" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}>
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4"><RankBadge rank={entry.rank} /><div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-violet-800 dark:text-violet-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-violet-700 dark:text-violet-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div>{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
              </button>
              {isExpanded && <PlayerDetailsPanel profileId={entry.profileId} game="word-search" myProfileId={myProfileId} />}
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <WordSearchScoringGuide />
  </div>;
}

function MinesweeperScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200/70 dark:border-emerald-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Minesweeper points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Difficulty, speed, mine hits, and hints all count. Only wins score.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "Beginner", base: 150, par: "1:30", board: "6×6 · 5", gems: 1 }, { level: "Easy", base: 350, par: "3:00", board: "8×8 · 12", gems: 2 }, { level: "Medium", base: 800, par: "6:00", board: "12×12 · 24", gems: 3 }, { level: "Hard", base: 1600, par: "10:00", board: "14×14 · 34", gems: 4 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par}</p>
                <p className="text-xs text-muted-foreground">{item.board} mines · {item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP by difficulty</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Difficulty</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Board</span></div>
              {[
                { label: "Beginner", xp: "1 XP", gems: "1 💎", grid: "6×6" },
                { label: "Easy", xp: "1 XP", gems: "2 💎", grid: "8×8" },
                { label: "Medium", xp: "2 XP", gems: "3 💎", grid: "12×12" },
                { label: "Hard", xp: "3 XP", gems: "4 💎", grid: "14×14" },
              ].map((row, index) => <div key={row.label} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}><span className="font-semibold">{row.label}</span><span className="text-center font-semibold text-amber-600">{row.xp}</span><span className="text-center font-mono">{row.gems}</span><span className="text-center font-mono">{row.grid}</span></div>)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × (1 + time bonus) × mistake factor × hint factor</p>
            <p className="mt-1 leading-relaxed">Finish under par time for up to +50%. Each mine hit reduces points by 15% (floor 40%), and each hint reduces points by 20% (floor 60%). Three mine hits ends the game; only wins award points, XP, and gems. Minimum score: 10 points.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type MinesweeperLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function MinesweeperBoard({ myProfileId }: { myProfileId?: number }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/minesweeper-games/leaderboard"],
    queryFn: () => customFetch<MinesweeperLeaderboardEntry[]>("/api/minesweeper-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-emerald-200/60 dark:border-emerald-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg"><Bomb className="h-5 w-5 text-emerald-600" /> Minesweeper — All Difficulties</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Minesweeper leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Bomb className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Minesweeper games yet.</p><p className="mt-1 text-sm">Clear a minefield to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            const isExpanded = expandedId === entry.profileId;
            return <div key={entry.profileId}>
              <button onClick={() => setExpandedId((current) => current === entry.profileId ? null : entry.profileId)} className={`flex w-full items-center justify-between gap-2 px-3 py-4 text-left transition-colors sm:px-5 ${isMe ? "bg-emerald-50/70 hover:bg-emerald-50 dark:bg-emerald-950/20" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}>
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4"><RankBadge rank={entry.rank} /><div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-emerald-800 dark:text-emerald-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-emerald-700 dark:text-emerald-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div>{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
              </button>
              {isExpanded && <PlayerDetailsPanel profileId={entry.profileId} game="minesweeper" myProfileId={myProfileId} />}
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <MinesweeperScoringGuide />
  </div>;
}

function SlidePuzzleScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-sky-200/70 dark:border-sky-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Slide Puzzle points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Board size, speed, move efficiency, and hints all count. Only wins score.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "2×2", base: 120, par: "1:30", moves: 12, gems: 1 }, { level: "3×3", base: 300, par: "5:00", moves: 60, gems: 2 }, { level: "4×4", base: 700, par: "20:00", moves: 160, gems: 3 }, { level: "5×5", base: 1500, par: "45:00", moves: 320, gems: 4 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par} · {item.moves} moves</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP by board size</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Board</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Tiles</span></div>
              {[
                { label: "2×2", xp: "1 XP", gems: "1 💎", tiles: "3" },
                { label: "3×3", xp: "1 XP", gems: "2 💎", tiles: "8" },
                { label: "4×4", xp: "2 XP", gems: "3 💎", tiles: "15" },
                { label: "5×5", xp: "3 XP", gems: "4 💎", tiles: "24" },
              ].map((row, index) => <div key={row.label} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}><span className="font-semibold">{row.label}</span><span className="text-center font-semibold text-amber-600">{row.xp}</span><span className="text-center font-mono">{row.gems}</span><span className="text-center font-mono">{row.tiles}</span></div>)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × (1 + time bonus) × move factor × hint factor</p>
            <p className="mt-1 leading-relaxed">Finish under par time for up to +50%. Move factor scales from 60% to 100% as your move count approaches the par count. Each hint reduces points by 15% (floor 70%). Only wins award points, XP, and gems. Minimum score: 10 points.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type SlidePuzzleLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

type QuizLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function QuizBoard({ myProfileId, subjectId }: { myProfileId?: number; subjectId: QuizSubject }) {
  const subject = quizSubject(subjectId);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/quiz-games/leaderboard", subjectId],
    queryFn: () => customFetch<QuizLeaderboardEntry[]>(`/api/quiz-games/leaderboard?subject=${subjectId}`),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className={`shadow-md ${subject.theme.border}`}>
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg"><CircleHelp className={`h-5 w-5 ${subject.theme.text}`} /> {subject.name} — All Levels</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Quiz leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><CircleHelp className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed quizzes yet.</p><p className="mt-1 text-sm">Answer a few questions to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            const isExpanded = expandedId === entry.profileId;
            return <div key={entry.profileId}>
              <button onClick={() => setExpandedId((current) => current === entry.profileId ? null : entry.profileId)} className={`flex w-full items-center justify-between gap-2 px-3 py-4 text-left transition-colors sm:px-5 ${isMe ? subject.theme.row : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}>
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4"><RankBadge rank={entry.rank} /><div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? subject.theme.strong : ""}`}>{entry.username}</p>{isMe && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white ${subject.theme.btn.split(" ")[0]}`}>You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} quiz{entry.gamesPlayed !== 1 ? "zes" : ""}</p></div></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className={`whitespace-nowrap text-lg font-black tabular-nums sm:text-xl ${subject.theme.strong}`}>{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div>{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
              </button>
              {isExpanded && (
                <div className="border-t bg-muted/10 px-5 py-3">
                  <Link href={isMe ? `/profile?tab=${quizGameId(subjectId)}` : `/player/${entry.profileId}`} className={`text-xs font-semibold ${subject.theme.text} hover:underline`}>{isMe ? "View your full quiz stats →" : `View ${entry.username}'s profile →`}</Link>
                </div>
              )}
            </div>;
          })}</div>}
      </CardContent>
    </Card>
  </div>;
}

function SlidePuzzleBoard({ myProfileId }: { myProfileId?: number }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/slide-puzzle-games/leaderboard"],
    queryFn: () => customFetch<SlidePuzzleLeaderboardEntry[]>("/api/slide-puzzle-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-sky-200/60 dark:border-sky-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg"><Grid3x3 className="h-5 w-5 text-sky-600" /> Slide Puzzle — All Board Sizes</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Slide Puzzle leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Grid3x3 className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Slide Puzzles yet.</p><p className="mt-1 text-sm">Solve a board to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            const isExpanded = expandedId === entry.profileId;
            return <div key={entry.profileId}>
              <button onClick={() => setExpandedId((current) => current === entry.profileId ? null : entry.profileId)} className={`flex w-full items-center justify-between gap-2 px-3 py-4 text-left transition-colors sm:px-5 ${isMe ? "bg-sky-50/70 hover:bg-sky-50 dark:bg-sky-950/20" : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}>
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4"><RankBadge rank={entry.rank} /><div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-sky-800 dark:text-sky-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-sky-700 dark:text-sky-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div>{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
              </button>
              {isExpanded && <PlayerDetailsPanel profileId={entry.profileId} game="slide-puzzle" myProfileId={myProfileId} />}
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <SlidePuzzleScoringGuide />
  </div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function LeaderboardScopeLinks({
  active,
}: {
  active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "science-quiz" | "maths-quiz" | "gk-quiz";
}) {
  const [, setLocation] = useLocation();
  const links = [
    { id: "all", href: "/leaderboard/", label: "All Games", icon: Trophy },
    { id: "sudoku", href: "/leaderboard/sudoku/", label: "Sudoku", icon: Zap },
    { id: "memory", href: "/leaderboard/memory/", label: "Memory Match", icon: Brain },
    { id: "jigsaw", href: "/leaderboard/jigsaw/", label: "Jigsaw", icon: Puzzle },
    { id: "word-search", href: "/leaderboard/word-search/", label: "Word Search", icon: Search },
    { id: "minesweeper", href: "/leaderboard/minesweeper/", label: "Minesweeper", icon: Bomb },
    { id: "slide-puzzle", href: "/leaderboard/slide-puzzle/", label: "Slide Puzzle", icon: Grid3x3 },
    { id: "science-quiz", href: "/leaderboard/science-quiz/", label: "Science Quiz", icon: CircleHelp },
    { id: "maths-quiz", href: "/leaderboard/maths-quiz/", label: "Maths Quiz", icon: CircleHelp },
    { id: "gk-quiz", href: "/leaderboard/gk-quiz/", label: "GK Quiz", icon: CircleHelp },
  ] as const;
  const selected = links.find((link) => link.id === active) ?? links[0];
  const SelectedIcon = selected.icon;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Trophy className="h-3.5 w-3.5" /> Leaderboard
      </span>
      <Select value={active} onValueChange={(value) => {
        const target = links.find((link) => link.id === value);
        if (target) setLocation(target.href);
      }}>
        <SelectTrigger className="h-9 flex-1 bg-background" aria-label="Leaderboard game">
          <SelectValue>
            <span className="flex items-center gap-2">
              <SelectedIcon className="h-4 w-4 shrink-0 text-primary" />
              {selected.label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {links.map(({ id, label, icon: Icon }) => (
            <SelectItem key={id} value={id}>
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const PLAY_LINKS: Record<
  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "science-quiz" | "maths-quiz" | "gk-quiz",
  { href: string; label: string; ariaLabel: string; icon: typeof Zap; borderClass: string; iconClass: string }
> = {
  sudoku: { href: "/sudoku", label: "Play Sudoku", ariaLabel: "Play Sudoku", icon: Zap, borderClass: "border-border", iconClass: "text-primary" },
  memory: { href: "/memory/", label: "Play Memory", ariaLabel: "Play Memory Match", icon: Brain, borderClass: "border-border", iconClass: "text-primary" },
  jigsaw: { href: "/jigsaw", label: "Play Jigsaw", ariaLabel: "Play Jigsaw", icon: Puzzle, borderClass: "border-border", iconClass: "text-amber-600" },
  "word-search": { href: "/word-search", label: "Word Search", ariaLabel: "Play Word Search", icon: Search, borderClass: "border-violet-200 dark:border-violet-800", iconClass: "text-violet-600" },
  minesweeper: { href: "/minesweeper", label: "Minesweeper", ariaLabel: "Play Minesweeper", icon: Bomb, borderClass: "border-emerald-200 dark:border-emerald-800", iconClass: "text-emerald-600" },
  "slide-puzzle": { href: "/slide-puzzle", label: "Slide Puzzle", ariaLabel: "Play Slide Puzzle", icon: Grid3x3, borderClass: "border-sky-200 dark:border-sky-800", iconClass: "text-sky-600" },
  "science-quiz": { href: "/quiz/science", label: "Science Quiz", ariaLabel: "Play Science Quiz", icon: CircleHelp, borderClass: "border-violet-200 dark:border-violet-800", iconClass: "text-violet-600" },
  "maths-quiz": { href: "/quiz/maths", label: "Maths Quiz", ariaLabel: "Play Maths Quiz", icon: CircleHelp, borderClass: "border-sky-200 dark:border-sky-800", iconClass: "text-sky-600" },
  "gk-quiz": { href: "/quiz/gk", label: "GK Quiz", ariaLabel: "Play GK Quiz", icon: CircleHelp, borderClass: "border-amber-200 dark:border-amber-800", iconClass: "text-amber-600" },
};

export default function Leaderboard({
  gamePage: routeGamePage,
}: {
  gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "science-quiz" | "maths-quiz" | "gk-quiz";
} = {}) {
  const search = useSearch();
  const requestedTab = new URLSearchParams(search).get("tab");
  const gamePage =
    routeGamePage ??
    (requestedTab === "sudoku" || requestedTab === "memory" || requestedTab === "jigsaw" || requestedTab === "word-search" || requestedTab === "minesweeper" || requestedTab === "slide-puzzle" || requestedTab === "science-quiz" || requestedTab === "maths-quiz" || requestedTab === "gk-quiz" ? requestedTab : null);
  const initialTab: MainTab =
    requestedTab === "monthly" || requestedTab === "alltime"
      ? requestedTab
      : "weekly";
  usePageMeta({
    title:
      gamePage === "sudoku"
        ? "Sudoku Leaderboard | Play Brain Games . Online"
        : gamePage === "memory"
          ? "Memory Match Leaderboard | Play Brain Games . Online"
          : gamePage === "jigsaw"
            ? "Jigsaw Leaderboard | Play Brain Games . Online"
          : gamePage === "word-search"
            ? "Word Search Leaderboard | Play Brain Games . Online"
            : gamePage === "minesweeper"
              ? "Minesweeper Leaderboard | Play Brain Games . Online"
              : gamePage === "slide-puzzle"
                ? "Slide Puzzle Leaderboard | Play Brain Games . Online"
                : gamePage === "science-quiz"
                  ? "Science Quiz Leaderboard | Play Brain Games . Online"
                  : gamePage === "maths-quiz"
                    ? "Maths Quiz Leaderboard | Play Brain Games . Online"
                    : gamePage === "gk-quiz"
                      ? "GK Quiz Leaderboard | Play Brain Games . Online"
                      : "All Games Leaderboard | Play Brain Games . Online",
    description:
      gamePage === "sudoku"
        ? "Compare all-time Sudoku points across every grid size on Play Brain Games . Online."
        : gamePage === "memory"
          ? "Compare all-time Memory Match scores across every level on Play Brain Games . Online."
          : gamePage === "jigsaw"
            ? "Compare Jigsaw puzzle points across all board sizes on Play Brain Games . Online."
          : gamePage === "word-search"
            ? "Compare all-time Word Search points across every difficulty on Play Brain Games . Online."
            : gamePage === "minesweeper"
              ? "Compare all-time Minesweeper points across every board size on Play Brain Games . Online."
              : gamePage === "slide-puzzle"
                ? "Compare all-time Slide Puzzle points across every board size on Play Brain Games . Online."
                : gamePage === "science-quiz"
                  ? "Compare all-time Science Quiz points across every level on Play Brain Games . Online."
                  : gamePage === "maths-quiz"
                    ? "Compare all-time Maths Quiz points across every level on Play Brain Games . Online."
                    : gamePage === "gk-quiz"
                      ? "Compare all-time GK Quiz points across every level on Play Brain Games . Online."
                      : "Compare weekly, monthly, and all-time scores across all games on Play Brain Games . Online.",
    path: gamePage ? `/leaderboard/${gamePage}/` : "/leaderboard/",
  });
  const [tab, setTab] = useState<MainTab>(initialTab);
  const { profileId } = useAuth();
  const myProfileId = profileId ?? undefined;
  const title =
    gamePage === "sudoku"
      ? "Sudoku Leaderboard"
      : gamePage === "memory"
        ? "Memory Match Leaderboard"
        : gamePage === "jigsaw"
          ? "Jigsaw Leaderboard"
        : gamePage === "word-search"
          ? "Word Search Leaderboard"
          : gamePage === "minesweeper"
            ? "Minesweeper Leaderboard"
            : gamePage === "slide-puzzle"
              ? "Slide Puzzle Leaderboard"
              : gamePage === "science-quiz"
                ? "Science Quiz Leaderboard"
                : gamePage === "maths-quiz"
                  ? "Maths Quiz Leaderboard"
                  : gamePage === "gk-quiz"
                    ? "GK Quiz Leaderboard"
                    : "Leaderboard";
  const subtitle =
    gamePage === "sudoku"
      ? "All-time points across every Sudoku grid size."
      : gamePage === "memory"
        ? "All-time scores across every Memory Match level."
        : gamePage === "jigsaw"
          ? "All-time points across every Jigsaw board size."
        : gamePage === "word-search"
          ? "All-time points across every Word Search difficulty."
          : gamePage === "minesweeper"
            ? "All-time points across every Minesweeper board size."
            : gamePage === "slide-puzzle"
              ? "All-time points across every Slide Puzzle board size."
              : gamePage === "science-quiz"
                ? "All-time points across every Science Quiz level."
                : gamePage === "maths-quiz"
                  ? "All-time points across every Maths Quiz level."
                  : gamePage === "gk-quiz"
                    ? "All-time points across every GK Quiz level."
                    : "Weekly, monthly, and all-time rankings across all games.";

  return (
    <div className="max-w-2xl mx-auto w-full space-y-3 sm:space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 bg-card rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 border border-border">
          <div className="space-y-0.5 min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-serif font-bold tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {subtitle}
            </p>
          </div>
          {(() => {
            const playLink = gamePage ? PLAY_LINKS[gamePage] : null;
            if (!playLink) return null;
            const PlayIcon = playLink.icon;
            return (
              <Link
                href={playLink.href}
                aria-label={playLink.ariaLabel}
                title={playLink.ariaLabel}
                className={`inline-flex items-center gap-1.5 rounded-lg border bg-card p-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:px-2.5 sm:py-1.5 sm:text-sm ${playLink.borderClass}`}
              >
                <PlayIcon className={`h-3.5 w-3.5 ${playLink.iconClass}`} />
                <span className="hidden sm:inline">{playLink.label}</span>
              </Link>
            );
          })()}
        </div>
      </div>

      <LeaderboardScopeLinks active={gamePage ?? "all"} />

      {gamePage === "sudoku" ? (
        <AlltimeBoard myProfileId={myProfileId} />
      ) : gamePage === "memory" ? (
        <MemoryBoard myProfileId={myProfileId} />
      ) : gamePage === "jigsaw" ? (
        <JigsawBoard myProfileId={myProfileId} />
      ) : gamePage === "word-search" ? (
        <WordSearchBoard myProfileId={myProfileId} />
      ) : gamePage === "minesweeper" ? (
        <MinesweeperBoard myProfileId={myProfileId} />
      ) : gamePage === "slide-puzzle" ? (
        <SlidePuzzleBoard myProfileId={myProfileId} />
      ) : gamePage === "science-quiz" ? (
        <QuizBoard myProfileId={myProfileId} subjectId="science" />
      ) : gamePage === "maths-quiz" ? (
        <QuizBoard myProfileId={myProfileId} subjectId="maths" />
      ) : gamePage === "gk-quiz" ? (
        <QuizBoard myProfileId={myProfileId} subjectId="gk" />
      ) : (
        <>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as MainTab)}
            className="w-full"
          >
            <TabsList className="leaderboard-tabs grid w-full grid-cols-3 gap-1 h-auto p-0.5 sm:p-1">
              <TabsTrigger value="weekly" className="leaderboard-tab-trigger flex flex-row items-center gap-1.5 leading-tight py-2 sm:flex-col sm:gap-0 sm:py-1.5">
                <span className="leaderboard-tab-main flex items-center justify-center gap-1">
                  <CalendarDays className="leaderboard-tab-icon w-3.5 h-3.5 shrink-0" />
                  <span>Weekly</span>
                </span>
                <span className="hidden text-[9px] font-normal opacity-60 sm:block">tournament</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="leaderboard-tab-trigger flex flex-row items-center gap-1.5 leading-tight py-2 sm:flex-col sm:gap-0 sm:py-1.5">
                <span className="leaderboard-tab-main flex items-center justify-center gap-1">
                  <Calendar className="leaderboard-tab-icon w-3.5 h-3.5 shrink-0" />
                  <span>Monthly</span>
                </span>
                <span className="hidden text-[9px] font-normal opacity-60 sm:block">tournament</span>
              </TabsTrigger>
              <TabsTrigger value="alltime" className="leaderboard-tab-trigger flex flex-row items-center gap-1.5 leading-tight py-2 sm:flex-col sm:gap-0 sm:py-1.5">
                <span className="leaderboard-tab-main flex items-center justify-center gap-1">
                  <Zap className="leaderboard-tab-icon w-3.5 h-3.5 shrink-0" />
                  <span>All Time</span>
                </span>
                <span className="hidden text-[9px] font-normal opacity-60 sm:block">all games</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <TournamentBoard type={tab} myProfileId={myProfileId} />
        </>
      )}
    </div>
  );
}
