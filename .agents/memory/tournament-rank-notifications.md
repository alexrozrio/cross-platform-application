---
name: Tournament rank notifications
description: Persistence behavior for tournament rank-change alerts.
---

Tournament rank-up and rank-down notifications should remain visible until the user dismisses them. Do not automatically clear the rank-delta badge on a timer.

**Why:** The user asked for rank changes not to disappear automatically because they can be missed.

**How to apply:** Preserve manual dismissal for tournament rank alerts and avoid time-based clearing; do not change timeout behavior for unrelated event notifications unless requested.
