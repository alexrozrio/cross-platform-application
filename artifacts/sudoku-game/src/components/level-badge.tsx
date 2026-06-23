import React, { useState } from "react";
import { getLevelFromXp, LEVEL_TIERS } from "@/lib/levels";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LevelBadgeProps {
  xp: number;
  size?: "xs" | "sm" | "md";
  showProgress?: boolean;
}

export function LevelBadge({ xp, size = "sm", showProgress = false }: LevelBadgeProps) {
  const level = getLevelFromXp(xp);

  const fontSize = size === "xs" ? "9px" : size === "sm" ? "10px" : "12px";
  const px = size === "xs" ? "6px" : size === "sm" ? "7px" : "9px";
  const py = size === "xs" ? "1px" : size === "sm" ? "2px" : "3px";

  return (
    <span className="inline-flex flex-col gap-1">
      <span
        className="inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide shrink-0"
        style={{
          backgroundColor: level.color,
          color: level.textColor,
          fontSize,
          paddingLeft: px,
          paddingRight: px,
          paddingTop: py,
          paddingBottom: py,
          boxShadow: `0 0 0 1.5px ${level.ring}`,
        }}
      >
        {level.name}
      </span>
      {showProgress && level.nextTier && (
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 rounded-full overflow-hidden flex-1"
            style={{ backgroundColor: `${level.color}33` }}
          >
            <span
              className="h-full rounded-full block transition-all"
              style={{ width: `${level.progress}%`, backgroundColor: level.color }}
            />
          </span>
          <span className="text-[9px] text-muted-foreground tabular-nums whitespace-nowrap">
            {xp} / {level.nextTier.minXp} XP
          </span>
        </span>
      )}
    </span>
  );
}

interface LevelCardProps {
  xp: number;
}

export function LevelCard({ xp }: LevelCardProps) {
  const level = getLevelFromXp(xp);
  const nextMinXp = level.nextTier?.minXp ?? level.minXp;
  const xpInTier = xp - level.minXp;
  const xpNeeded = nextMinXp - level.minXp;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: `linear-gradient(135deg, ${level.color}22 0%, ${level.ring}11 100%)`,
        border: `1.5px solid ${level.ring}55`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
            style={{ backgroundColor: level.color, color: level.textColor, boxShadow: `0 0 0 3px ${level.ring}` }}
          >
            {level.index + 1}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Rank</p>
            <p className="text-xl font-black" style={{ color: level.color }}>{level.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tabular-nums" style={{ color: level.color }}>{xp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">total XP</p>
        </div>
      </div>

      {level.nextTier ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress to <span className="font-semibold" style={{ color: level.nextTier.color }}>{level.nextTier.name}</span></span>
            <span className="tabular-nums">{xpInTier} / {xpNeeded} XP</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${level.color}22` }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${level.progress}%`, backgroundColor: level.color }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-center font-semibold" style={{ color: level.color }}>🏆 Max Rank Achieved!</p>
      )}

      <div className="grid grid-cols-8 gap-1 mt-1">
        {LEVEL_TIERS.map((t, i) => (
          <div
            key={t.name}
            title={t.name}
            className="h-1.5 rounded-full"
            style={{
              backgroundColor: i <= level.index ? t.color : `${t.color}33`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const XP_LABELS: Record<string, string> = {
  easy: "1 XP",
  medium: "2 XP",
  hard: "3 XP",
  expert: "5 XP",
};

export function RankGuide({ currentXp }: { currentXp?: number }) {
  const [open, setOpen] = useState(false);
  const currentLevel = currentXp !== undefined ? getLevelFromXp(currentXp) : null;

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <div>
          <p className="font-semibold text-sm">Rank System</p>
          <p className="text-xs text-muted-foreground mt-0.5">16 ranks · earn XP by completing puzzles</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border">
          {/* XP earning guide */}
          <div className="px-5 py-4 bg-muted/20 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">XP earned per completed game</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(XP_LABELS).map(([diff, label]) => (
                <div key={diff} className="text-center">
                  <div className={`text-xs font-bold rounded-full px-2 py-1 mb-1 capitalize ${
                    diff === "easy" ? "bg-green-100 text-green-700" :
                    diff === "medium" ? "bg-yellow-100 text-yellow-700" :
                    diff === "hard" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>{diff}</div>
                  <p className="text-xs font-bold text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All tiers */}
          <div className="divide-y divide-border">
            {LEVEL_TIERS.map((tier, i) => {
              const isCurrentTier = currentLevel?.name === tier.name;
              const isUnlocked = currentXp !== undefined && currentXp >= tier.minXp;
              const nextTier = LEVEL_TIERS[i + 1];

              return (
                <div
                  key={tier.name}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors ${isCurrentTier ? "bg-muted/50" : ""}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                    style={{
                      backgroundColor: isUnlocked ? tier.color : `${tier.color}33`,
                      color: isUnlocked ? tier.textColor : tier.color,
                      boxShadow: isCurrentTier ? `0 0 0 2px ${tier.ring}` : undefined,
                      opacity: isUnlocked ? 1 : 0.6,
                    }}
                  >
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: isUnlocked ? tier.color : undefined }}
                      >
                        {tier.name}
                      </span>
                      {isCurrentTier && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                          style={{ backgroundColor: tier.color, color: tier.textColor }}
                        >
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {nextTier
                        ? `${tier.minXp.toLocaleString()} – ${(nextTier.minXp - 1).toLocaleString()} XP`
                        : `${tier.minXp.toLocaleString()}+ XP`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold tabular-nums" style={{ color: tier.color }}>
                      {tier.minXp === 0 ? "Start" : `${tier.minXp.toLocaleString()} XP`}
                    </p>
                    {isCurrentTier && currentXp !== undefined && nextTier && (
                      <p className="text-[10px] text-muted-foreground">
                        {(nextTier.minXp - currentXp).toLocaleString()} to go
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
