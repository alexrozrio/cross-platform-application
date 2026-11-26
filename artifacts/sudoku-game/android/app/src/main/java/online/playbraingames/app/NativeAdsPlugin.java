package online.playbraingames.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeAds")
public class NativeAdsPlugin extends Plugin {
    @PluginMethod
    public void setPortalAdVisible(PluginCall call) {
        Boolean visible = call.getBoolean("visible");
        if (visible == null) {
            call.reject("The native ad visibility value is required.");
            return;
        }

        if (!(getActivity() instanceof MainActivity)) {
            call.reject("The native ad placement is unavailable.");
            return;
        }

        MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(() -> {
            if (activity.isFinishing() || activity.isDestroyed()) {
                call.reject("The native ad placement is unavailable.");
                return;
            }
            activity.setPortalNativeAdVisible(visible);
            call.resolve();
        });
    }
}
