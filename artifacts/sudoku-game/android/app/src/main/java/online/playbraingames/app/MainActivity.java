package online.playbraingames.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import androidx.activity.EdgeToEdge;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int MAX_INSET_SCRIPT_RETRIES = 50;
    private static final long INSET_SCRIPT_RETRY_DELAY_MS = 100;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
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
