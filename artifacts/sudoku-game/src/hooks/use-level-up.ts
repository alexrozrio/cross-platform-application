import { useEffect, useRef } from "react";
import { useGetProfile } from "@workspace/api-client-react";
import { getLevelFromXp } from "@/lib/levels";
import { toast } from "sonner";

export function useLevelUpWatcher(profileId: number | null) {
  const { data: profile } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });

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
      toast.success(`🎉 Rank Up! You are now ${level.name}!`, {
        description: level.nextTier
          ? `Next goal: ${level.nextTier.name} at ${level.nextTier.minXp.toLocaleString()} XP`
          : "You've reached the highest rank. Incredible!",
        duration: 6000,
        style: {
          background: level.color,
          color: level.textColor,
          border: `2px solid ${level.ring}`,
          fontWeight: "bold",
        },
      });
    }

    prevTierRef.current = level.name;
  }, [profile?.xp]);
}
