import React from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export interface BadgeRow {
  id: number;
  badgeType: string;
  tournamentPeriod: string;
  totalPoints: number;
  awardedAt: string;
}

// v2 key — tracks badges that were actually shown in the celebration modal.
// The old v1 key was used by the previous "silent mark on first load" logic
// and is intentionally NOT read here, so recent wins that were silently
// swallowed still surface correctly on the next app open.
const modalKey = (profileId: number) => `modal_shown_badge_ids_v2_${profileId}`;

// Only surface badges awarded within this window — avoids re-notifying
// about wins from many months ago for users upgrading from the old code.
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function loadShownIds(profileId: number): Set<number> {
  try {
    const raw = localStorage.getItem(modalKey(profileId));
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveShownIds(profileId: number, ids: Set<number>) {
  try {
    localStorage.setItem(modalKey(profileId), JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export function useBadgeNotifier(profileId: number | null) {
  const [pendingBadges, setPendingBadges] = React.useState<BadgeRow[]>([]);

  const { data } = useQuery<BadgeRow[]>({
    queryKey: [`/api/badges/${profileId}`],
    queryFn: () => customFetch<BadgeRow[]>(`/api/badges/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });

  React.useEffect(() => {
    if (!data || !profileId) return;

    const shownIds = loadShownIds(profileId);
    const cutoff = Date.now() - MAX_AGE_MS;

    // Surface badges that: (a) haven't been shown yet in the modal AND
    // (b) were awarded recently (within 90 days).
    const newBadges = data.filter((b) => {
      if (shownIds.has(b.id)) return false;
      const awardedAt = new Date(b.awardedAt).getTime();
      return awardedAt >= cutoff;
    });

    if (newBadges.length === 0) return;

    // Mark them shown immediately so they don't re-fire on the next poll.
    newBadges.forEach((b) => shownIds.add(b.id));
    saveShownIds(profileId, shownIds);

    setPendingBadges((prev) => [...prev, ...newBadges]);
  }, [data, profileId]);

  const dismissBadge = React.useCallback((id: number) => {
    setPendingBadges((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { pendingBadges, dismissBadge };
}
