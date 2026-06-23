export interface LevelTier {
  name: string;
  minXp: number;
  color: string;
  textColor: string;
  ring: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  { name: "Iron",        minXp: 0,      color: "#6B7280", textColor: "#fff", ring: "#9CA3AF" },
  { name: "Bronze",      minXp: 50,     color: "#92400E", textColor: "#fff", ring: "#B45309" },
  { name: "Silver",      minXp: 150,    color: "#64748B", textColor: "#fff", ring: "#94A3B8" },
  { name: "Gold",        minXp: 300,    color: "#D97706", textColor: "#fff", ring: "#FBBF24" },
  { name: "Ruby",        minXp: 500,    color: "#BE123C", textColor: "#fff", ring: "#FB7185" },
  { name: "Sapphire",    minXp: 800,    color: "#1D4ED8", textColor: "#fff", ring: "#60A5FA" },
  { name: "Emerald",     minXp: 1200,   color: "#065F46", textColor: "#fff", ring: "#34D399" },
  { name: "Platinum",    minXp: 1800,   color: "#475569", textColor: "#fff", ring: "#CBD5E1" },
  { name: "Diamond",     minXp: 2500,   color: "#0E7490", textColor: "#fff", ring: "#67E8F9" },
  { name: "Champion",    minXp: 3500,   color: "#EA580C", textColor: "#fff", ring: "#FB923C" },
  { name: "Titan",       minXp: 5000,   color: "#7C3AED", textColor: "#fff", ring: "#A78BFA" },
  { name: "Master",      minXp: 7000,   color: "#DC2626", textColor: "#fff", ring: "#F87171" },
  { name: "Grandmaster", minXp: 10000,  color: "#DB2777", textColor: "#fff", ring: "#F472B6" },
  { name: "Legend",      minXp: 14000,  color: "#B45309", textColor: "#fff", ring: "#FDE68A" },
  { name: "Mythic",      minXp: 20000,  color: "#6D28D9", textColor: "#fff", ring: "#C4B5FD" },
  { name: "Immortal",    minXp: 28000,  color: "#B91C1C", textColor: "#fff", ring: "#FCA5A5" },
];

export function getLevelFromXp(xp: number): LevelTier & { index: number; nextTier: LevelTier | null; progress: number } {
  let tier = LEVEL_TIERS[0];
  let index = 0;
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      tier = LEVEL_TIERS[i];
      index = i;
      break;
    }
  }
  const nextTier = index < LEVEL_TIERS.length - 1 ? LEVEL_TIERS[index + 1] : null;
  const progress = nextTier
    ? Math.min(100, Math.round(((xp - tier.minXp) / (nextTier.minXp - tier.minXp)) * 100))
    : 100;
  return { ...tier, index, nextTier, progress };
}
