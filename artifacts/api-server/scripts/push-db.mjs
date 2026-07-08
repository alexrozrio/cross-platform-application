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
const { configDotenv } = require('dotenv');

const __dirname = dirname(fileURLToPath(import.meta.url));
const onReplit = Boolean(process.env.REPL_ID);

// Load .env so SKIP_DB_PUSH is visible even before the server sets up env vars
configDotenv({ path: resolve(__dirname, '../.env') });

if (process.env.SKIP_DB_PUSH === 'true') {
  console.log('[db-push] Skipped (SKIP_DB_PUSH=true)');
  process.exit(0);
}

console.log('[db-push] Running drizzle-kit push...');

const result = spawnSync(
  'pnpm',
  ['--filter', '@workspace/db', 'run', 'push'],
  {
    stdio: 'inherit',
    cwd: resolve(__dirname, '../../..'),
    shell: false,
  }
);

if (result.status !== 0) {
  if (onReplit) {
    // On Replit the DB is always available — a failure is a real error.
    console.error('[db-push] ❌ drizzle-kit push failed. Aborting startup.');
    process.exit(1);
  } else {
    // Locally the DB might not be running yet — warn and continue.
    console.warn(
      '[db-push] ⚠️  drizzle-kit push failed (is your DB running?).\n' +
      '         Server will start anyway. Run `pnpm --filter @workspace/db run push` manually when the DB is ready.\n' +
      '         Set SKIP_DB_PUSH=true in .env to silence this warning.'
    );
  }
}
