import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { ACHIEVEMENT_META, type AchievementsData, type AchievementMeta } from "@/lib/achievement-utils";

interface StoredState {
  initialized: true;
  ids: string[];
}

const storageKey = (profileId: number) => `achievements_seen_v2_${profileId}`;

function loadState(profileId: number): StoredState | null {
  try {
    const raw = localStorage.getItem(storageKey(profileId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

function saveState(profileId: number, ids: Set<string>) {
  try {
    const state: StoredState = { initialized: true, ids: [...ids] };
    localStorage.setItem(storageKey(profileId), JSON.stringify(state));
  } catch { /* ignore */ }
}

export function useAchievementNotifier(profileId: number | null) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementMeta[]>([]);

  const { data } = useQuery<AchievementsData>({
    queryKey: [`/api/achievements/${profileId}`],
    queryFn: () => customFetch<AchievementsData>(`/api/achievements/${profileId}`),
    enabled: !!profileId,
  });

  useEffect(() => {
    if (!data || !profileId) return;

    const currentUnlocked = new Set(
      (Object.entries(data) as [string, { unlocked: boolean }][])
        .filter(([, v]) => v.unlocked)
        .map(([k]) => k)
    );

    const stored = loadState(profileId);

    if (!stored) {
      // First ever visit — silently initialize; don't blast all historical achievements
      saveState(profileId, currentUnlocked);
      return;
    }

    const seenSet = new Set<string>(stored.ids);
    const newIds = [...currentUnlocked].filter((id) => !seenSet.has(id));

    if (newIds.length > 0) {
      // Persist immediately so a fast remount can't double-fire
      saveState(profileId, currentUnlocked);

      const metas = newIds
        .map((id) => ACHIEVEMENT_META.find((a) => a.id === id))
        .filter((m): m is AchievementMeta => Boolean(m));

      if (metas.length > 0) {
        setNewlyUnlocked(metas);
      }
    }
  }, [data, profileId]);

  const dismiss = useCallback(() => setNewlyUnlocked([]), []);

  return { newlyUnlocked, dismiss };
}
