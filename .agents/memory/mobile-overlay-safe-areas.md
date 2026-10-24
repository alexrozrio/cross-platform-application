---
name: Mobile overlay safe areas
description: Safe-area sizing for dialogs and fixed overlays in the native Android app.
---

Centered dialogs should stay within the mobile top and bottom safe areas and scroll when their content is taller than the available space. Native Android should reserve at least 24px at each edge because initial WebView insets can be zero. Bottom-pinned, non-blocking overlays need their own safe-bottom and navigation-bar clearance; the shared centered-dialog rule does not reposition them.

**Why:** Edge-to-edge Android layouts and delayed inset reporting can place popup controls behind the status or navigation system bars even when browser safe-area values are available later.

**How to apply:** Use the shared safe-area behavior for centered dialog and alert-dialog primitives. Explicitly size and offset custom or bottom-pinned overlays, keep long content scrollable, and test portrait and short-landscape viewports with simulated native insets.
