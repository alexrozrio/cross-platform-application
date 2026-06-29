import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { customFetch } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface BadgeRow {
  id: number;
  badgeType: string;
  tournamentPeriod: string;
  totalPoints: number;
  awardedAt: string;
}

const PLACE_EMOJI: Record<string, string> = {
  weekly_1st: "🥇",
  weekly_2nd: "🥈",
  weekly_3rd: "🥉",
  monthly_1st: "🥇",
  monthly_2nd: "🥈",
  monthly_3rd: "🥉",
};

const PLACE_LABEL: Record<string, string> = {
  weekly_1st: "1st place",
  weekly_2nd: "2nd place",
  weekly_3rd: "3rd place",
  monthly_1st: "1st place",
  monthly_2nd: "2nd place",
  monthly_3rd: "3rd place",
};

const GEM_REWARDS: Record<string, number> = {
  weekly_1st: 20,
  weekly_2nd: 10,
  weekly_3rd: 5,
  monthly_1st: 50,
  monthly_2nd: 30,
  monthly_3rd: 15,
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

const storageKey = (profileId: number) => `seen_badge_ids_v1_${profileId}`;

function loadSeenIds(profileId: number): Set<number> {
  try {
    const raw = localStorage.getItem(storageKey(profileId));
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenIds(profileId: number, ids: Set<number>) {
  try {
    localStorage.setItem(storageKey(profileId), JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export function useBadgeNotifier(profileId: number | null) {
  const initialized = React.useRef(false);
  const [, setLocation] = useLocation();

  const { data } = useQuery<BadgeRow[]>({
    queryKey: [`/api/badges/${profileId}`],
    queryFn: () => customFetch<BadgeRow[]>(`/api/badges/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 5 * 60 * 1000, // every 5 minutes
    staleTime: 4 * 60 * 1000,
  });

  React.useEffect(() => {
    if (!data || !profileId) return;

    const seenIds = loadSeenIds(profileId);

    if (!initialized.current) {
      // First load — silently mark all existing badges as seen
      data.forEach((b) => seenIds.add(b.id));
      saveSeenIds(profileId, seenIds);
      initialized.current = true;
      return;
    }

    const newBadges = data.filter((b) => !seenIds.has(b.id));
    if (newBadges.length === 0) return;

    newBadges.forEach((b) => seenIds.add(b.id));
    saveSeenIds(profileId, seenIds);

    newBadges.forEach((b) => {
      const emoji = PLACE_EMOJI[b.badgeType] ?? "🏆";
      const place = PLACE_LABEL[b.badgeType] ?? "Top finish";
      const period = formatPeriod(b.tournamentPeriod);
      const gems = GEM_REWARDS[b.badgeType] ?? 0;
      const isMonthly = b.badgeType.startsWith("monthly");

      toast(`${emoji} Tournament win! ${place}`, {
        description: `You finished ${place} in the ${isMonthly ? "monthly" : "weekly"} tournament for ${period}.${gems > 0 ? ` +${gems} gems awarded!` : ""}`,
        duration: 12000,
        action: {
          label: "View profile",
          onClick: () => setLocation("/profile"),
        },
      });
    });
  }, [data, profileId, setLocation]);
}
