---
name: Offline completion sync
description: Durable rules for submitting offline Sudoku and Memory Match wins after connectivity returns.
---

When an offline game finishes, attempt the normal server scoring and reward path only when the browser may be online, with a short abort timeout; if the request fails, preserve the local completion result.

**Why:** A browser can report itself online while the API is unreachable, and an in-flight game-create request can otherwise leave the win screen waiting indefinitely.

Completion endpoints must update only rows still marked active, return the stored completed result for retries, and award profile rewards only for the request that changes the row to completed.

**Why:** A lost response or concurrent retry must not duplicate XP, gems, statistics, or completion records.

**How to apply:** Keep client completion guards and bounded requests in both games, and preserve the same idempotent active-state guard whenever completion logic changes.