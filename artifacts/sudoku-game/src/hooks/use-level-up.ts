import { useEffect, useRef } from "react";
import { useGetProfile } from "@workspace/api-client-react";
import { getLevelFromXp } from "@/lib/levels";
import { showEventModal } from "@/hooks/use-event-modal";

export function useLevelUpWatcher(profileId: number | null) {
  const { data: profile } = useGetProfile(profileId as number);

  const prevTierRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!profile) return;
    const xp = profile.xp ?? 0;
    const level = getLevelFromXp(xp);

    if (!initializedRef.current) {
      prevTierRef.current = level.name;
      initializedRef.current = true;
      return;
    }

    if (prevTierRef.current && prevTierRef.current !== level.name) {
      showEventModal({
        type: "rank_up",
        previousRank: prevTierRef.current,
        newRank: level.name,
        newRankColor: level.color,
        newRankRing: level.ring,
        nextGoalName: level.nextTier?.name,
        nextGoalXp: level.nextTier?.minXp,
      });
    }

    prevTierRef.current = level.name;
  }, [profile?.xp]);
}
