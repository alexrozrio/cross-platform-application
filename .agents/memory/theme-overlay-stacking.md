---
name: Theme overlay stacking
description: Layering rules for full-screen theme subpages and dialogs opened inside them.
---

Keep the mobile “Show all” overlay above global app chrome, and raise only its nested dialog backdrop and content above it; leave shared dialog defaults unchanged.

**Why:** Moving the overlay below the app header hid its sticky title and navigation controls. Raising shared dialogs globally could also reorder unrelated overlays and controls.

**How to apply:** When adding dialogs to this overlay, opt both the backdrop and content into a higher layer while keeping dialogs opened elsewhere at their existing shared layer.