---
name: Clerk JS CDN fix
description: Clerk fails to load its JS bundle on Replit dev domains without an explicit clerkJSUrl.
---

# Clerk JS CDN Fix

## Rule
Set `clerkJSUrl` explicitly in `ClerkProvider` to the official CDN:
```
const clerkJSUrl = "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
```
Pass it as `<ClerkProvider clerkJSUrl={clerkJSUrl} ...>`.

**Why:** Without this, Clerk tries to resolve its JS bundle from the Replit dev domain (e.g. `*.pike.replit.dev`), which fails with `failed_to_load_clerk_js`. The Replit proxy can't serve Clerk's own NPM bundle.

**How to apply:** Always set this when using `@clerk/react` on Replit. Already set in `artifacts/sudoku-game/src/App.tsx`.
