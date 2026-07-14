---
name: Production Render API uses a separate DB from local dev
description: Why schema/data changes made locally may not appear on the live app, and how to spot it
---

The Sudoku/Memory game frontend's default `VITE_API_BASE_URL` points at an external
Render-hosted API (`cross-platform-application.onrender.com`), not the local
`API Server` workflow. There is no migration-file system (`drizzle-kit push`
is used directly against whatever `DATABASE_URL` is active), so a schema
change pushed against the local/dev Neon DB does not automatically reach
whatever DB the Render deployment uses.

**Why:** Confirmed by observing `GET /api/leaderboard` returning HTTP 500 on
the production Render API while the same route worked fine locally — the
route selects `gamesTable.xpEarned`, a column added in an earlier session,
strongly suggesting the production DB never got that migration.

**How to apply:** When testing "is this feature actually live for users",
hit the production Render URL directly (or ask the user), don't trust the
local dev server's behavior as a proxy for it. If a production 500/schema
mismatch is found, it needs the production `DATABASE_URL` (which this repl
doesn't have) to fix via `drizzle-kit push` — flag it to the user rather than
assuming it's fixed once the local schema changes.
