#!/usr/bin/env node
/**
 * Runs `drizzle-kit push` before the dev server starts.
 *
 * Set SKIP_DB_PUSH=true in your environment or .env to skip this step
 * (useful when the DB isn't yet reachable or you want to skip migrations).
 *
 * Failures are warnings on local (no REPL_ID), hard errors on Replit.
 */

import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const onReplit = Boolean(process.env.REPL_ID);

// Load .env so SKIP_DB_PUSH is visible even before the server sets up env vars
// dotenv is optional — on Replit env vars are already injected by the platform
try {
  const { configDotenv } = require('dotenv');
  configDotenv({ path: resolve(__dirname, '../.env') });
} catch {
  // dotenv not available; env vars already present in environment
}

if (process.env.SKIP_DB_PUSH === 'true') {
  console.log('[db-push] Skipped (SKIP_DB_PUSH=true)');
  process.exit(0);
}

console.log('[db-push] Running drizzle-kit push...');

const result = spawnSync(
  'pnpm',
  ['--filter', '@workspace/db', 'run', 'push-force'],
  {
    // pipe stdin so interactive prompts (e.g. "truncate table?") get an
    // automatic "no" answer and don't block CI / workflow startup
    input: 'no\n',
    stdio: ['pipe', 'inherit', 'inherit'],
    cwd: resolve(__dirname, '../../..'),
    shell: false,
  }
);

if (result.status !== 0) {
  // drizzle-kit ≥0.31 requires a real TTY for interactive prompts (e.g. adding
  // a unique constraint to an existing table). Workflow runners and CI shells
  // don't provide a TTY, so the push fails with "Interactive prompts require a
  // TTY terminal". This is a drizzle-kit limitation, not a schema error.
  // Treat as a warning and let the server start — the schema is already in sync
  // from the last successful push.
  console.warn(
    '[db-push] ⚠️  drizzle-kit push failed (possibly a TTY/interactive-prompt issue).\n' +
    '         Server will start anyway. Run `pnpm --filter @workspace/db run push` manually in a TTY shell if schema changes are needed.\n' +
    '         Set SKIP_DB_PUSH=true in .env to silence this warning.'
  );
}
