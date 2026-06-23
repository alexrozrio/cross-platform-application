import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gem, Flame, Star } from "lucide-react";

interface LoginRewardModalProps {
  open: boolean;
  onClose: () => void;
  gemsAwarded: number;
  loginStreak: number;
  totalGems: number;
}

const MAX_STREAK_DISPLAY = 7;

const DAY_REWARDS = [1, 2, 3, 4, 5, 6, 7];

function streakMessage(streak: number): string {
  if (streak === 1) return "Welcome back!";
  if (streak === 2) return "2 days in a row!";
  if (streak === 3) return "3 days strong!";
  if (streak < 7) return `${streak} days in a row!`;
  return `${streak} day streak! 🔥`;
}

export function LoginRewardModal({ open, onClose, gemsAwarded, loginStreak, totalGems }: LoginRewardModalProps) {
  const displayStreak = Math.min(loginStreak, MAX_STREAK_DISPLAY);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Daily Login Reward</DialogTitle>
        <DialogDescription className="sr-only">You earned gems for logging in today.</DialogDescription>
        <div className="bg-gradient-to-b from-indigo-50 to-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-6 pt-8 pb-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(12)].map((_, i) => (
                <Star
                  key={i}
                  className="absolute"
                  style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: 12, height: 12, opacity: 0.6 }}
                />
              ))}
            </div>
            <div className="relative">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                  <Gem className="w-8 h-8 text-white drop-shadow" />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Daily Reward</h2>
              <p className="text-indigo-100 text-sm mt-1">{streakMessage(loginStreak)}</p>
            </div>
          </div>

          {/* Gems awarded */}
          <div className="px-6 -mt-6">
            <div className="bg-white rounded-xl shadow-md border border-indigo-100 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Gem className="w-5 h-5 text-cyan-500" />
                <span className="text-3xl font-bold text-indigo-700">+{gemsAwarded}</span>
                <span className="text-muted-foreground font-medium">gems</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total balance: <span className="font-semibold text-foreground">{totalGems} gems</span>
              </p>
            </div>
          </div>

          {/* Streak progress */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Login Streak
              </span>
              <span className="text-xs font-bold text-orange-500">{loginStreak} day{loginStreak !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAY_REWARDS.map((gems, i) => {
                const dayNum = i + 1;
                const isCompleted = dayNum < displayStreak;
                const isCurrent = dayNum === displayStreak;
                const isFuture = dayNum > displayStreak;
                return (
                  <div key={dayNum} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                        isCompleted
                          ? "bg-indigo-500 text-white"
                          : isCurrent
                          ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white ring-2 ring-indigo-300 scale-110 shadow-md"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isFuture ? (
                        <Gem className="w-3 h-3 opacity-40" />
                      ) : (
                        <Gem className={`w-3 h-3 ${isCompleted || isCurrent ? "text-cyan-200" : ""}`} />
                      )}
                    </div>
                    <span className={`text-[9px] font-medium ${isCurrent ? "text-indigo-600" : "text-muted-foreground"}`}>
                      {dayNum === 7 ? "7+" : `Day ${dayNum}`}
                    </span>
                    <span className={`text-[9px] ${isCurrent ? "text-indigo-500 font-bold" : "text-muted-foreground"}`}>
                      +{gems}💎
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Log in every day to earn more gems. Missing a day resets your streak.
            </p>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 pt-2">
            <Button onClick={onClose} className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold rounded-xl h-11">
              Collect & Play!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
