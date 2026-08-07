---
name: Offline game object stability
description: Constraint for React game fallbacks that initialize local puzzle state from storage.
---

Fallback data used by a state-initialization effect must have stable object identity across renders. Do not parse localStorage or construct a new game-shaped object inline during render when the effect depends on that object.

**Why:** A Sudoku cell selection caused a rerender; the inline offline object was recreated, the initialization effect treated it as a new game, and repeated state writes eventually hit React error #185 (maximum update depth exceeded).

**How to apply:** Memoize parsed fallback data and the derived game object. Treat API errors as an offline state when the local game can continue, and keep the error-boundary fallback independent from the crashing game component.