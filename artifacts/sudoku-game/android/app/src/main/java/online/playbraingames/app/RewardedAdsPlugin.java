package online.playbraingames.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "RewardedAds")
public class RewardedAdsPlugin extends Plugin {
    @PluginMethod
    public void showForExtraTip(PluginCall call) {
        if (!AdsConfiguration.REWARDED_INTERSTITIAL_ENABLED) {
            resolveNotEarned(call);
            return;
        }

        if (!(getActivity() instanceof MainActivity)) {
            call.reject("The rewarded interstitial ad is unavailable.");
            return;
        }

        MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(() -> {
            if (activity.isFinishing() || activity.isDestroyed()) {
                call.reject("The rewarded interstitial ad is unavailable.");
                return;
            }
            activity.showPreloadedRewardedInterstitial(call);
        });
    }

    @PluginMethod
    public void showForLoginReward(PluginCall call) {
        if (!AdsConfiguration.REWARDED_ENABLED) {
            resolveNotEarned(call);
            return;
        }

        String profileId = call.getString("profileId");
        String rewardDate = call.getString("rewardDate");
        if (profileId == null || !profileId.matches("[1-9][0-9]*")
            || rewardDate == null || !rewardDate.matches("\\d{4}-\\d{2}-\\d{2}")) {
            call.reject("A valid profile id and reward date are required.");
            return;
        }

        if (!(getActivity() instanceof MainActivity)) {
            call.reject("The rewarded ad is unavailable.");
            return;
        }

        MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(() -> {
            if (activity.isFinishing() || activity.isDestroyed()) {
                call.reject("The rewarded ad is unavailable.");
                return;
            }
            activity.showPreloadedRewarded(profileId, rewardDate, call);
        });
    }

    private static void resolveNotEarned(PluginCall call) {
        JSObject result = new JSObject();
        result.put("earned", false);
        call.resolve(result);
    }
}
