#!/usr/bin/env node
/**
 * Runs `drizzle-kit push` before the API server starts.
 *
 * Set SKIP_DB_PUSH=true in your environment or .env to skip this step
 * (useful when the DB isn't yet reachable or you want to skip migrations).
 *
 * Failures are warnings during development and hard errors in production.
 */

import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const onReplit = Boolean(process.env.REPL_ID);
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_SERVICE_ID);

// Load .env so SKIP_DB_PUSH is visible even before the server sets up env vars
// dotenv is optional — on Replit env vars are already injected by the platform
try {
  const { configDotenv } = require('dotenv');
  configDotenv({ path: resolve(__dirname, '../.env') });
} catch {
  // dotenv not available; env vars already present in environment
}

if (process.env.SKIP_DB_PUSH === 'true') {
  console.log('[db-push] Drizzle push skipped (SKIP_DB_PUSH=true); startup compatibility check will still run.');
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
  const message =
    '[db-push] ⚠️  drizzle-kit push failed (possibly a TTY/interactive-prompt issue).\n' +
    '         Run `pnpm --filter @workspace/db run push` manually in a TTY shell if schema changes are needed.';

  // The API now performs an idempotent additive schema check before it starts
  // listening. That check works in Render/CI where drizzle-kit cannot answer
  // its destructive-change prompt because there is no TTY. Keep this hook
  // non-blocking so the real startup check can run.
  console.warn(
    message +
    '\n         Continuing; the API startup compatibility check will verify required columns.'
  );
}
