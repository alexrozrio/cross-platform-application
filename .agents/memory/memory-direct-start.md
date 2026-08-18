---
name: Memory Match direct-start routes
description: How Memory Match distinguishes setup bookmarks from links that should open directly into a game.
---

Memory Match canonical level URLs are setup pages by default; a `start=1` query is used only for navigations that should remount into an active game.

**Why:** Changing from `/memory?size=...` to a canonical `/memory/<difficulty>` route remounts the page. Without an explicit start marker, the remounted page correctly treats the URL as setup and the user's click appears to do nothing.

**How to apply:** Home level buttons may use the legacy size query, which auto-starts and canonicalizes to `<difficulty>?start=1`. Plain canonical URLs must continue to open setup, while duel/challenge query parameters must bypass bookmark rewriting.