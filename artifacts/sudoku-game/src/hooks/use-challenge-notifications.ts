import React from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { showEventModal } from "@/hooks/use-event-modal";

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
      // First load — silently record all current statuses; no modals for old state
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
        showEventModal({
          type: "challenge_received",
          challengerName: c.challengerUsername,
          challengeId: c.id,
        });
        return;
      }

      // ── Status transition on an existing challenge ────────────────────────
      if (prev === undefined || prev === c.status) {
        seenStatus.current.set(c.id, c.status);
        return;
      }

      // Status changed — update record then fire modal
      seenStatus.current.set(c.id, c.status);

      // Challenger receives: accepted or declined
      if (isChallenger) {
        if (c.status === "accepted") {
          showEventModal({ type: "challenge_accepted", opponentName });
          return;
        }
        if (c.status === "declined") {
          showEventModal({ type: "challenge_declined", opponentName });
          return;
        }
      }

      // Either side: challenge completed
      if (c.status === "completed") {
        const won = c.winnerId === profileId;
        const tied = c.winnerId === null;

        if (won) {
          showEventModal({ type: "challenge_won", opponentName, gems: 10 });
        } else if (tied) {
          showEventModal({ type: "challenge_tied", opponentName });
        } else {
          showEventModal({ type: "challenge_lost", opponentName });
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
