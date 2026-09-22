import { useState, useCallback, useEffect } from "react";
import { apiUrl } from "../lib/api-base-url";
import { CONSENT_CHANGED_EVENT, getStoredConsent } from "../lib/consent";

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

  // ConsentManager renders globally and its first-time banner must remain
  // interactive before any modal can claim focus. If a login reward arrives
  // first, keep it queued and reveal it after the consent choice is saved.
  useEffect(() => {
    const handleConsentChanged = () => {
      setState((current) =>
        current.result && !current.show
          ? { ...current, show: true }
          : current,
      );
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);
  }, []);

  const claimReward = useCallback(async (profileId: number) => {
    try {
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(apiUrl(`${basePath}/api/profiles/${profileId}/claim-login-reward`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      const data: LoginRewardResult = await res.json();
      if (!data.alreadyClaimed) {
        setState({
          show: Boolean(getStoredConsent()),
          profileId,
          result: data,
        });
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
