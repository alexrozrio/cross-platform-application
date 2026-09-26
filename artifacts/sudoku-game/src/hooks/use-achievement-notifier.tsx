import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { ACHIEVEMENT_META, type AchievementsData, type AchievementMeta } from "@/lib/achievement-utils";
import { ACHIEVEMENT_COMPLETION_EVENT } from "@/lib/achievement-events";

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
  const completionPendingRef = useRef(false);

  const { data, refetch } = useQuery<AchievementsData>({
    queryKey: [`/api/achievements/${profileId}`],
    queryFn: () => customFetch<AchievementsData>(`/api/achievements/${profileId}`),
    enabled: !!profileId,
  });

  useEffect(() => {
    if (!profileId) return;

    const handleGameCompleted = (event: Event) => {
      const completedProfileId = (event as CustomEvent<{ profileId?: number }>).detail?.profileId;
      if (completedProfileId !== undefined && completedProfileId !== profileId) return;

      // A completion can happen before the initial achievements request
      // resolves. Keep this flag so that response is treated as the
      // post-completion state rather than silently becoming the baseline.
      completionPendingRef.current = true;
      void refetch();
    };

    window.addEventListener(ACHIEVEMENT_COMPLETION_EVENT, handleGameCompleted);
    return () => window.removeEventListener(ACHIEVEMENT_COMPLETION_EVENT, handleGameCompleted);
  }, [profileId, refetch]);

  useEffect(() => {
    if (!data || !profileId) return;

    const currentUnlocked = new Set(
      (Object.entries(data) as [string, { unlocked: boolean }][])
        .filter(([, v]) => v.unlocked)
        .map(([k]) => k)
    );

    const stored = loadState(profileId);
    const completionPending = completionPendingRef.current;

    if (!stored) {
      // First ever visit is normally silent so historical achievements are not
      // replayed. If a completion happened before the first response arrived,
      // these are the achievements unlocked by that completion.
      saveState(profileId, currentUnlocked);
      if (completionPending) {
        const metas = [...currentUnlocked]
          .map((id) => ACHIEVEMENT_META.find((a) => a.id === id))
          .filter((m): m is AchievementMeta => Boolean(m));
        if (metas.length > 0) setNewlyUnlocked(metas);
      }
      completionPendingRef.current = false;
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
    completionPendingRef.current = false;
  }, [data, profileId]);

  const dismiss = useCallback(() => setNewlyUnlocked([]), []);

  return { newlyUnlocked, dismiss };
}
