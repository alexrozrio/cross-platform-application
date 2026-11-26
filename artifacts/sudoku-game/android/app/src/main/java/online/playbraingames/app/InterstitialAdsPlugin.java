package online.playbraingames.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "InterstitialAds")
public class InterstitialAdsPlugin extends Plugin {
    @PluginMethod
    public void showAfterGame(PluginCall call) {
        if (!AdsConfiguration.INTERSTITIAL_ENABLED) {
            call.resolve();
            return;
        }

        MainActivity activity = (MainActivity) getActivity();
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            call.resolve();
            return;
        }

        activity.runOnUiThread(() -> {
            if (!activity.isFinishing() && !activity.isDestroyed()) {
                activity.showPreloadedInterstitial();
            }
            call.resolve();
        });
    }
}
