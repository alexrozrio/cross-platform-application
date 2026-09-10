---
name: Pnpm lockfile discipline
description: How to prevent frozen-install failures when pnpm workspace configuration changes.
---

Keep the pnpm version pinned and validate the lockfile after changing package manifests or pnpm-workspace.yaml. A frozen install must pass before deploying to Render.

**Why:** pnpm records workspace-level configuration such as overrides in pnpm-lock.yaml. Changing that configuration without regenerating and committing the lockfile causes Render's frozen install to fail before the API build starts.

**How to apply:** Use the repository's pinned pnpm version, run `pnpm install --lockfile-only` after workspace configuration changes, then run the lockfile check before pushing. Prefer the standalone API deployment from `standalone-api-server` when no workspace install is needed.