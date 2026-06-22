import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { type ItemType, isFreeItem } from "@/lib/item-catalog";

interface UnlockedRow { itemType: string; itemId: string }
interface UnlockResult { gemsRemaining: number }

export function useUnlockedItems(profileId: number | null) {
  const { data = [] } = useQuery<UnlockedRow[]>({
    queryKey: ["unlocks", profileId],
    queryFn: () => customFetch<UnlockedRow[]>(`/api/unlocks/${profileId}`),
    enabled: !!profileId,
    staleTime: 30000,
  });

  const unlockedSet = new Set(data.map((r) => `${r.itemType}:${r.itemId}`));

  function isUnlocked(type: ItemType, id: string): boolean {
    if (isFreeItem(type, id)) return true;
    if (!profileId) return false;
    return unlockedSet.has(`${type}:${id}`);
  }

  return { isUnlocked };
}

export function useUnlockItem(profileId: number | null) {
  const queryClient = useQueryClient();

  return useMutation<UnlockResult, Error, { itemType: ItemType; itemId: string }>({
    mutationFn: ({ itemType, itemId }) =>
      customFetch<UnlockResult>("/api/unlock", {
        method: "POST",
        body: JSON.stringify({ profileId, itemType, itemId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unlocks", profileId] });
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
    },
  });
}
