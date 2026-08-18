---
name: Sudoku bookmark URL contract
description: Canonical Sudoku setup and playable URL behavior, including play-style preservation.
---

Canonical Sudoku setup URLs contain the grid slug and difficulty, with an optional `mode` query; playable URLs add `gameId` (and `offlineGame` for offline state). Legacy `/game/:id` routes remain supported.

**Why:** Setup links should be safe to bookmark/share without binding them to a specific server game, while playable links must still reopen the exact online or offline game.

**How to apply:** Keep route parsing and URL construction in the shared Sudoku route helper. Preserve `mode` when changing setup selections, and treat `gameId` as the switch from setup to the game screen.