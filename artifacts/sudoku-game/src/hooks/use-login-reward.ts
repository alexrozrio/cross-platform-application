import { useState, useCallback } from "react";

export interface LoginRewardResult {
  alreadyClaimed: boolean;
  loginStreak: number;
  gemsAwarded: number;
  totalGems: number;
}

export interface LoginRewardState {
  show: boolean;
  profileId: number | null;
  result: LoginRewardResult | null;
}

export function useLoginReward() {
  const [state, setState] = useState<LoginRewardState>({ show: false, profileId: null, result: null });

  const claimReward = useCallback(async (profileId: number) => {
    try {
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${basePath}/api/profiles/${profileId}/claim-login-reward`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      const data: LoginRewardResult = await res.json();
      if (!data.alreadyClaimed) {
        setState({ show: true, profileId, result: data });
      }
    } catch {
      // Silently ignore — reward is a nice-to-have
    }
  }, []);

  const dismiss = useCallback(() => {
    setState((s) => ({ ...s, show: false }));
  }, []);

  return { rewardState: state, claimReward, dismissReward: dismiss };
}
