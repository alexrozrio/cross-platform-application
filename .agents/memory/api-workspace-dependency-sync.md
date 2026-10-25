---
name: Workspace dependency sync
description: Recovery guidance when declared dependencies are missing from installed workspace links.
---

When an app or shared workspace package declares a dependency in its manifest and lockfile but a build still reports a missing module, install the target package together with its workspace dependency closure before changing application code. For example, use `pnpm install --filter @workspace/sudoku-game... --frozen-lockfile` to install the Sudoku app and its workspace dependencies. API TypeScript checks also need workspace library declarations generated first with the root `pnpm run typecheck:libs`.

**Why:** A partial workspace install can leave a declared shared-package dependency unavailable during Vite bundling, which can look like an application-code defect.

**How to apply:** Check the package manifest and lockfile first. If the dependency is already declared, run a frozen filtered install including the target's workspace dependencies, then retry the build. Before API typechecking, run `pnpm run typecheck:libs`; bundle builds may pass while unrelated API type errors remain. For API-server-only runtime failures, also restart the API workflow and verify the affected endpoint.