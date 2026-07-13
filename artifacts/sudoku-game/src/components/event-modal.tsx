import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trophy, Handshake, Swords, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Star, CalendarDays, Calendar, Gem,
} from "lucide-react";
import {
  subscribeEventModal, dismissEventModal,
  type EventModalPayload,
} from "@/hooks/use-event-modal";

// ── Visual config per event type ──────────────────────────────────────────────

interface ModalConfig {
  icon: React.ReactNode;
  iconBg: string;
  headline: (p: EventModalPayload) => string;
  body: (p: EventModalPayload) => string;
  primaryLabel?: string;
  primaryHref?: (p: EventModalPayload) => string;
  secondaryLabel?: string;
  autoDismiss?: number; // ms
}

const CONFIGS: Record<EventModalPayload["type"], ModalConfig> = {
  challenge_received: {
    icon: <Swords className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-700",
    headline: (p) =>
      p.type === "challenge_received" ? `${p.challengerName} challenged you!` : "",
    body: () => "Beat their score to win 10 gems. Accept before time runs out!",
    primaryLabel: "Go to Challenges",
    primaryHref: () => "/challenges",
    secondaryLabel: "Later",
  },
  challenge_accepted: {
    icon: <CheckCircle2 className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-600",
    headline: (p) =>
      p.type === "challenge_accepted" ? `${p.opponentName} accepted!` : "",
    body: () =>
      "They're playing now. Finish your game to find out who wins!",
    primaryLabel: "View Challenge",
    primaryHref: () => "/challenges",
    secondaryLabel: "Dismiss",
    autoDismiss: 8000,
  },
  challenge_declined: {
    icon: <XCircle className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-slate-400 to-slate-600",
    headline: (p) =>
      p.type === "challenge_declined" ? `${p.opponentName} declined` : "",
    body: () => "No worries — you can challenge someone else anytime.",
    primaryLabel: "Find Opponents",
    primaryHref: () => "/challenges",
    secondaryLabel: "Dismiss",
    autoDismiss: 8000,
  },
  challenge_won: {
    icon: <Trophy className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-600",
    headline: (p) =>
      p.type === "challenge_won" ? `You beat ${p.opponentName}!` : "",
    body: (p) =>
      p.type === "challenge_won"
        ? `Congratulations! You won the challenge${p.gems ? ` and earned +${p.gems} 💎` : ""}!`
        : "",
    primaryLabel: "View Results",
    primaryHref: () => "/challenges",
    secondaryLabel: "Dismiss",
    autoDismiss: 12000,
  },
  challenge_tied: {
    icon: <Handshake className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
    headline: (p) =>
      p.type === "challenge_tied" ? `It's a tie with ${p.opponentName}!` : "",
    body: () => "You matched each other's score perfectly — well played!",
    primaryLabel: "View Results",
    primaryHref: () => "/challenges",
    secondaryLabel: "Dismiss",
    autoDismiss: 8000,
  },
  challenge_lost: {
    icon: <Swords className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-rose-400 to-red-600",
    headline: (p) =>
      p.type === "challenge_lost" ? `${p.opponentName} beat you this time` : "",
    body: () => "Don't give up — challenge them again and turn it around!",
    primaryLabel: "Rematch",
    primaryHref: () => "/challenges",
    secondaryLabel: "Dismiss",
    autoDismiss: 10000,
  },
  tournament_rank_up: {
    icon: <TrendingUp className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-600",
    headline: (p) =>
      p.type === "tournament_rank_up"
        ? `You climbed ${p.delta} spot${p.delta !== 1 ? "s" : ""}! 🎉`
        : "",
    body: (p) => {
      if (p.type !== "tournament_rank_up") return "";
      const label = p.period === "weekly" ? "weekly" : "monthly";
      return `Now ranked #${p.newRank} on the ${label} tournament. Keep it up!`;
    },
    primaryLabel: "View Leaderboard",
    primaryHref: () => "/leaderboard",
    secondaryLabel: "Dismiss",
    autoDismiss: 7000,
  },
  tournament_rank_down: {
    icon: <TrendingDown className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-slate-400 to-slate-600",
    headline: (p) =>
      p.type === "tournament_rank_down"
        ? `You dropped ${Math.abs(p.delta)} spot${Math.abs(p.delta) !== 1 ? "s" : ""}`
        : "",
    body: (p) => {
      if (p.type !== "tournament_rank_down") return "";
      const label = p.period === "weekly" ? "weekly" : "monthly";
      return `Now ranked #${p.newRank} on the ${label} tournament. Play more to climb back!`;
    },
    primaryLabel: "View Leaderboard",
    primaryHref: () => "/leaderboard",
    secondaryLabel: "Dismiss",
    autoDismiss: 6000,
  },
  memory_challenge_bonus: {
    icon: <Star className="w-10 h-10 text-white" />,
    iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
    headline: () => "Challenge bonus claimed!",
    body: (p) =>
      p.type === "memory_challenge_bonus"
        ? `You earned +${p.xp} XP and +${p.gems} 💎 for completing the challenge.`
        : "",
    secondaryLabel: "Nice!",
    autoDismiss: 6000,
  },
};

// ── Progress bar for auto-dismiss ─────────────────────────────────────────────

function AutoDismissBar({ ms }: { ms: number }) {
  const [pct, setPct] = useState(100);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      setPct(Math.max(0, 100 - (elapsed / ms) * 100));
    }, 50);
    return () => clearInterval(id);
  }, [ms]);
  return (
    <div className="h-1 w-full bg-foreground/10 rounded-full overflow-hidden mt-4">
      <div
        className="h-full bg-primary/50 transition-all duration-75 ease-linear rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────

export function EventModal() {
  const [payload, setPayload] = useState<EventModalPayload | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => subscribeEventModal(setPayload), []);

  // Auto-dismiss
  useEffect(() => {
    if (!payload) return;
    const cfg = CONFIGS[payload.type];
    if (!cfg.autoDismiss) return;
    const id = setTimeout(dismissEventModal, cfg.autoDismiss);
    return () => clearTimeout(id);
  }, [payload]);

  if (!payload) return null;
  const cfg = CONFIGS[payload.type];

  const handlePrimary = () => {
    dismissEventModal();
    if (cfg.primaryHref) setLocation(cfg.primaryHref(payload));
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) dismissEventModal(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0 shadow-2xl gap-0">
        {/* Coloured hero band */}
        <div className={`${cfg.iconBg} flex flex-col items-center justify-center gap-3 py-10 px-6`}>
          <div className="rounded-full bg-white/20 p-4 ring-4 ring-white/30 shadow-lg">
            {cfg.icon}
          </div>
          <h2 className="text-xl font-bold text-white text-center leading-snug drop-shadow">
            {cfg.headline(payload)}
          </h2>
        </div>

        {/* Body */}
        <div className="bg-background px-6 pt-5 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {cfg.body(payload)}
          </p>

          <div className="flex flex-col gap-2">
            {cfg.primaryLabel && (
              <Button className="w-full" onClick={handlePrimary}>
                {cfg.primaryLabel}
              </Button>
            )}
            {cfg.secondaryLabel && (
              <Button variant="ghost" className="w-full" onClick={dismissEventModal}>
                {cfg.secondaryLabel}
              </Button>
            )}
          </div>

          {cfg.autoDismiss && <AutoDismissBar ms={cfg.autoDismiss} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
