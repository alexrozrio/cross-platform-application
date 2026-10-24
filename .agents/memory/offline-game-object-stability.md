---
name: Offline game object stability
description: Constraint for React game fallbacks that initialize local puzzle state from storage.
---

Fallback data used by a state-initialization effect must have stable object identity across renders. Do not parse localStorage or construct a new game-shaped object inline during render when the effect depends on that object.

**Why:** A Sudoku cell selection caused a rerender; the inline offline object was recreated, the initialization effect treated it as a new game, and repeated state writes eventually hit React error #185 (maximum update depth exceeded).

**How to apply:** Memoize parsed fallback data and the derived game object. Treat API errors as an offline state when the local game can continue, and keep the error-boundary fallback independent from the crashing game component.

Core Sudoku and Memory gameplay must remain available when the API or database is unavailable. Game startup must not wait for profile or database sync; remote creation, profile data, and rewards are best-effort, while users can continue with local game state.

**Why:** The user requires the app to avoid a blocking error screen and remain playable during database outages.

**How to apply:** Start from local or bundled game data, keep API attempts bounded and non-blocking, and make recovery UI offer playable local games rather than technical error details.