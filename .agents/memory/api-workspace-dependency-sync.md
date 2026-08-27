---
name: API workspace dependency sync
description: Recovery guidance when the API package declares dependencies that are missing from its installed workspace links.
---

When the API package's dependencies are present in its package manifest and lockfile but the API build reports missing modules, sync the filtered API workspace with pnpm before changing application code.

**Why:** A stale or partial workspace install can prevent the API process from starting at all, which makes device-based guest profile creation look like an authentication or frontend regression.

**How to apply:** Check the API workflow logs for module-resolution failures, run the package manager sync for `@workspace/api-server` with network access if the offline store is incomplete, restart the API workflow, and verify `POST /api/profiles/sync` with a device ID.