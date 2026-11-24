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
  Box,
  Puzzle,
  Bomb,
  Grid2x2,
  LayoutGrid,
  WholeWord,
  Timer,
  Repeat2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { LevelBadge } from "@/components/level-badge";
import { getLevelFromXp } from "@/lib/levels";
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
import { QUIZ_LEVELS, QUIZ_SUBJECTS, quizGameId, quizSubject, quizSubjectForGameId, type QuizGameId, type QuizSubject } from "@/lib/quiz";
import { WORD_SEARCH_LEVELS, type WordSearchDifficulty } from "@/lib/word-search";
import { MINESWEEPER_LEVELS, type MinesweeperDifficulty } from "@/lib/minesweeper";
import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty } from "@/lib/slide-puzzle";
import { GAME_2048_LEVELS } from "@/lib/game-2048";
import { JUMBLE_LEVELS } from "@/lib/jumble-words";
import { ODD_IMAGE_LEVELS, ODD_IMAGE_LEVEL_ORDER, type OddImageLevel } from "@/lib/odd-images";
import { JIGSAW_SIZE_NAMES } from "@/lib/jigsaw-session";
import { GAME_ICONS, gameIconColor } from "@/lib/game-icons";
import { RUBIKS_VISIBLE } from "@/lib/rubiks";

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
            <p className="mb-2 text-xs font-semibold text-foreground">Jigsaw XP by assist level</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ level: "Guided", xp: 1 }, { level: "Assisted", xp: 2 }, { level: "Challenging", xp: 3 }].map((item) => (
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
              {[{ level: "Easy", xp: 1 }, { level: "Medium", xp: 1 }, { level: "Hard", xp: 2 }, { level: "Expert", xp: 3 }].map((item) => (
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
              {[{ level: "Easy", xp: 1 }, { level: "Medium", xp: 1 }, { level: "Hard", xp: 2 }, { level: "Expert", xp: 3 }].map((item) => (
                <div key={item.level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{item.level}</p>
                  <p className="text-xs font-bold text-emerald-600">{item.xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Minesweeper XP is awarded for each cleared minefield and increases with the selected difficulty. Only wins earn XP.</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Slide Puzzle XP by level</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[{ level: "Easy", xp: 1 }, { level: "Medium", xp: 1 }, { level: "Hard", xp: 2 }, { level: "Expert", xp: 3 }].map((item) => (
                <div key={item.level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{item.level}</p>
                  <p className="text-xs font-bold text-sky-600">{item.xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Slide Puzzle XP is awarded for each solved board and increases with the selected size. Only wins earn XP.</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Odd Images XP by level</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {ODD_IMAGE_LEVEL_ORDER.map((level) => (
                <div key={level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{ODD_IMAGE_LEVELS[level].label}</p>
                  <p className="text-xs font-bold text-teal-600">{ODD_IMAGE_LEVELS[level].xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Odd Images XP is awarded for each completed grid set and increases with the selected level.</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Quiz XP by level (Science, Maths & GK)</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[{ level: "Easy", xp: 1 }, { level: "Medium", xp: 1 }, { level: "Hard", xp: 2 }, { level: "Expert", xp: 3 }].map((item) => (
                <div key={item.level} className="rounded-lg border border-border bg-background px-2 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{item.level}</p>
                  <p className="text-xs font-bold text-amber-600">{item.xp} XP</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">Quiz XP is awarded for each completed quiz round with at least one correct answer and increases with the level. All three subjects award the same XP.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Collapsible points guide (tournament tabs) ────────────────────────────────

function PointsGuide() {
  const [open, setOpen] = useState(false);
  const gameModeRows = [
    {
      game: "Sudoku",
      kids: "3×3 · 4×4 · 6×6",
      adult: "9×9 · 16×16",
      all: "All five sizes",
    },
    {
      game: "Memory Match",
      kids: "Easy · Medium",
      adult: "Hard · Expert",
      all: "All four boards",
    },
    {
      game: "Jigsaw",
      kids: "Easy · Medium",
      adult: "Hard · Expert",
      all: "All four sizes",
    },
    {
      game: "Word Search",
      kids: "Easy · Medium",
      adult: "Hard · Expert",
      all: "All four levels",
    },
    {
      game: "Minesweeper",
      kids: "Easy · Medium",
      adult: "Hard · Expert",
      all: "All four levels",
    },
    {
      game: "Slide Puzzle",
      kids: "Easy · Medium",
      adult: "Hard · Expert",
      all: "All four sizes",
    },
    {
      game: "Odd Images",
      kids: "Easy · Medium",
      adult: "Hard · Expert",
      all: "All four levels",
    },
    {
      game: "Quizzes",
      kids: "Easy · Medium",
      adult: "Hard · Expert",
      all: "All four levels",
    },
  ] as const;
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
                  <span>Board</span><span className="text-center">Base</span><span className="text-center">Guided par</span><span className="text-center">Assisted</span><span className="text-center">Challenging</span>
                </div>
                {[
                  { size: 2, base: 100, par: "0:45", gems: 1 },
                  { size: 3, base: 250, par: "1:30", gems: 2 },
                  { size: 4, base: 500, par: "2:30", gems: 3 },
                  { size: 5, base: 1000, par: "4:00", gems: 3 },
                ].map((row, i) => (
                  <div key={row.size} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                    <span className="font-semibold">{JIGSAW_SIZE_NAMES[row.size as keyof typeof JIGSAW_SIZE_NAMES]} · {row.size}×{row.size}<span className="block text-[9px] font-normal text-muted-foreground">{row.gems} gem{row.gems === 1 ? "" : "s"} on win</span></span>
                    <span className="text-center font-mono">{row.base}</span><span className="text-center font-mono">{row.par}</span><span className="text-center font-mono">×1.5</span><span className="text-center font-mono">×2</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Assisted and Challenging multiply base points by 1.5× and 2×. Finish under par for up to +50%; each extra move costs 2% and each tip costs 10% (each penalty has a 50% floor). XP per win: Guided 1, Assisted 2, Challenging 3.
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
                  label: "Easy · 2×4",
                  base: 150,
                  par: "0:25",
                  max: 225,
                  cls: "text-green-700",
                },
                {
                  label: "Medium · 4×4",
                  base: 500,
                  par: "1:00",
                  max: 750,
                  cls: "text-blue-700",
                },
                {
                  label: "Hard · 8×4",
                  base: 1600,
                  par: "2:00",
                  max: 2400,
                  cls: "text-yellow-700",
                },
                {
                  label: "Expert · 8×8",
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
                { label: "Easy · 6×6", base: 120, par: "2:00", tries: 6, gems: 1, cls: "text-green-700" },
                { label: "Medium · 8×8", base: 280, par: "4:00", tries: 8, gems: 2, cls: "text-blue-700" },
                { label: "Hard · 12×12", base: 650, par: "7:00", tries: 10, gems: 3, cls: "text-yellow-700" },
                { label: "Expert · 14×14", base: 1300, par: "12:00", tries: 12, gems: 4, cls: "text-orange-700" },
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
              score = base × (1 + time bonus up to +50%) × try factor × tip factor &nbsp;·&nbsp; −2.5% per try beyond the word count (floor 45%), −20% per hint (floor 60%), min 10 pts. XP: Easy/Medium 1, Hard 2, Expert 3.
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
                { label: "Easy", base: 150, par: "1:30", board: "6×6 · 5 mines", gems: 1, cls: "text-green-700" },
                { label: "Medium", base: 350, par: "3:00", board: "8×8 · 12 mines", gems: 2, cls: "text-blue-700" },
                { label: "Hard", base: 800, par: "6:00", board: "12×12 · 24 mines", gems: 3, cls: "text-yellow-700" },
                { label: "Expert", base: 1600, par: "10:00", board: "14×14 · 34 mines", gems: 4, cls: "text-orange-700" },
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
              Only wins score. score = base × (1 + time bonus up to +50%) × mistake factor × hint factor &nbsp;·&nbsp; −15% per mine hit (floor 40%), −20% per hint (floor 60%), min 10 pts. Three mine hits ends the game. XP: Easy/Medium 1, Hard 2, Expert 3.
            </p>
          </div>

          {/* Slide Puzzle base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🧩 Slide Puzzle — base points × level
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Par moves</span>
                <span className="text-center">Gems</span>
              </div>
              {[
                { label: "Easy · 2×2", base: 120, par: "1:30", moves: 12, gems: 1, cls: "text-green-700" },
                { label: "Medium · 3×3", base: 300, par: "5:00", moves: 60, gems: 2, cls: "text-blue-700" },
                { label: "Hard · 4×4", base: 700, par: "20:00", moves: 160, gems: 3, cls: "text-yellow-700" },
                { label: "Expert · 5×5", base: 1500, par: "45:00", moves: 320, gems: 4, cls: "text-orange-700" },
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
              Only wins score. score = base × (1 + time bonus up to +50%) × move factor × hint factor &nbsp;·&nbsp; move factor scales 60–100% toward the par move count, −15% per hint (floor 70%), min 10 pts. XP: Easy/Medium = 1, Hard = 2, Expert = 3.
            </p>
          </div>

          {/* 2048 base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🔢 2048 — base points × board size
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-6 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Target tile</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy · 3×3", mode: "Kids", target: 512, par: "10:00", base: 150, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium · 4×4", mode: "Kids", target: 1024, par: "25:00", base: 400, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard · 5×5", mode: "Adult", target: 2048, par: "45:00", base: 900, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert · 6×6", mode: "Adult", target: 2048, par: "75:00", base: 1800, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-6 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-semibold text-muted-foreground">{row.mode}</span>
                  <span className="text-center font-mono">{row.target}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × tile factor (log-scaled to the target tile, up to 1.5×) × (1 + time bonus up to +50%) × move factor &nbsp;·&nbsp; move factor scales 70–100% toward the par move count, min 10 pts. Higher max tiles always score more.
            </p>
          </div>

          {/* Jumble Words base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🔤 Jumble Words — base points × level
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-6 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Words</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy", mode: "Kids", words: 5, par: "3:00", base: 300, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium", mode: "Kids", words: 8, par: "5:00", base: 650, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard", mode: "Adult", words: 10, par: "7:00", base: 1300, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert", mode: "Adult", words: 12, par: "10:00", base: 2400, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-6 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-semibold text-muted-foreground">{row.mode}</span>
                  <span className="text-center font-mono">{row.words}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × accuracy factor (0.3 + 0.7 × correct ÷ questions) × (1 + time bonus up to +50%) × attempt factor &nbsp;·&nbsp; attempt factor scales 70–100% with fewer wrong guesses, min 10 pts.
            </p>
          </div>

          {/* Odd Images base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🖼️ Odd Images — base points × level
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Grid</span>
                <span className="text-center">Questions</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {ODD_IMAGE_LEVEL_ORDER.map((level, i) => {
                const item = ODD_IMAGE_LEVELS[level];
                return (
                  <div key={level} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                    <span className={`font-semibold ${level === "easy" ? "text-green-700" : level === "medium" ? "text-blue-700" : level === "hard" ? "text-yellow-700" : "text-orange-700"}`}>{item.label}</span>
                    <span className="text-center font-mono">{item.gridSize}×{item.gridSize}</span>
                    <span className="text-center font-mono">{item.questions}</span>
                    <span className="text-center font-mono">{item.basePoints.toLocaleString()}</span>
                    <span className="text-center font-mono">{item.xp} XP · {item.gems}💎</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × (0.5 + 0.5 × accuracy) × (1 + time bonus up to +50%) &nbsp;·&nbsp; accuracy = correct ÷ questions, speed bonus for finishing under par, min 10 pts. XP: Easy/Medium 1, Hard 2, Expert 3.
            </p>
          </div>

          {/* Quiz base points table (Science, Maths & GK share the same scoring) */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🧠 Science / Maths / GK Quiz — base points × level
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Questions</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy", questions: 5, par: "2:00", base: 150, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium", questions: 8, par: "3:00", base: 300, xp: 1, gems: 2, cls: "text-blue-700" },
                { label: "Hard", questions: 10, par: "4:00", base: 600, xp: 2, gems: 3, cls: "text-yellow-700" },
                { label: "Expert", questions: 12, par: "5:00", base: 1200, xp: 3, gems: 4, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.questions}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              All three quiz games (Science 🔬, Maths 🔢, GK 🌍) score identically. score = base × (0.5 + 0.5 × accuracy) × (1 + time bonus up to +50%) &nbsp;·&nbsp; accuracy = correct ÷ questions answered, speed bonus for finishing under par, min 10 pts. No points for a round with zero correct answers. Each quiz has its own leaderboard.
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
            <div className="rounded-xl border overflow-x-auto text-xs">
              <div className="min-w-[420px]">
                <div className="grid grid-cols-4 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                  <span>Game</span>
                  <span className="text-center text-green-700">👶 Kids</span>
                  <span className="text-center text-blue-700">🧑 Adult</span>
                  <span className="text-center text-violet-700">🌍 4 All</span>
                </div>
                {gameModeRows.map((row, i) => (
                  <div
                    key={row.game}
                    className={`grid grid-cols-4 px-3 py-2 ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                  >
                    <span className="font-semibold text-foreground">{row.game}</span>
                    <span className="text-center text-muted-foreground">{row.kids}</span>
                    <span className="text-center text-muted-foreground">{row.adult}</span>
                    <span className="text-center text-muted-foreground">{row.all}</span>
                  </div>
                ))}
              </div>
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
            {(() => { const Icon = GAME_ICONS.sudoku; return <Icon className="w-5 h-5 text-primary" />; })()}
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
  game2048: { difficulty: string; points: number; games: number }[];
  jumble: { difficulty: string; points: number; games: number }[];
  oddImages: { level: OddImageLevel; points: number; games: number }[];
  quiz?: { subject: string; level: string; points: number; games: number }[];
}

const SUDOKU_GRID_NAMES: Record<number, string> = {
  3: "3×3",
  4: "4×4",
  6: "6×6",
  9: "9×9",
  16: "16×16",
};
const MEMORY_LEVEL_NAMES: Record<number, string> = {
  2: "Easy · 2×4",
  4: "Medium · 4×4",
  6: "Hard · 8×4",
  8: "Expert · 8×8",
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
type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | QuizGameId;

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
          <button onClick={() => setBdTab("game-2048")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "game-2048" ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔢 2048
          </button>
          <button onClick={() => setBdTab("jumble")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "jumble" ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔤 Jumble
          </button>
          <button onClick={() => setBdTab("odd-images")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "odd-images" ? "bg-teal-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🖼️ Odd Images
          </button>
          {(Object.keys(QUIZ_SUBJECTS) as QuizSubject[]).map((id) => {
            const subject = QUIZ_SUBJECTS[id];
            const tab = quizGameId(id);
            return <button key={id} onClick={() => setBdTab(tab)} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === tab ? subject.theme.btn : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {subject.emoji} {subject.shortName}
            </button>;
          })}
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
              <p className="text-xs font-bold text-foreground">{JIGSAW_SIZE_NAMES[item.gridSize as keyof typeof JIGSAW_SIZE_NAMES] ?? `${item.gridSize}×${item.gridSize}`} · {item.gridSize}×{item.gridSize}</p>
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
              <p className="text-xs font-bold text-foreground">{WORD_SEARCH_LEVELS[item.difficulty as WordSearchDifficulty]?.label ?? item.difficulty} · {WORD_SEARCH_LEVELS[item.difficulty as WordSearchDifficulty]?.size ?? ""}×{WORD_SEARCH_LEVELS[item.difficulty as WordSearchDifficulty]?.size ?? ""}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-violet-700 dark:text-violet-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{WORD_SEARCH_LEVELS[item.difficulty as WordSearchDifficulty] ? `${WORD_SEARCH_LEVELS[item.difficulty as WordSearchDifficulty].wordCount} words` : ""}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "minesweeper" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.minesweeper ?? ["beginner", "easy", "medium", "hard"].map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-emerald-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{MINESWEEPER_LEVELS[item.difficulty as MinesweeperDifficulty]?.label ?? item.difficulty}</p>
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
              <p className="text-xs font-bold text-foreground">{SLIDE_PUZZLE_LEVELS[item.difficulty as SlidePuzzleDifficulty]?.label ?? item.difficulty} · {item.difficulty.replace("x", "×")}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-sky-700 dark:text-sky-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{SLIDE_PUZZLE_DIFFICULTY_NAMES[item.difficulty]}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "game-2048" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.game2048 ?? (["3x3", "4x4", "5x5", "6x6"] as const).map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-orange-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{GAME_2048_LEVELS[item.difficulty as keyof typeof GAME_2048_LEVELS]?.label ?? item.difficulty} · {item.difficulty.replace("x", "×")}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-orange-700 dark:text-orange-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{item.difficulty.replace("x", "×")} board</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "jumble" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.jumble ?? (["easy", "medium", "hard", "expert"] as const).map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-cyan-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{JUMBLE_LEVELS[item.difficulty as keyof typeof JUMBLE_LEVELS]?.label ?? item.difficulty}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-cyan-700 dark:text-cyan-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{JUMBLE_LEVELS[item.difficulty as keyof typeof JUMBLE_LEVELS] ? `${JUMBLE_LEVELS[item.difficulty as keyof typeof JUMBLE_LEVELS].questions} words` : ""}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "odd-images" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.oddImages ?? ODD_IMAGE_LEVEL_ORDER.map((level) => ({ level, points: 0, games: 0 }))).map((item) => (
            <div key={item.level} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-teal-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{ODD_IMAGE_LEVELS[item.level]?.label ?? item.level}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-teal-700 dark:text-teal-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{ODD_IMAGE_LEVELS[item.level] ? `${ODD_IMAGE_LEVELS[item.level].gridSize}×${ODD_IMAGE_LEVELS[item.level].gridSize} · ${ODD_IMAGE_LEVELS[item.level].questions} questions` : ""}</p>
            </div>
          ))}
        </div>
      )}
      {(() => {
        const subjectId = quizSubjectForGameId(bdTab);
        if (!subjectId) return null;
        const subject = QUIZ_SUBJECTS[subjectId];
        const rows = data?.quiz ?? [];
        return (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QUIZ_LEVELS.map((level) => {
              const item = rows.find((row) => row.subject === subjectId && row.level === level);
              const points = item?.points ?? 0;
              const games = item?.games ?? 0;
              return (
                <div key={level} className={`rounded-xl border p-2.5 text-center transition-colors ${games > 0 ? `${subject.theme.border} bg-background` : "border-border bg-muted/30 opacity-50"}`}>
                  <p className="text-xs font-bold text-foreground">{subject.levels[level].label}</p>
                  <p className={`mt-0.5 text-lg font-black tabular-nums leading-tight ${subject.theme.strong}`}>{points > 0 ? points.toLocaleString() : "—"}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{games > 0 ? `${games} game${games !== 1 ? "s" : ""}` : "no games"}</p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground/80">{subject.levels[level].detail}</p>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

// ─── All-games per-player summary (game-level totals, no option breakdown) ──

function GameSummaryPanel({
  profileId,
  type,
  period,
}: {
  profileId: number;
  type: "weekly" | "monthly" | "alltime";
  period: string;
}) {
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
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const sum = (items: { points: number; games: number }[] | undefined) =>
    (items ?? []).reduce((acc, item) => ({ points: acc.points + (item.points ?? 0), games: acc.games + (item.games ?? 0) }), { points: 0, games: 0 });

  const quizFor = (subject: QuizSubject) =>
    sum((data?.quiz ?? []).filter((row) => row.subject === subject));

  const rows = [
    { id: "sudoku", label: "Sudoku", icon: GAME_ICONS.sudoku, ...sum(data?.sudoku) },
    { id: "memory", label: "Memory Match", icon: GAME_ICONS.memory, ...sum(data?.memory) },
    { id: "jigsaw", label: "Jigsaw", icon: GAME_ICONS.jigsaw, ...sum(data?.jigsaw) },
    { id: "word-search", label: "Word Search", icon: GAME_ICONS["word-search"], ...sum(data?.wordSearch) },
    { id: "minesweeper", label: "Minesweeper", icon: GAME_ICONS.minesweeper, ...sum(data?.minesweeper) },
    { id: "slide-puzzle", label: "Slide Puzzle", icon: GAME_ICONS["slide-puzzle"], ...sum(data?.slidePuzzle) },
    { id: "game-2048", label: "2048", icon: GAME_ICONS["game-2048"], ...sum(data?.game2048) },
    { id: "jumble", label: "Jumble Words", icon: GAME_ICONS.jumble, ...sum(data?.jumble) },
    { id: "odd-images", label: "Odd Images", icon: GAME_ICONS["odd-images"], ...sum(data?.oddImages) },
    { id: "science-quiz", label: `${QUIZ_SUBJECTS.science.shortName} Quiz`, icon: GAME_ICONS["science-quiz"], ...quizFor("science") },
    { id: "maths-quiz", label: `${QUIZ_SUBJECTS.maths.shortName} Quiz`, icon: GAME_ICONS["maths-quiz"], ...quizFor("maths") },
    { id: "gk-quiz", label: `${QUIZ_SUBJECTS.gk.shortName} Quiz`, icon: GAME_ICONS["gk-quiz"], ...quizFor("gk") },
  ].filter((row) => row.games > 0);

  return (
    <div className="border-t bg-muted/20 px-5 pb-4 pt-3">
      {rows.length === 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">No completed games in this period.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                {(() => { const Icon = row.icon; return <Icon className={`h-4 w-4 shrink-0 ${gameIconColor(row.id)}`} />; })()}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{row.label}</p>
                  <p className="text-[10px] text-muted-foreground">{row.games} game{row.games !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-black tabular-nums text-primary">{row.points.toLocaleString()}</p>
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
                Complete games in any title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, or the quizzes — to earn points and climb the rankings!
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
                          {typeof (entry as any).xp === "number" && (() => {
                            const lvl = getLevelFromXp((entry as any).xp);
                            return (
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="h-1 w-16 overflow-hidden rounded-full bg-muted sm:w-24">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${lvl.progress}%`, backgroundColor: lvl.color }}
                                  />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground tabular-nums whitespace-nowrap">
                                  {lvl.name} · {(entry as any).xp.toLocaleString()} XP
                                </span>
                              </div>
                            );
                          })()}
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
                      <GameSummaryPanel
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
                  label: "Easy · 2×4",
                  cls: "text-green-700",
                  base: "150",
                  par: "0:25",
                  xp: "1 XP",
                },
                {
                  label: "Medium · 4×4",
                  cls: "text-blue-700",
                  base: "500",
                  par: "1:00",
                  xp: "1 XP",
                },
                {
                  label: "Hard · 8×4",
                  cls: "text-yellow-700",
                  base: "1,600",
                  par: "2:00",
                  xp: "2 XP",
                },
                {
                  label: "Expert · 8×8",
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
                { mode: "👶 Kids",  sizes: "Easy (2×4) · Medium (4×4)",   cls: "text-green-700" },
                { mode: "🧑 Adult", sizes: "Hard (8×4) · Expert (8×8)", cls: "text-blue-700"  },
                { mode: "🌍 4 All", sizes: "All four boards",             cls: "text-violet-700" },
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
  { size: 2, label: "Easy", pairs: 4 },
  { size: 4, label: "Medium", pairs: 8 },
  { size: 6, label: "Hard", pairs: 16 },
  { size: 8, label: "Expert", pairs: 32 },
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
                <p className="font-bold">{JIGSAW_SIZE_NAMES[item.size as keyof typeof JIGSAW_SIZE_NAMES]} · {item.size}×{item.size}</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Guided par {formatTime(item.par)}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎 per win</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Level multipliers and XP</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">Multiplier</span><span className="text-center">XP</span><span className="text-center">Par time</span></div>
              {[
                { label: "Guided", multiplier: "×1", xp: "1 XP", par: "Base" },
                { label: "Assisted", multiplier: "×1.5", xp: "2 XP", par: "+35%" },
                { label: "Challenging", multiplier: "×2", xp: "3 XP", par: "+70%" },
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
            {[{ level: "Easy · 6×6", base: 120, par: "2:00", tries: 6, gems: 1 }, { level: "Medium · 8×8", base: 280, par: "4:00", tries: 8, gems: 2 }, { level: "Hard · 12×12", base: 650, par: "7:00", tries: 10, gems: 3 }, { level: "Expert · 14×14", base: 1300, par: "12:00", tries: 12, gems: 4 }].map((item) => (
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
                { label: "Easy", xp: "1 XP", gems: "1 💎", grid: "6×6" },
                { label: "Medium", xp: "1 XP", gems: "2 💎", grid: "8×8" },
                { label: "Hard", xp: "2 XP", gems: "3 💎", grid: "12×12" },
                { label: "Expert", xp: "3 XP", gems: "4 💎", grid: "14×14" },
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
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS["word-search"]; return <Icon className="h-5 w-5 text-violet-600" />; })()} Word Search — All Difficulties</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Word Search leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><WholeWord className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Word Search games yet.</p><p className="mt-1 text-sm">Complete a puzzle to claim the top spot.</p></div>
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
            {[{ level: "Easy", base: 150, par: "1:30", board: "6×6 · 5", gems: 1 }, { level: "Medium", base: 350, par: "3:00", board: "8×8 · 12", gems: 2 }, { level: "Hard", base: 800, par: "6:00", board: "12×12 · 24", gems: 3 }, { level: "Expert", base: 1600, par: "10:00", board: "14×14 · 34", gems: 4 }].map((item) => (
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
                { label: "Easy", xp: "1 XP", gems: "1 💎", grid: "6×6" },
                { label: "Medium", xp: "1 XP", gems: "2 💎", grid: "8×8" },
                { label: "Hard", xp: "2 XP", gems: "3 💎", grid: "12×12" },
                { label: "Expert", xp: "3 XP", gems: "4 💎", grid: "14×14" },
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
            {[{ level: "Easy · 2×2", base: 120, par: "1:30", moves: 12, gems: 1 }, { level: "Medium · 3×3", base: 300, par: "5:00", moves: 60, gems: 2 }, { level: "Hard · 4×4", base: 700, par: "20:00", moves: 160, gems: 3 }, { level: "Expert · 5×5", base: 1500, par: "45:00", moves: 320, gems: 4 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par} · {item.moves} moves</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP by level</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Tiles</span></div>
              {[
                { label: "Easy · 2×2", xp: "1 XP", gems: "1 💎", tiles: "3" },
                { label: "Medium · 3×3", xp: "1 XP", gems: "2 💎", tiles: "8" },
                { label: "Hard · 4×4", xp: "2 XP", gems: "3 💎", tiles: "15" },
                { label: "Expert · 5×5", xp: "3 XP", gems: "4 💎", tiles: "24" },
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
type RubiksLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

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
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS[quizGameId(subjectId)]; return <Icon className={`h-5 w-5 ${subject.theme.text}`} />; })()} {subject.name} — All Levels</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Quiz leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground">{(() => { const Icon = GAME_ICONS[quizGameId(subjectId)]; return <Icon className="mx-auto mb-3 h-10 w-10 opacity-20" />; })()}<p className="font-medium">No completed quizzes yet.</p><p className="mt-1 text-sm">Answer a few questions to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            const isExpanded = expandedId === entry.profileId;
            return <div key={entry.profileId}>
              <button onClick={() => setExpandedId((current) => current === entry.profileId ? null : entry.profileId)} className={`flex w-full items-center justify-between gap-2 px-3 py-4 text-left transition-colors sm:px-5 ${isMe ? subject.theme.row : "hover:bg-muted/40"} ${isExpanded ? "bg-muted/30" : ""}`}>
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4"><RankBadge rank={entry.rank} /><div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? subject.theme.strong : ""}`}>{entry.username}</p>{isMe && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white ${subject.theme.btn.split(" ")[0]}`}>You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} quiz{entry.gamesPlayed !== 1 ? "zes" : ""}</p></div></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className={`whitespace-nowrap text-lg font-black tabular-nums sm:text-xl ${subject.theme.strong}`}>{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div>{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
              </button>
              {isExpanded && <PlayerDetailsPanel profileId={entry.profileId} game={quizGameId(subjectId)} myProfileId={myProfileId} />}
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <QuizScoringGuide subject={subject} />
  </div>;
}

function QuizScoringGuide({ subject }: { subject: ReturnType<typeof quizSubject> }) {
  const [open, setOpen] = useState(false);
  const levels = QUIZ_LEVELS.map((level) => ({ level, config: subject.levels[level] }));
  return (
    <div className={`overflow-hidden rounded-2xl border ${subject.theme.border}`}>
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How {subject.name} points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Accuracy, speed, and level all count. Rounds with no correct answers score zero.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {levels.map(({ level, config }) => (
              <div key={level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{config.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{config.questions} questions</p>
                <p className="text-xs text-muted-foreground">Base {config.basePoints.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {Math.round(config.parSeconds / 60)}:{String(config.parSeconds % 60).padStart(2, "0")}</p>
                <p className="text-xs text-muted-foreground">{config.xp} XP · {config.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP &amp; gems by level</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Questions</span></div>
              {levels.map(({ level, config }, index) => (
                <div key={level} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <span className="font-semibold">{config.label}</span>
                  <span className="text-center font-semibold text-amber-600">{config.xp} XP</span>
                  <span className="text-center font-mono">{config.gems} 💎</span>
                  <span className="text-center font-mono">{config.questions}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-lg border ${subject.theme.border} ${subject.theme.soft} px-4 py-3 text-[11px] text-muted-foreground`}>
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × (0.5 + 0.5 × accuracy) × (1 + time bonus)</p>
            <p className="mt-1 leading-relaxed">Accuracy is the share of questions answered correctly. Finishing under par time adds up to +50%. Minimum score: 10 points. Points, XP, and gems are only awarded when at least one answer is correct. Daily challenges use the same formula with today's fixed question set.</p>
          </div>
        </div>
      )}
    </div>
  );
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
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS["slide-puzzle"]; return <Icon className="h-5 w-5 text-sky-600" />; })()} Slide Puzzle — All Board Sizes</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Slide Puzzle leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Grid2x2 className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Slide Puzzles yet.</p><p className="mt-1 text-sm">Solve a board to claim the top spot.</p></div>
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

function OddImagesScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-teal-200/70 dark:border-teal-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Odd Images points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Grid size, questions, accuracy, and speed all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ODD_IMAGE_LEVEL_ORDER.map((level) => {
              const config = ODD_IMAGE_LEVELS[level];
              const par = `${Math.floor(config.parSeconds / 60)}:${String(config.parSeconds % 60).padStart(2, "0")}`;
              return (
                <div key={level} className="rounded-xl border border-border bg-background p-3">
                  <p className="font-bold">{config.label} · {config.gridSize}×{config.gridSize}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Base {config.basePoints.toLocaleString()} pts</p>
                  <p className="text-xs text-muted-foreground">Par {par} · {config.questions} questions</p>
                  <p className="text-xs text-muted-foreground">{config.gems} 💎</p>
                </div>
              );
            })}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP by difficulty</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Difficulty</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Grid</span></div>
              {ODD_IMAGE_LEVEL_ORDER.map((level, index) => {
                const config = ODD_IMAGE_LEVELS[level];
                return <div key={level} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}><span className="font-semibold">{config.label}</span><span className="text-center font-semibold text-amber-600">{config.xp} XP</span><span className="text-center font-mono">{config.gems} 💎</span><span className="text-center font-mono">{config.gridSize}×{config.gridSize}</span></div>;
              })}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × (0.5 + 0.5 × accuracy) × (1 + speed bonus)</p>
            <p className="mt-1 leading-relaxed">Accuracy is the share of grids answered correctly. Finishing under par time adds up to +50%. A round with zero correct answers scores 0 points.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type OddImageLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function OddImagesBoard({ myProfileId }: { myProfileId?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/odd-image-games/leaderboard"],
    queryFn: () => customFetch<OddImageLeaderboardEntry[]>("/api/odd-image-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-teal-200/60 dark:border-teal-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS["odd-images"]; return <Icon className="h-5 w-5 text-teal-600" />; })()} Odd Images — All Levels</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Odd Images leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Trophy className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Odd Images games yet.</p><p className="mt-1 text-sm">Find the odd image to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            return <div key={entry.profileId} className={isMe ? "bg-teal-50/70 dark:bg-teal-950/20" : ""}>
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 px-3 py-4 sm:px-5">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-teal-800 dark:text-teal-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-teal-700 dark:text-teal-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div></div>
              </div>
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <OddImagesScoringGuide />
  </div>;
}


function RubiksBoard({ myProfileId }: { myProfileId?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/rubiks-games/leaderboard"],
    queryFn: () => customFetch<RubiksLeaderboardEntry[]>("/api/rubiks-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-rose-200/60 dark:border-rose-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS.rubiks; return <Icon className="h-5 w-5 text-rose-600" />; })()} Rubik's Cube — All Puzzles</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Rubik's Cube leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Box className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed puzzles yet.</p><p className="mt-1 text-sm">Solve a cube to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            return <div key={entry.profileId} className={isMe ? "bg-rose-50/70 dark:bg-rose-950/20" : ""}>
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4"><RankBadge rank={entry.rank} /><div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={isMe ? "text-rose-800 dark:text-rose-300" : ""}>{entry.username}</p>{isMe && <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} solve{entry.gamesPlayed !== 1 ? "s" : ""}</p></div></div>
              <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-rose-700 dark:text-rose-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div></div>
            </div>;
          })}</div>}
      </CardContent>
    </Card>
  </div>;
}

function Game2048ScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-orange-200/70 dark:border-orange-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How 2048 points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Biggest tile, speed, and move efficiency all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "Easy · 3×3", mode: "Kids", base: 150, par: "10:00", target: 512, gems: 1 }, { level: "Medium · 4×4", mode: "Kids", base: 400, par: "25:00", target: 1024, gems: 2 }, { level: "Hard · 5×5", mode: "Adult", base: 900, par: "45:00", target: 2048, gems: 3 }, { level: "Expert · 6×6", mode: "Adult", base: 1800, par: "75:00", target: 2048, gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.mode} mode</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par} · target {item.target}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP &amp; gems by level</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Target tile</span></div>
              {Object.values(GAME_2048_LEVELS).map((level, index) => (
                <div key={level.id} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <span className="font-semibold">{level.label} · {level.size}×{level.size}</span>
                  <span className="text-center font-semibold text-amber-600">{level.xp} XP</span>
                  <span className="text-center font-mono">{level.gems} 💎</span>
                  <span className="text-center font-mono">{level.targetTile}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × tile factor × (1 + time bonus) × move factor</p>
            <p className="mt-1 leading-relaxed">The tile factor scales with the highest tile you reach (up to 1.5× at the target). Finishing under par time adds up to +50%. Move factor scales from 70% to 100% as your move count approaches par. Minimum score: 10 points. Daily challenges use the same formula with today&apos;s shared tile sequence.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type Game2048LeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function Game2048Board({ myProfileId }: { myProfileId?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/game-2048-games/leaderboard"],
    queryFn: () => customFetch<Game2048LeaderboardEntry[]>("/api/game-2048-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-orange-200/60 dark:border-orange-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS["game-2048"]; return <Icon className="h-5 w-5 text-orange-600" />; })()} 2048 — All Board Sizes</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">2048 leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Grid2x2 className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed 2048 games yet.</p><p className="mt-1 text-sm">Merge tiles to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            return <div key={entry.profileId} className={isMe ? "bg-orange-50/70 dark:bg-orange-950/20" : ""}>
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 px-3 py-4 sm:px-5">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-orange-800 dark:text-orange-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-orange-700 dark:text-orange-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div></div>
              </div>
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <Game2048ScoringGuide />
  </div>;
}

function JumbleScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-200/70 dark:border-cyan-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Jumble Words points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Accuracy, speed, and word difficulty all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "Easy", mode: "Kids", words: 5, par: "3:00", gems: 1 }, { level: "Medium", mode: "Kids", words: 8, par: "5:00", gems: 2 }, { level: "Hard", mode: "Adult", words: 10, par: "7:00", gems: 3 }, { level: "Expert", mode: "Adult", words: 12, par: "10:00", gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.mode} mode</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.words} words per round</p>
                <p className="text-xs text-muted-foreground">Par {item.par}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP &amp; gems by level</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Words</span></div>
              {Object.values(JUMBLE_LEVELS).map((level, index) => (
                <div key={level.id} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <span className="font-semibold">{level.label}</span>
                  <span className="text-center font-semibold text-amber-600">{level.xp} XP</span>
                  <span className="text-center font-mono">{level.gems} 💎</span>
                  <span className="text-center font-mono">{level.questions}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × accuracy factor × speed factor × attempt factor</p>
            <p className="mt-1 leading-relaxed">Accuracy factor scales with the share of words solved. Finishing under par time adds up to +50%. Fewer wrong attempts keep more of the score (down to 70%). Minimum score: 10 points. Daily challenges use the same formula with today&apos;s shared word set.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type JumbleLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function JumbleBoard({ myProfileId }: { myProfileId?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/jumble-games/leaderboard"],
    queryFn: () => customFetch<JumbleLeaderboardEntry[]>("/api/jumble-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-cyan-200/60 dark:border-cyan-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS.jumble; return <Icon className="h-5 w-5 text-cyan-600" />; })()} Jumble Words — All Levels</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Jumble Words leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><LayoutGrid className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Jumble rounds yet.</p><p className="mt-1 text-sm">Unscramble words to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            return <div key={entry.profileId} className={isMe ? "bg-cyan-50/70 dark:bg-cyan-950/20" : ""}>
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 px-3 py-4 sm:px-5">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-cyan-800 dark:text-cyan-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-cyan-700 dark:text-cyan-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div></div>
              </div>
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <JumbleScoringGuide />
  </div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function LeaderboardScopeLinks({
  active,
}: {
  active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";
}) {
  const [, setLocation] = useLocation();
  const links = ([
    { id: "all", href: "/leaderboard/", label: "All Games", icon: Trophy },
    { id: "sudoku", href: "/leaderboard/sudoku/", label: "Sudoku", icon: GAME_ICONS.sudoku },
    { id: "memory", href: "/leaderboard/memory/", label: "Memory Match", icon: GAME_ICONS.memory },
    { id: "jigsaw", href: "/leaderboard/jigsaw/", label: "Jigsaw", icon: GAME_ICONS.jigsaw },
    { id: "word-search", href: "/leaderboard/word-search/", label: "Word Search", icon: GAME_ICONS["word-search"] },
    { id: "minesweeper", href: "/leaderboard/minesweeper/", label: "Minesweeper", icon: GAME_ICONS.minesweeper },
    { id: "slide-puzzle", href: "/leaderboard/slide-puzzle/", label: "Slide Puzzle", icon: GAME_ICONS["slide-puzzle"] },
    { id: "game-2048", href: "/leaderboard/game-2048/", label: "2048", icon: GAME_ICONS["game-2048"] },
    { id: "jumble", href: "/leaderboard/jumble/", label: "Jumble Words", icon: GAME_ICONS.jumble },
    { id: "odd-images", href: "/leaderboard/odd-images/", label: "Odd Images", icon: GAME_ICONS["odd-images"] },
    { id: "rubiks", href: "/leaderboard/rubiks/", label: "Rubik's Cube", icon: GAME_ICONS.rubiks },
    { id: "science-quiz", href: "/leaderboard/science-quiz/", label: "Science Quiz", icon: GAME_ICONS["science-quiz"] },
    { id: "maths-quiz", href: "/leaderboard/maths-quiz/", label: "Maths Quiz", icon: GAME_ICONS["maths-quiz"] },
    { id: "gk-quiz", href: "/leaderboard/gk-quiz/", label: "GK Quiz", icon: GAME_ICONS["gk-quiz"] },
  ] as const).filter((link) => RUBIKS_VISIBLE || link.id !== "rubiks");
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
              <SelectedIcon className={`h-4 w-4 shrink-0 ${gameIconColor(active)}`} />
              {selected.label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {links.map(({ id, label, icon: Icon }) => (
            <SelectItem key={id} value={id}>
              <span className="flex items-center gap-2">
                <Icon className={`h-4 w-4 shrink-0 ${gameIconColor(id)}`} />
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
  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz",
  { href: string; label: string; ariaLabel: string; icon: typeof Zap; borderClass: string; iconClass: string }
> = {
  sudoku: { href: "/sudoku", label: "Play Sudoku", ariaLabel: "Play Sudoku", icon: GAME_ICONS.sudoku, borderClass: "border-border", iconClass: "text-primary" },
  memory: { href: "/memory/", label: "Play Memory", ariaLabel: "Play Memory Match", icon: GAME_ICONS.memory, borderClass: "border-border", iconClass: "text-primary" },
  jigsaw: { href: "/jigsaw", label: "Play Jigsaw", ariaLabel: "Play Jigsaw", icon: GAME_ICONS.jigsaw, borderClass: "border-border", iconClass: "text-amber-600" },
  "word-search": { href: "/word-search", label: "Word Search", ariaLabel: "Play Word Search", icon: GAME_ICONS["word-search"], borderClass: "border-violet-200 dark:border-violet-800", iconClass: "text-violet-600" },
  minesweeper: { href: "/minesweeper", label: "Minesweeper", ariaLabel: "Play Minesweeper", icon: GAME_ICONS.minesweeper, borderClass: "border-emerald-200 dark:border-emerald-800", iconClass: "text-emerald-600" },
  "slide-puzzle": { href: "/slide-puzzle", label: "Slide Puzzle", ariaLabel: "Play Slide Puzzle", icon: GAME_ICONS["slide-puzzle"], borderClass: "border-sky-200 dark:border-sky-800", iconClass: "text-sky-600" },
  "game-2048": { href: "/game-2048", label: "2048", ariaLabel: "Play 2048", icon: GAME_ICONS["game-2048"], borderClass: "border-orange-200 dark:border-orange-800", iconClass: "text-orange-600" },
  jumble: { href: "/jumble", label: "Jumble Words", ariaLabel: "Play Jumble Words", icon: GAME_ICONS.jumble, borderClass: "border-cyan-200 dark:border-cyan-800", iconClass: "text-cyan-600" },
  "odd-images": { href: "/odd-images", label: "Odd Images", ariaLabel: "Play Odd Images", icon: GAME_ICONS["odd-images"], borderClass: "border-teal-200 dark:border-teal-800", iconClass: "text-teal-600" },
  rubiks: { href: "/rubiks", label: "Rubik's Cube", ariaLabel: "Play Rubik's Cube", icon: GAME_ICONS.rubiks, borderClass: "border-rose-200 dark:border-rose-800", iconClass: "text-rose-600" },
  "science-quiz": { href: "/quiz/science", label: "Science Quiz", ariaLabel: "Play Science Quiz", icon: GAME_ICONS["science-quiz"], borderClass: "border-violet-200 dark:border-violet-800", iconClass: "text-violet-600" },
  "maths-quiz": { href: "/quiz/maths", label: "Maths Quiz", ariaLabel: "Play Maths Quiz", icon: GAME_ICONS["maths-quiz"], borderClass: "border-sky-200 dark:border-sky-800", iconClass: "text-sky-600" },
  "gk-quiz": { href: "/quiz/gk", label: "GK Quiz", ariaLabel: "Play GK Quiz", icon: GAME_ICONS["gk-quiz"], borderClass: "border-amber-200 dark:border-amber-800", iconClass: "text-amber-600" },
};

export default function Leaderboard({
  gamePage: routeGamePage,
}: {
  gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";
} = {}) {
  const search = useSearch();
  const requestedTab = new URLSearchParams(search).get("tab");
  const gamePage =
    routeGamePage ??
    (requestedTab === "sudoku" || requestedTab === "memory" || requestedTab === "jigsaw" || requestedTab === "word-search" || requestedTab === "minesweeper" || requestedTab === "slide-puzzle" || requestedTab === "game-2048" || requestedTab === "jumble" || requestedTab === "odd-images" || requestedTab === "rubiks" || requestedTab === "science-quiz" || requestedTab === "maths-quiz" || requestedTab === "gk-quiz" ? requestedTab : null);
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
                : gamePage === "game-2048"
                  ? "2048 Leaderboard | Play Brain Games . Online"
                : gamePage === "jumble"
                  ? "Jumble Words Leaderboard | Play Brain Games . Online"
                : gamePage === "odd-images"
                  ? "Odd Images Leaderboard | Play Brain Games . Online"
                : gamePage === "rubiks"
                  ? "Rubik's Cube Leaderboard | Play Brain Games . Online"
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
                : gamePage === "game-2048"
                  ? "Compare all-time 2048 points across every board size on Play Brain Games . Online."
                : gamePage === "jumble"
                  ? "Compare all-time Jumble Words points across every level on Play Brain Games . Online."
                : gamePage === "odd-images"
                  ? "Compare all-time Odd Images points across every level on Play Brain Games . Online."
                : gamePage === "rubiks"
                  ? "Compare all-time Rubik's Cube points across every puzzle on Play Brain Games . Online."
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
              : gamePage === "game-2048"
                ? "2048 Leaderboard"
              : gamePage === "jumble"
                ? "Jumble Words Leaderboard"
              : gamePage === "odd-images"
                ? "Odd Images Leaderboard"
              : gamePage === "rubiks"
                ? "Rubik's Cube Leaderboard"
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
              : gamePage === "game-2048"
                ? "All-time points across every 2048 board size."
              : gamePage === "jumble"
                ? "All-time points across every Jumble Words level."
              : gamePage === "odd-images"
                ? "All-time points across every Odd Images level."
              : gamePage === "rubiks"
                ? "All-time points across every Rubik's Cube puzzle."
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
      ) : gamePage === "game-2048" ? (
        <Game2048Board myProfileId={myProfileId} />
      ) : gamePage === "jumble" ? (
        <JumbleBoard myProfileId={myProfileId} />
      ) : gamePage === "odd-images" ? (
        <OddImagesBoard myProfileId={myProfileId} />
      ) : gamePage === "rubiks" ? (
        <RubiksBoard myProfileId={myProfileId} />
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
