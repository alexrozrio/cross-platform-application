---
name: App-link testing
description: Signing requirements for testing Android App Links before release.
---

The mobile app is not yet released and is in testing. A local Android debug certificate can verify App Links during testing, but it should be replaced by the Play app-signing certificate before public release; do not leave a debug fingerprint as the production association.

**Why:** The user said release signing details are not available yet, while the app still needs verified link handoff tested before release.

**How to apply:** Use the debug variant SHA-256 from Gradle signing reports for local testing, then add the Play signing fingerprint to the domain association before release. iOS Universal Links separately require the Apple Developer Team ID.
