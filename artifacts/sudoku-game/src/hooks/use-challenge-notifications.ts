import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { customFetch } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface ChallengeNotif {
  id: number;
  challengerId: number;
  challengedId: number;
  status: string;
  winnerId: number | null;
  challengerUsername: string;
  challengedUsername: string;
}

export function useChallengeNotifications(profileId: number | null) {
  // Track the last-seen status for every challenge so we detect transitions
  const seenStatus = React.useRef<Map<number, string>>(new Map());
  const initialized = React.useRef(false);
  const [, setLocation] = useLocation();

  const { data } = useQuery<ChallengeNotif[]>({
    queryKey: ["challenges", profileId],
    queryFn: () =>
      customFetch<ChallengeNotif[]>(`/api/challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  React.useEffect(() => {
    if (!data || !profileId) return;

    if (!initialized.current) {
      // First load — silently record all current statuses; no toasts for old state
      data.forEach((c) => seenStatus.current.set(c.id, c.status));
      initialized.current = true;
      return;
    }

    data.forEach((c) => {
      const prev = seenStatus.current.get(c.id);
      const isChallenger = c.challengerId === profileId;
      const opponentName = isChallenger
        ? c.challengedUsername
        : c.challengerUsername;

      // ── Brand-new pending challenge directed at me ────────────────────────
      if (prev === undefined && c.status === "pending" && !isChallenger) {
        seenStatus.current.set(c.id, c.status);
        toast(`⚔️ ${c.challengerUsername} challenged you!`, {
          description: "Beat their score to win 10 gems.",
          duration: 8000,
          action: { label: "View", onClick: () => setLocation("/challenges") },
        });
        return;
      }

      // ── Status transition on an existing challenge ────────────────────────
      if (prev === undefined || prev === c.status) {
        // Unseen new challenge with non-pending status, or no change — just record
        seenStatus.current.set(c.id, c.status);
        return;
      }

      // Status changed — update record then fire toast
      seenStatus.current.set(c.id, c.status);

      // Challenger receives: accepted or declined
      if (isChallenger) {
        if (c.status === "accepted") {
          toast(`✅ ${opponentName} accepted your challenge!`, {
            description: "They're playing now — finish your game to find out who wins.",
            duration: 8000,
            action: {
              label: "View",
              onClick: () => setLocation("/challenges"),
            },
          });
          return;
        }
        if (c.status === "declined") {
          toast(`❌ ${opponentName} declined your challenge`, {
            description: "You can challenge someone else anytime.",
            duration: 6000,
            action: {
              label: "View",
              onClick: () => setLocation("/challenges"),
            },
          });
          return;
        }
      }

      // Either side: challenge completed
      if (c.status === "completed") {
        const won = c.winnerId === profileId;
        const tied = c.winnerId === null;

        if (won) {
          toast.success(`🏆 You beat ${opponentName}!`, {
            description:
              "Congratulations — you won the challenge and earned +10 gems! 💎",
            duration: 12000,
            action: {
              label: "View",
              onClick: () => setLocation("/challenges"),
            },
          });
        } else if (tied) {
          toast(`🤝 It's a tie with ${opponentName}!`, {
            description: "You matched each other's score — well played!",
            duration: 8000,
            action: {
              label: "View",
              onClick: () => setLocation("/challenges"),
            },
          });
        } else {
          toast(`😔 ${opponentName} beat you this time`, {
            description: "Challenge them again and turn it around!",
            duration: 8000,
            action: {
              label: "Rematch",
              onClick: () => setLocation("/challenges"),
            },
          });
        }
      }
    });
  }, [data, profileId, setLocation]);
}

export function usePendingChallengeCount(profileId: number | null): number {
  const { data } = useQuery<ChallengeNotif[]>({
    queryKey: ["challenges", profileId],
    queryFn: () =>
      customFetch<ChallengeNotif[]>(`/api/challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  if (!data || !profileId) return 0;
  return data.filter(
    (c) => c.status === "pending" && c.challengedId === profileId,
  ).length;
}
