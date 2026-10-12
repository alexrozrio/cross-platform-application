---
name: Guest profile transfer
description: Security and UX invariants for restoring guest profiles between browser and Capacitor storage.
---

Guest profile restore must use an owner-verified, short-lived, one-use transfer code rather than the numeric profile ID. Verify the source device identifier before issuing the code, store only its hash, and consume it atomically on restore. The code reconnects another device to the same guest profile; it does not merge the destination's previous profile.

**Why:** Browser and Capacitor WebView storage are separate, while numeric profile IDs are guessable and must not be treated as proof of ownership.

**How to apply:** Preserve source-device verification, expiry, replay protection, and explicit destination-profile warnings in any future restore or account-linking work.
