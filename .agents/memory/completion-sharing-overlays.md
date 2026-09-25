---
name: Completion sharing overlays
description: How celebrations should behave while the Sudoku completion result is visible.
---

When a Sudoku result is visible, keep celebrations on screen but render rank-up, achievement, tournament, and event dialogs as non-blocking notices. Keep the result's share action available, and prevent outside clicks from dismissing a notice. Outside the completion result, preserve the normal modal behavior.

**Why:** Players should be able to share a result immediately without losing the celebration or waiting for it to finish.

**How to apply:** When changing completion visibility or celebration components, keep non-blocking behavior scoped to the result screen and verify the share action remains usable beneath the notices.