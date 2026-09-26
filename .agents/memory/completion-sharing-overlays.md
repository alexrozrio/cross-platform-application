---
name: Completion sharing overlays
description: How celebrations should behave while the Sudoku completion result is visible.
---

When a Sudoku result is visible, keep the achievement-unlock dialog modal and in front of the result; the player can share after closing it. Keep other rank-up, tournament, and event celebrations non-blocking so sharing remains available during them. Confetti stays visible throughout.

**Why:** Achievement unlocks deserve a focused moment, while other celebrations should not delay sharing the result.

**How to apply:** When changing completion visibility or celebration components, do not make the achievement dialog non-blocking; emit the completion signal after server completion so the notifier does not mistake a newly unlocked achievement for its initial baseline.