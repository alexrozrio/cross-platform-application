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
  challengerUsername?: string;
}

export function useChallengeNotifications(profileId: number | null) {
  const seenIds = React.useRef<Set<number>>(new Set());
  const initialized = React.useRef(false);
  const [, setLocation] = useLocation();

  const { data } = useQuery<ChallengeNotif[]>({
    queryKey: ["challenges", profileId],
    queryFn: () => customFetch<ChallengeNotif[]>(`/api/challenges/for/${profileId}`),
    enabled: !!profileId,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  React.useEffect(() => {
    if (!data || !profileId) return;

    const incoming = data.filter(
      (c) => c.status === "pending" && c.challengedId === profileId
    );

    if (!initialized.current) {
      incoming.forEach((c) => seenIds.current.add(c.id));
      initialized.current = true;
      return;
    }

    incoming.forEach((c) => {
      if (seenIds.current.has(c.id)) return;
      seenIds.current.add(c.id);

      const name = c.challengerUsername ?? "Someone";
      toast(`⚔️ ${name} challenged you!`, {
        description: "Beat their score to win 10 gems.",
        duration: 8000,
        action: {
          label: "View",
          onClick: () => setLocation("/challenges"),
        },
      });
    });
  }, [data, profileId, setLocation]);
}
