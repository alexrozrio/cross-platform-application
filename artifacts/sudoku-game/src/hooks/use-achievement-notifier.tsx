import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { toast } from "sonner";
import { ACHIEVEMENT_META, type AchievementsData } from "@/lib/achievement-utils";

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
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
      // First ever visit for this profile — silently initialize; don't blast historical unlocks
      saveState(profileId, currentUnlocked);
      return;
    }

    // stored.initialized is always true here (it's part of the type)
    const seenSet = new Set<string>(stored.ids);
    const newlyUnlocked = [...currentUnlocked].filter((id) => !seenSet.has(id));

    if (newlyUnlocked.length > 0) {
      // Persist immediately so a fast remount doesn't double-fire
      saveState(profileId, currentUnlocked);

      newlyUnlocked.forEach((id, i) => {
        const meta = ACHIEVEMENT_META.find((a) => a.id === id);
        if (!meta) return;

        const tid = setTimeout(() => {
          toast.custom(
            () => (
              <div className="flex items-center gap-3.5 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-2xl px-4 py-3.5 shadow-xl w-80 pointer-events-auto">
                <div className="text-4xl leading-none select-none">{meta.emoji}</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
                    Achievement Unlocked!
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5 truncate">{meta.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              </div>
            ),
            { duration: 6000, position: "top-center" }
          );
        }, i * 900);

        timeoutIdsRef.current.push(tid);
      });
    }

    // Cleanup: cancel any pending toasts if the component unmounts before they fire
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, [data, profileId]);
}
