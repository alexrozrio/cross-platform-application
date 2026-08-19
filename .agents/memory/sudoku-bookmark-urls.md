---
name: Sudoku bookmark URL contract
description: Canonical Sudoku setup and playable URL behavior, including play-style preservation.
---

Canonical Sudoku URLs contain the grid slug and difficulty, with an optional `mode` query; opening one starts a fresh game, while playable URLs add `gameId` (and `offlineGame` for offline state). Legacy `/game/:id` routes remain supported.

**Why:** A shared level link should take the player directly into the requested variant without binding it to a previous server game, while playable links must still reopen the exact online or offline game.

**How to apply:** Keep route parsing and URL construction in the shared Sudoku route helper. Preserve `mode` when changing setup selections, auto-start valid canonical bookmark routes once auth is ready, and treat `gameId` as the switch for reopening an existing game.