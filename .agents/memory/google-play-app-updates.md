---
name: Google Play app updates
description: Release and test requirements for the Play Store in-app update flow.
---

The in-app update checker must ship in a Play Store release before it can prompt users. Installed builds that lack the checker cannot show its custom prompt retroactively; publish and install a checker-enabled version, then test a newer version from Google Play. Normal releases should use the flexible flow. Critical releases can use the required immediate flow when their Play in-app update priority is set to 4 or higher in Play Console.

**Why:** Google Play determines update availability and release priority, and only code already installed on a device can call the update API. The current app uses Capacitor 7, so the matching update-plugin major was chosen rather than upgrading the full native toolchain.

**How to apply:** Increment Android `versionCode` for each release. Validate by installing the checker-enabled build from a Play testing track, then publishing a later test version. Do not upgrade the app-update plugin to its Capacitor 8 major without deliberately upgrading Capacitor and the Node runtime together.
