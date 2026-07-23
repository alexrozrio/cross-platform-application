import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gem, Flame } from "lucide-react";
import { LOGIN_REWARD_TIERS, tierIndexForStreak } from "@/config/login-rewards";

interface LoginRewardModalProps {
  open: boolean;
  onClose: () => void;
  gemsAwarded: number;
  loginStreak: number;
  totalGems: number;
}

function streakMessage(streak: number): string {
  if (streak === 1) return "Welcome back!";
  if (streak < 8) return `${streak} days in a row!`;
  if (streak < 15) return `${streak} days strong! 🔥`;
  if (streak < 22) return `${streak} day streak! Incredible!`;
  return `${streak} day streak! You're unstoppable! 🔥`;
}

export function LoginRewardModal({ open, onClose, gemsAwarded, loginStreak, totalGems }: LoginRewardModalProps) {
  const currentTierIndex = tierIndexForStreak(loginStreak);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-card">
        <DialogTitle className="sr-only">Daily Login Reward</DialogTitle>
        <DialogDescription className="sr-only">You earned gems for logging in today.</DialogDescription>

        {/* Header banner */}
        <div className="bg-primary px-6 pt-8 pb-10 text-center text-primary-foreground relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none select-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 80%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center ring-4 ring-primary-foreground/30">
                <Gem className="w-8 h-8 text-primary-foreground drop-shadow" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Daily Reward</h2>
            <p className="text-primary-foreground/70 text-sm mt-1">{streakMessage(loginStreak)}</p>
          </div>
        </div>

        {/* Gems awarded card */}
        <div className="px-6 -mt-6">
          <div className="bg-card rounded-xl shadow-md border border-border p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Gem className="w-5 h-5 text-cyan-500" />
              <span className="text-3xl font-bold text-primary">+{gemsAwarded}</span>
              <span className="text-muted-foreground font-medium">gems</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total balance:{" "}
              <span className="font-semibold text-foreground">{totalGems} gems</span>
            </p>
          </div>
        </div>

        {/* Tier tracker */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Login Streak
            </span>
            <span className="text-xs font-bold text-orange-500">
              {loginStreak} day{loginStreak !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex gap-1.5">
            {LOGIN_REWARD_TIERS.map((tier, i) => {
              const isCompleted = i < currentTierIndex;
              const isCurrent = i === currentTierIndex;
              return (
                <div
                  key={tier.label}
                  className={`flex-1 rounded-lg p-1.5 flex flex-col items-center gap-0.5 transition-all ${
                    isCompleted
                      ? "bg-primary/80 text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/50 scale-105 shadow-md"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Gem
                    className={`w-3.5 h-3.5 ${
                      isCompleted || isCurrent ? "text-primary-foreground/90" : "opacity-30"
                    }`}
                  />
                  <span className="text-[9px] font-bold leading-none">+{tier.gems}💎</span>
                  <span className="text-[8px] leading-none opacity-80 text-center">{tier.label}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-3">
            Log in every day to earn more gems. Missing a day resets your streak to Day 1.
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2">
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11"
          >
            Collect & Play!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
