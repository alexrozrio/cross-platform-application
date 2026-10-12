---
name: Capacitor Node compatibility
description: Version compatibility choice for Capacitor in the Sudoku workspace.
---

Keep Capacitor core, CLI, Android, and iOS packages aligned on a release compatible with the workspace Node runtime. Capacitor 7 supports Node 20; Capacitor 8 CLI requires Node 22.

**Why:** Installing the newer CLI made Capacitor commands fail immediately under this project's Node 20 runtime.

**How to apply:** Before upgrading Capacitor major versions, verify the CLI engine requirement against the configured Node runtime; upgrade Node deliberately if adopting Capacitor 8.
