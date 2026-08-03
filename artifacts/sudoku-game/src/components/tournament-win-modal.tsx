import React from "react";
import { Confetti } from "@/components/confetti";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface BadgeRow {
  id: number;
  badgeType: string;
  tournamentPeriod: string;
  totalPoints: number;
  awardedAt: string;
}

const PLACE_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  weekly_1st:  { emoji: "🥇", label: "1st Place", color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40",  border: "border-amber-300 dark:border-amber-700" },
  weekly_2nd:  { emoji: "🥈", label: "2nd Place", color: "text-slate-500 dark:text-slate-300",   bg: "bg-slate-50 dark:bg-slate-900/40",   border: "border-slate-300 dark:border-slate-600" },
  weekly_3rd:  { emoji: "🥉", label: "3rd Place", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-300 dark:border-orange-700" },
  monthly_1st: { emoji: "🥇", label: "1st Place", color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40",  border: "border-amber-300 dark:border-amber-700" },
  monthly_2nd: { emoji: "🥈", label: "2nd Place", color: "text-slate-500 dark:text-slate-300",   bg: "bg-slate-50 dark:bg-slate-900/40",   border: "border-slate-300 dark:border-slate-600" },
  monthly_3rd: { emoji: "🥉", label: "3rd Place", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-300 dark:border-orange-700" },
};

const GEM_REWARDS: Record<string, number> = {
  weekly_1st: 20, weekly_2nd: 10, weekly_3rd: 5,
  monthly_1st: 50, monthly_2nd: 30, monthly_3rd: 15,
};

function formatPeriod(period: string): string {
  if (period.includes("-W")) {
    const [yearStr, weekStr] = period.split("-W");
    return `Week ${parseInt(weekStr)}, ${yearStr}`;
  }
  const [yearStr, monthStr] = period.split("-");
  const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

interface Props {
  badges: BadgeRow[];
  onDismiss: (id: number) => void;
}

export function TournamentWinModal({ badges, onDismiss }: Props) {
  const [, setLocation] = useLocation();

  if (badges.length === 0) return null;

  const badge = badges[0]; // show one at a time
  const isMonthly = badge.badgeType.startsWith("monthly");
  const cfg = PLACE_CONFIG[badge.badgeType] ?? {
    emoji: "🏆", label: "Top Finish",
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
  };
  const gems = GEM_REWARDS[badge.badgeType] ?? 0;
  const period = formatPeriod(badge.tournamentPeriod);
  const remaining = badges.length - 1;

  return (
    <>
      {/* Confetti rains above everything */}
      <Confetti count={120} />

      {/* Modal backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative w-full max-w-sm bg-card border-2 border-primary/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

          {/* Top decorative band */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-primary to-violet-500" />

          <div className="p-6 space-y-5 text-center">

            {/* Big medal */}
            <div className="flex justify-center">
              <span className="text-8xl leading-none drop-shadow-lg select-none" role="img" aria-label={cfg.label}>
                {cfg.emoji}
              </span>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {isMonthly ? "Monthly Tournament" : "Weekly Tournament"}
              </p>
              <h2 className="text-3xl font-serif font-bold tracking-tight">
                You Won! 🎉
              </h2>
              <p className="text-sm text-muted-foreground">{period}</p>
            </div>

            {/* Place badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-lg ${cfg.color} ${cfg.bg} ${cfg.border}`}>
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </div>

            {/* Gems row */}
            {gems > 0 && (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 px-5 py-3">
                <Gem className="w-5 h-5 text-cyan-500 shrink-0" />
                <span className="text-base font-bold text-cyan-700 dark:text-cyan-300">
                  +{gems} gems awarded!
                </span>
              </div>
            )}

            {/* Total points */}
            <p className="text-sm text-muted-foreground">
              Total score: <span className="font-semibold text-foreground">{badge.totalPoints.toLocaleString()} pts</span>
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <Button
                className="w-full text-base font-bold py-5 gap-2"
                onClick={() => onDismiss(badge.id)}
              >
                Claim your glory! 🎊
              </Button>
              <button
                onClick={() => { onDismiss(badge.id); setLocation("/profile"); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                View badge on profile
              </button>
            </div>

            {/* More wins pending */}
            {remaining > 0 && (
              <p className="text-xs text-muted-foreground">
                +{remaining} more win{remaining > 1 ? "s" : ""} waiting…
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
