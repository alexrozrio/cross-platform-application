package online.playbraingames.app;

import com.getcapacitor.JSObject;

public final class AdsConfiguration {
    public static final boolean BANNER_ENABLED = true;
    public static final boolean INTERSTITIAL_ENABLED = true;
    public static final boolean REWARDED_ENABLED = true;
    public static final boolean REWARDED_INTERSTITIAL_ENABLED = true;
    public static final boolean NATIVE_ENABLED = true;
    public static final boolean APP_OPEN_ENABLED = false;

    private AdsConfiguration() {}

    public static JSObject toJSObject() {
        JSObject configuration = new JSObject();
        configuration.put("banner", BANNER_ENABLED);
        configuration.put("interstitial", INTERSTITIAL_ENABLED);
        configuration.put("rewarded", REWARDED_ENABLED);
        configuration.put("rewardedInterstitial", REWARDED_INTERSTITIAL_ENABLED);
        configuration.put("native", NATIVE_ENABLED);
        configuration.put("appOpen", APP_OPEN_ENABLED);
        return configuration;
    }
}
