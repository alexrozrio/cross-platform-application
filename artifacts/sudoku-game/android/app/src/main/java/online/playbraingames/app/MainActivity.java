package online.playbraingames.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Build;
import android.graphics.Color;
import android.graphics.Typeface;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;
import com.google.android.libraries.ads.mobile.sdk.MobileAds;
import com.google.android.libraries.ads.mobile.sdk.banner.AdSize;
import com.google.android.libraries.ads.mobile.sdk.banner.AdView;
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAd;
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAdRequest;
import com.google.android.libraries.ads.mobile.sdk.common.AdRequest;
import com.google.android.libraries.ads.mobile.sdk.common.AdLoadCallback;
import com.google.android.libraries.ads.mobile.sdk.common.FullScreenContentError;
import com.google.android.libraries.ads.mobile.sdk.common.LoadAdError;
import com.google.android.libraries.ads.mobile.sdk.common.PreloadConfiguration;
import com.google.android.libraries.ads.mobile.sdk.initialization.InitializationConfig;
import com.google.android.libraries.ads.mobile.sdk.interstitial.InterstitialAd;
import com.google.android.libraries.ads.mobile.sdk.interstitial.InterstitialAdEventCallback;
import com.google.android.libraries.ads.mobile.sdk.interstitial.InterstitialAdPreloader;
import com.google.android.libraries.ads.mobile.sdk.appopen.AppOpenAd;
import com.google.android.libraries.ads.mobile.sdk.appopen.AppOpenAdEventCallback;
import com.google.android.libraries.ads.mobile.sdk.appopen.AppOpenAdPreloader;
import com.google.android.libraries.ads.mobile.sdk.nativead.NativeAd;
import com.google.android.libraries.ads.mobile.sdk.nativead.NativeAdEventCallback;
import com.google.android.libraries.ads.mobile.sdk.nativead.NativeAdLoader;
import com.google.android.libraries.ads.mobile.sdk.nativead.NativeAdLoaderCallback;
import com.google.android.libraries.ads.mobile.sdk.nativead.NativeAdRequest;
import com.google.android.libraries.ads.mobile.sdk.nativead.NativeAdView;
import com.google.android.libraries.ads.mobile.sdk.rewarded.RewardedAd;
import com.google.android.libraries.ads.mobile.sdk.rewarded.RewardedAdEventCallback;
import com.google.android.libraries.ads.mobile.sdk.rewarded.RewardedAdPreloader;
import com.google.android.libraries.ads.mobile.sdk.rewarded.ServerSideVerificationOptions;
import com.google.android.libraries.ads.mobile.sdk.rewardedinterstitial.RewardedInterstitialAd;
import com.google.android.libraries.ads.mobile.sdk.rewardedinterstitial.RewardedInterstitialAdEventCallback;
import com.google.android.libraries.ads.mobile.sdk.rewardedinterstitial.RewardedInterstitialAdPreloader;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicBoolean;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final String ADMOB_APP_ID = "ca-app-pub-8826408740422357~3253265477";
    private static final String TEST_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/9214589741";
    private static final String RELEASE_BANNER_AD_UNIT_ID = "ca-app-pub-8826408740422357/5124055816";
    private static final String TEST_NATIVE_AD_UNIT_ID = "ca-app-pub-3940256099942544/2247696110";
    private static final String RELEASE_NATIVE_AD_UNIT_ID = "ca-app-pub-8826408740422357/7742033181";
    private static final String TEST_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
    private static final String RELEASE_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-8826408740422357/1335572786";
    private static final String TEST_APP_OPEN_AD_UNIT_ID = "ca-app-pub-3940256099942544/9257395921";
    private static final String RELEASE_APP_OPEN_AD_UNIT_ID = "ca-app-pub-8826408740422357/3096211162";
    private static final String TEST_REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";
    private static final String RELEASE_REWARDED_AD_UNIT_ID = "ca-app-pub-8826408740422357/4576813796";
    private static final String TEST_REWARDED_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/5354046379";
    private static final String RELEASE_REWARDED_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-8826408740422357/4238349559";
    private static final int MAX_INSET_SCRIPT_RETRIES = 50;
    private static final long INSET_SCRIPT_RETRY_DELAY_MS = 100;

    private static boolean interstitialPreloadingStarted;
    private static boolean rewardedPreloadingStarted;
    private static boolean rewardedInterstitialPreloadingStarted;
    private static boolean appOpenPreloadingStarted;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private LinearLayout bannerContainer;
    private AdView bannerAdView;
    private boolean bannerAdLoaded;
    private LinearLayout nativeAdContainer;
    private NativeAd nativeAd;
    private NativeAdView nativeAdView;
    private boolean nativeAdLoading;
    private boolean portalNativeAdRequested;
    private boolean hasBeenBackgrounded;
    private boolean isFullScreenAdShowing;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.AppTheme_NoActionBar);
        EdgeToEdge.enable(this);
        registerPlugin(AdsConfigurationPlugin.class);
        registerPlugin(InterstitialAdsPlugin.class);
        registerPlugin(RewardedAdsPlugin.class);
        registerPlugin(NativeAdsPlugin.class);
        super.onCreate(savedInstanceState);

        new Thread(() -> MobileAds.initialize(
            this,
            new InitializationConfig.Builder(ADMOB_APP_ID).build(),
            initializationStatus -> mainHandler.post(() -> {
                startInterstitialPreloading();
                startRewardedPreloading();
                startRewardedInterstitialPreloading();
                startAppOpenPreloading();
                createBannerAd();
            })
        ), "gma-initialization").start();

        WebView webView = getBridge().getWebView();
        // The API is hosted on a different origin from the native WebView.
        // Android blocks third-party cookies by default, which prevents the
        // persistent server session from surviving a native app restart.
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets safeInsets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
            );
            float density = getResources().getDisplayMetrics().density;
            applyInsetsToWebContent(webView, safeInsets, density, 0);
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (AdsConfiguration.APP_OPEN_ENABLED && hasBeenBackgrounded) {
            showPreloadedAppOpen();
        }
    }

    @Override
    protected void onStop() {
        if (!isFullScreenAdShowing) {
            hasBeenBackgrounded = true;
        }
        super.onStop();
    }

    private void startAppOpenPreloading() {
        if (!AdsConfiguration.APP_OPEN_ENABLED || appOpenPreloadingStarted) {
            return;
        }

        String adUnitId = getAppOpenAdUnitId();
        AdRequest adRequest = new AdRequest.Builder(adUnitId).build();
        PreloadConfiguration preloadConfiguration = new PreloadConfiguration(adRequest);
        if (AppOpenAdPreloader.start(adUnitId, preloadConfiguration)) {
            appOpenPreloadingStarted = true;
        } else {
            Log.w(TAG, "App open ad preloading could not be started.");
        }
    }

    private static String getAppOpenAdUnitId() {
        return BuildConfig.DEBUG
            ? TEST_APP_OPEN_AD_UNIT_ID
            : RELEASE_APP_OPEN_AD_UNIT_ID;
    }

    private void showPreloadedAppOpen() {
        if (
            !AdsConfiguration.APP_OPEN_ENABLED ||
            isFinishing() ||
            isDestroyed() ||
            isFullScreenAdShowing
        ) {
            return;
        }

        AppOpenAd appOpenAd = AppOpenAdPreloader.pollAd(getAppOpenAdUnitId());
        if (appOpenAd == null) {
            Log.i(TAG, "No preloaded app open ad is available on resume.");
            return;
        }

        isFullScreenAdShowing = true;
        appOpenAd.setAdEventCallback(new AppOpenAdEventCallback() {
            @Override
            public void onAdImpression() {
                Log.d(TAG, "App open ad recorded an impression.");
            }

            @Override
            public void onAdDismissedFullScreenContent() {
                isFullScreenAdShowing = false;
                hasBeenBackgrounded = false;
            }

            @Override
            public void onAdFailedToShowFullScreenContent(
                @NonNull FullScreenContentError error
            ) {
                Log.w(TAG, "App open ad failed to show: " + error.getMessage());
                isFullScreenAdShowing = false;
                hasBeenBackgrounded = false;
            }
        });
        appOpenAd.show(this);
    }

    private void startInterstitialPreloading() {
        if (!AdsConfiguration.INTERSTITIAL_ENABLED || interstitialPreloadingStarted) {
            return;
        }

        String adUnitId = getInterstitialAdUnitId();
        AdRequest adRequest = new AdRequest.Builder(adUnitId).build();
        PreloadConfiguration preloadConfiguration = new PreloadConfiguration(adRequest);
        if (InterstitialAdPreloader.start(adUnitId, preloadConfiguration)) {
            interstitialPreloadingStarted = true;
        } else {
            Log.w(TAG, "Interstitial ad preloading could not be started.");
        }
    }

    private static String getInterstitialAdUnitId() {
        return BuildConfig.DEBUG ? TEST_INTERSTITIAL_AD_UNIT_ID : RELEASE_INTERSTITIAL_AD_UNIT_ID;
    }

    private void startRewardedPreloading() {
        if (!AdsConfiguration.REWARDED_ENABLED || rewardedPreloadingStarted) {
            return;
        }

        String adUnitId = getRewardedAdUnitId();
        AdRequest adRequest = new AdRequest.Builder(adUnitId).build();
        PreloadConfiguration preloadConfiguration = new PreloadConfiguration(adRequest);
        if (RewardedAdPreloader.start(adUnitId, preloadConfiguration)) {
            rewardedPreloadingStarted = true;
        } else {
            Log.w(TAG, "Rewarded ad preloading could not be started.");
        }
    }

    private static String getRewardedAdUnitId() {
        return BuildConfig.DEBUG ? TEST_REWARDED_AD_UNIT_ID : RELEASE_REWARDED_AD_UNIT_ID;
    }

    private void startRewardedInterstitialPreloading() {
        if (
            !AdsConfiguration.REWARDED_INTERSTITIAL_ENABLED ||
            rewardedInterstitialPreloadingStarted
        ) {
            return;
        }

        String adUnitId = getRewardedInterstitialAdUnitId();
        AdRequest adRequest = new AdRequest.Builder(adUnitId).build();
        PreloadConfiguration preloadConfiguration = new PreloadConfiguration(adRequest);
        if (RewardedInterstitialAdPreloader.start(adUnitId, preloadConfiguration)) {
            rewardedInterstitialPreloadingStarted = true;
        } else {
            Log.w(TAG, "Rewarded interstitial ad preloading could not be started.");
        }
    }

    private static String getRewardedInterstitialAdUnitId() {
        return BuildConfig.DEBUG
            ? TEST_REWARDED_INTERSTITIAL_AD_UNIT_ID
            : RELEASE_REWARDED_INTERSTITIAL_AD_UNIT_ID;
    }

    public void showPreloadedRewardedInterstitial(PluginCall call) {
        if (!AdsConfiguration.REWARDED_INTERSTITIAL_ENABLED) {
            resolveRewardedCall(call, false, new AtomicBoolean(false));
            return;
        }

        RewardedInterstitialAd ad =
            RewardedInterstitialAdPreloader.pollAd(getRewardedInterstitialAdUnitId());
        AtomicBoolean resolved = new AtomicBoolean(false);
        if (ad == null) {
            Log.i(TAG, "No preloaded rewarded interstitial ad is available.");
            resolveRewardedCall(call, false, resolved);
            return;
        }

        ad.setAdEventCallback(new RewardedInterstitialAdEventCallback() {
            @Override
            public void onAdImpression() {
                Log.d(TAG, "Rewarded interstitial ad recorded an impression.");
            }

            @Override
            public void onAdDismissedFullScreenContent() {
                isFullScreenAdShowing = false;
                resolveRewardedCall(call, false, resolved);
            }

            @Override
            public void onAdFailedToShowFullScreenContent(
                @NonNull FullScreenContentError error
            ) {
                Log.w(TAG, "Rewarded interstitial ad failed to show: " + error.getMessage());
                isFullScreenAdShowing = false;
                resolveRewardedCall(call, false, resolved);
            }
        });
        isFullScreenAdShowing = true;
        ad.show(this, rewardItem -> resolveRewardedCall(call, true, resolved));
    }

    public void showPreloadedRewarded(
        String profileId,
        String rewardDate,
        PluginCall call
    ) {
        if (!AdsConfiguration.REWARDED_ENABLED) {
            resolveRewardedCall(call, false, new AtomicBoolean(false));
            return;
        }

        RewardedAd rewardedAd = RewardedAdPreloader.pollAd(getRewardedAdUnitId());
        if (rewardedAd == null) {
            Log.i(TAG, "No preloaded rewarded ad is available.");
            resolveRewardedCall(call, false, new AtomicBoolean(false));
            return;
        }

        AtomicBoolean resolved = new AtomicBoolean(false);
        rewardedAd.setServerSideVerificationOptions(
            new ServerSideVerificationOptions(profileId, rewardDate)
        );
        rewardedAd.setAdEventCallback(new RewardedAdEventCallback() {
            @Override
            public void onAdImpression() {
                Log.d(TAG, "Rewarded ad recorded an impression.");
            }

            @Override
            public void onAdDismissedFullScreenContent() {
                isFullScreenAdShowing = false;
                resolveRewardedCall(call, false, resolved);
            }

            @Override
            public void onAdFailedToShowFullScreenContent(
                @NonNull FullScreenContentError error
            ) {
                Log.w(TAG, "Rewarded ad failed to show: " + error.getMessage());
                isFullScreenAdShowing = false;
                resolveRewardedCall(call, false, resolved);
            }
        });
        isFullScreenAdShowing = true;
        rewardedAd.show(this, rewardItem -> resolveRewardedCall(call, true, resolved));
    }

    private static void resolveRewardedCall(
        PluginCall call,
        boolean earned,
        AtomicBoolean resolved
    ) {
        if (resolved.compareAndSet(false, true)) {
            JSObject result = new JSObject();
            result.put("earned", earned);
            call.resolve(result);
        }
    }

    public void showPreloadedInterstitial() {
        if (!AdsConfiguration.INTERSTITIAL_ENABLED) {
            return;
        }

        InterstitialAd interstitialAd = InterstitialAdPreloader.pollAd(getInterstitialAdUnitId());
        if (interstitialAd == null) {
            Log.i(TAG, "No preloaded interstitial ad is available.");
            return;
        }

        interstitialAd.setAdEventCallback(new InterstitialAdEventCallback() {
            @Override
            public void onAdImpression() {
                Log.d(TAG, "Interstitial ad recorded an impression.");
            }

            @Override
            public void onAdDismissedFullScreenContent() {
                isFullScreenAdShowing = false;
            }

            @Override
            public void onAdFailedToShowFullScreenContent(
                @NonNull FullScreenContentError error
            ) {
                Log.w(TAG, "Interstitial ad failed to show: " + error.getMessage());
                isFullScreenAdShowing = false;
            }
        });
        isFullScreenAdShowing = true;
        interstitialAd.show(this);
    }

    private void createBannerAd() {
        if (isFinishing() || isDestroyed() || bannerAdView != null) {
            return;
        }

        WebView webView = getBridge().getWebView();
        ViewGroup parent = (ViewGroup) webView.getParent();
        int webViewIndex = parent.indexOfChild(webView);
        ViewGroup.LayoutParams parentLayoutParams = webView.getLayoutParams();
        parent.removeView(webView);

        LinearLayout contentLayout = new LinearLayout(this);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        parent.addView(contentLayout, webViewIndex, parentLayoutParams);
        contentLayout.addView(
            webView,
            new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1
            )
        );

        bannerContainer = new LinearLayout(this);
        bannerContainer.setGravity(Gravity.CENTER_HORIZONTAL);
        bannerContainer.setVisibility(View.GONE);
        nativeAdContainer = new LinearLayout(this);
        nativeAdContainer.setOrientation(LinearLayout.VERTICAL);
        nativeAdContainer.setVisibility(View.GONE);
        contentLayout.addView(
            nativeAdContainer,
            new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        );
        contentLayout.addView(
            bannerContainer,
            new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        );

        ViewCompat.setOnApplyWindowInsetsListener(contentLayout, (view, windowInsets) -> {
            Insets safeInsets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
            );
            view.setPadding(
                view.getPaddingLeft(),
                view.getPaddingTop(),
                view.getPaddingRight(),
                safeInsets.bottom
            );
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(contentLayout);

        if (AdsConfiguration.BANNER_ENABLED) {
            bannerAdView = new AdView(this);
            bannerContainer.addView(
                bannerAdView,
                new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
            );

            bannerContainer.post(() -> {
                if (isFinishing() || isDestroyed() || bannerAdView == null) {
                    return;
                }

                float density = getResources().getDisplayMetrics().density;
                int widthDp = (int) (contentLayout.getWidth() / density);
                if (widthDp <= 0) {
                    Log.w(TAG, "Banner ad was not requested because its container has no width.");
                    return;
                }

                AdSize adSize = AdSize.getLargeAnchoredAdaptiveBannerAdSize(this, widthDp);
                BannerAdRequest adRequest = new BannerAdRequest.Builder(
                    BuildConfig.DEBUG ? TEST_BANNER_AD_UNIT_ID : RELEASE_BANNER_AD_UNIT_ID,
                    adSize
                ).build();
                bannerAdView.loadAd(adRequest, new AdLoadCallback<BannerAd>() {
                    @Override
                    public void onAdLoaded(@NonNull BannerAd bannerAd) {
                        bannerAdLoaded = true;
                        if (
                            bannerContainer != null &&
                            (nativeAdContainer == null ||
                                nativeAdContainer.getVisibility() != View.VISIBLE)
                        ) {
                            bannerContainer.setVisibility(View.VISIBLE);
                        }
                        Log.d(TAG, "Banner ad loaded.");
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError adError) {
                        Log.w(TAG, "Banner ad failed to load: " + adError);
                    }
                });
            });
        }
        if (portalNativeAdRequested) {
            loadPortalNativeAd();
        }
    }

    public void setPortalNativeAdVisible(boolean visible) {
        if (visible && !AdsConfiguration.NATIVE_ENABLED) {
            portalNativeAdRequested = false;
            return;
        }

        portalNativeAdRequested = visible;
        if (!visible) {
            destroyPortalNativeAd();
            if (bannerContainer != null) {
                bannerContainer.setVisibility(
                    AdsConfiguration.BANNER_ENABLED && bannerAdLoaded
                        ? View.VISIBLE
                        : View.GONE
                );
            }
            return;
        }

        if (nativeAd != null && nativeAdView != null && nativeAdContainer != null) {
            nativeAdContainer.setVisibility(View.VISIBLE);
            if (bannerContainer != null) {
                bannerContainer.setVisibility(View.GONE);
            }
            return;
        }
        loadPortalNativeAd();
    }

    private void loadPortalNativeAd() {
        if (
            !AdsConfiguration.NATIVE_ENABLED ||
            !portalNativeAdRequested ||
            nativeAdLoading ||
            nativeAd != null ||
            nativeAdContainer == null
        ) {
            return;
        }

        String adUnitId = BuildConfig.DEBUG
            ? TEST_NATIVE_AD_UNIT_ID
            : RELEASE_NATIVE_AD_UNIT_ID;
        if (adUnitId.isEmpty()) {
            Log.w(TAG, "Native ad placement is disabled until a production Native ad unit ID is configured.");
            return;
        }

        nativeAdLoading = true;
        NativeAdRequest adRequest = new NativeAdRequest.Builder(
            adUnitId,
            Collections.singletonList(NativeAd.NativeAdType.NATIVE)
        ).build();
        NativeAdLoader.load(adRequest, new NativeAdLoaderCallback() {
            @Override
            public void onNativeAdLoaded(@NonNull NativeAd loadedAd) {
                mainHandler.post(() -> {
                    nativeAdLoading = false;
                    if (
                        isFinishing() ||
                        isDestroyed() ||
                        !portalNativeAdRequested ||
                        nativeAdContainer == null
                    ) {
                        loadedAd.destroy();
                        return;
                    }
                    displayPortalNativeAd(loadedAd);
                });
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError adError) {
                mainHandler.post(() -> {
                    nativeAdLoading = false;
                    Log.w(TAG, "Portal native ad failed to load: " + adError);
                });
            }
        });
    }

    private void displayPortalNativeAd(@NonNull NativeAd ad) {
        nativeAd = ad;
        NativeAdView adView = new NativeAdView(this);
        adView.setBackgroundColor(Color.rgb(248, 250, 252));
        adView.setPadding(dp(12), dp(10), dp(12), dp(10));

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setBackgroundColor(Color.rgb(248, 250, 252));

        TextView attribution = new TextView(this);
        attribution.setText("Ad");
        attribution.setTextColor(Color.rgb(71, 85, 105));
        attribution.setTextSize(12);
        attribution.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        card.addView(attribution);

        LinearLayout assetRow = new LinearLayout(this);
        assetRow.setGravity(Gravity.CENTER_VERTICAL);
        assetRow.setOrientation(LinearLayout.HORIZONTAL);
        assetRow.setPadding(0, dp(6), 0, dp(4));

        ImageView icon = new ImageView(this);
        icon.setScaleType(ImageView.ScaleType.CENTER_CROP);
        LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(dp(48), dp(48));
        iconParams.setMarginEnd(dp(10));
        assetRow.addView(icon, iconParams);

        LinearLayout textAssets = new LinearLayout(this);
        textAssets.setOrientation(LinearLayout.VERTICAL);
        assetRow.addView(
            textAssets,
            new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1)
        );

        TextView headline = new TextView(this);
        headline.setTextColor(Color.rgb(15, 23, 42));
        headline.setTextSize(15);
        headline.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        textAssets.addView(headline);

        TextView body = new TextView(this);
        body.setTextColor(Color.rgb(71, 85, 105));
        body.setTextSize(13);
        body.setMaxLines(2);
        textAssets.addView(body);
        card.addView(assetRow);

        Button callToAction = new Button(this);
        callToAction.setTextColor(Color.WHITE);
        callToAction.setBackgroundColor(Color.rgb(37, 99, 235));
        card.addView(
            callToAction,
            new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        );

        adView.setHeadlineView(headline);
        adView.setBodyView(body);
        adView.setIconView(icon);
        adView.setCallToActionView(callToAction);
        headline.setText(ad.getHeadline());
        body.setText(ad.getBody());
        if (ad.getBody() == null) {
            body.setVisibility(View.GONE);
        }
        if (ad.getIcon() == null) {
            icon.setVisibility(View.GONE);
        } else {
            icon.setImageDrawable(ad.getIcon().getDrawable());
        }
        if (ad.getCallToAction() == null) {
            callToAction.setVisibility(View.GONE);
        } else {
            callToAction.setText(ad.getCallToAction());
        }
        adView.addView(
            card,
            new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        );
        ad.setAdEventCallback(new NativeAdEventCallback() {
            @Override
            public void onAdImpression() {
                Log.d(TAG, "Portal native ad recorded an impression.");
            }

            @Override
            public void onAdClicked() {
                Log.d(TAG, "Portal native ad recorded a click.");
            }
        });
        adView.registerNativeAd(ad, null);

        nativeAdView = adView;
        nativeAdContainer.removeAllViews();
        nativeAdContainer.addView(
            adView,
            new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        );
        nativeAdContainer.setVisibility(View.VISIBLE);
        if (bannerContainer != null) {
            bannerContainer.setVisibility(View.GONE);
        }
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    private void destroyPortalNativeAd() {
        if (nativeAdView != null) {
            if (nativeAdView.getParent() instanceof ViewGroup) {
                ((ViewGroup) nativeAdView.getParent()).removeView(nativeAdView);
            }
            nativeAdView.destroy();
            nativeAdView = null;
        }
        if (nativeAd != null) {
            nativeAd.destroy();
            nativeAd = null;
        }
        if (nativeAdContainer != null) {
            nativeAdContainer.removeAllViews();
            nativeAdContainer.setVisibility(View.GONE);
        }
    }

    @Override
    protected void onDestroy() {
        portalNativeAdRequested = false;
        destroyPortalNativeAd();
        if (bannerAdView != null) {
            if (bannerAdView.getParent() instanceof ViewGroup) {
                ((ViewGroup) bannerAdView.getParent()).removeView(bannerAdView);
            }
            bannerAdView.destroy();
            bannerAdView = null;
        }
        bannerContainer = null;
        nativeAdContainer = null;
        super.onDestroy();
    }

    private void applyInsetsToWebContent(
        WebView webView,
        Insets insets,
        float density,
        int retryCount
    ) {
        String script = "(function(){"
            + "if(!document.documentElement || !document.getElementById('root')) return false;"
            + "var root=document.documentElement;"
            + "root.style.setProperty('--native-safe-area-inset-top','" + insets.top / density + "px');"
            + "root.style.setProperty('--native-safe-area-inset-right','" + insets.right / density + "px');"
            + "root.style.setProperty('--native-safe-area-inset-bottom','" + insets.bottom / density + "px');"
            + "root.style.setProperty('--native-safe-area-inset-left','" + insets.left / density + "px');"
            + "return true;"
            + "})()";

        webView.evaluateJavascript(script, result -> {
            if (!"true".equals(result) && retryCount < MAX_INSET_SCRIPT_RETRIES) {
                mainHandler.postDelayed(
                    () -> applyInsetsToWebContent(webView, insets, density, retryCount + 1),
                    INSET_SCRIPT_RETRY_DELAY_MS
                );
            }
        });
    }
}
