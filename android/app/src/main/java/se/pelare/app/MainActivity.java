package se.pelare.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

/**
 * Keeps the app's JavaScript running while the screen is off during a run.
 *
 * The web part of the app runs in a separate renderer process. When the app is not visible, Android
 * lowers that process's priority and may freeze it – even though the GPS foreground service keeps the
 * app itself alive. Then voice cues (segments, pace, kilometres) queue up and are only spoken when the
 * app is opened again. Marking the renderer as important, also when not visible, prevents that.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        keepRunning();
    }

    @Override
    public void onPause() {
        super.onPause();
        keepRunning();
    }

    @Override
    public void onStop() {
        super.onStop();
        keepRunning();
    }

    private void keepRunning() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
        }
        // Timers are shared by all web views – make sure nothing has paused them.
        webView.resumeTimers();
    }
}
