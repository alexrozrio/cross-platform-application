---
name: Android WebView sessions
description: Keep cross-origin API authentication cookies available and persistent in the Capacitor Android app.
---

For Capacitor Android, explicitly enable third-party cookies on the app's WebView when authentication uses a separately hosted API. `SameSite=None; Secure` and `credentials: "include"` are not enough when Android WebView's third-party cookie policy rejects the cookie.

**Why:** Without the API session cookie, OAuth can appear to complete successfully but the app returns as signed out or loses the session after closing.

**How to apply:** When changing native Android auth or API origins, verify both WebView third-party cookie acceptance and the server's persistent cookie settings; test by force-closing and reopening the installed app.
