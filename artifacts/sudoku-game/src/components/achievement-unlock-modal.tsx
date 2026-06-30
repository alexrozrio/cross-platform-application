import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useLocation } from "wouter";
import { type AchievementMeta } from "@/lib/achievement-utils";
import { ShareAchievementButton } from "@/components/share-achievement";

interface AchievementUnlockModalProps {
  achievements: AchievementMeta[];
  onDismiss: () => void;
}

export function AchievementUnlockModal({ achievements, onDismiss }: AchievementUnlockModalProps) {
  const [, setLocation] = useLocation();

  if (achievements.length === 0) return null;

  // Determine which stats tab to deep-link to based on the game type of new achievements
  const games = new Set(achievements.map((a) => a.game));
  const statsTab = games.size === 1 && games.has("memory") ? "memory" : "sudoku";

  const handleViewStats = () => {
    onDismiss();
    setLocation(`/stats?tab=${statsTab}`);
  };

  const isSingle = achievements.length === 1;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onDismiss(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-card">
        <DialogTitle className="sr-only">
          {isSingle ? "Achievement Unlocked" : "Achievements Unlocked"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          You have unlocked {isSingle ? "a new achievement" : `${achievements.length} new achievements`}.
        </DialogDescription>

        {/* Golden header */}
        <div className="relative bg-gradient-to-br from-yellow-400 to-amber-500 px-6 pt-8 pb-10 text-center overflow-hidden">
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                <Trophy className="w-8 h-8 text-white drop-shadow" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isSingle ? "Achievement Unlocked!" : `${achievements.length} Achievements Unlocked!`}
            </h2>
            <p className="text-white/75 text-sm mt-1">
              {isSingle ? "You've reached a new milestone!" : "You've reached multiple milestones!"}
            </p>
          </div>
        </div>

        {/* Achievement cards — float over header */}
        <div className="px-5 -mt-6 space-y-2 max-h-72 overflow-y-auto">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="bg-card rounded-xl shadow-md border border-border/60 p-4 flex items-center gap-3"
            >
              <div className="text-3xl leading-none shrink-0">{a.emoji}</div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{a.description}</p>
              </div>
              <div className="shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  {a.game === "memory" ? "Memory" : "Sudoku"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 pt-4 flex flex-col gap-2">
          <Button
            onClick={handleViewStats}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl h-11"
          >
            View Achievements →
          </Button>
          {achievements.length === 1 && (
            <ShareAchievementButton achievement={achievements[0]} variant="full" />
          )}
          {achievements.length > 1 && (
            <div className="flex flex-col gap-1.5">
              {achievements.map((a) => (
                <ShareAchievementButton key={a.id} achievement={a} variant="full" />
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            onClick={onDismiss}
            className="w-full rounded-xl h-10 text-muted-foreground"
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
