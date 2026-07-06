// This file is loaded via `node --import ./env-setup.mjs` BEFORE any module
// in the bundle is evaluated — solving the ESM timing problem where lib/db
// reads DATABASE_URL at import time.
//
// On Replit the platform injects correct env vars before the process starts,
// so we must NOT override them.  Locally (no REPL_ID) we use override:true
// so the .env file wins over any stale system-level DATABASE_URL on Windows.
//
// EXCEPTION: DATABASE_URL is always taken from the .env file when present,
// even on Replit. The project was intentionally switched to an external
// Neon Postgres database, so the .env file's DATABASE_URL must win over the
// Replit-managed DB secret.
//
// PORT is always preserved from the command line / workflow — the .env value
// is never allowed to win for PORT because it may differ from what Google
// Cloud Console has registered as the OAuth callback port.

import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { configDotenv } = require('dotenv');

const __dirname = dirname(fileURLToPath(import.meta.url));
const onReplit  = Boolean(process.env.REPL_ID);

// Snapshot vars that must never be overridden by the .env file.
const portBefore           = process.env.PORT;
const nodeEnvBefore        = process.env.NODE_ENV;

const parsed = configDotenv({
  path: resolve(__dirname, '.env'),
  override: !onReplit,   // override stale system env vars locally; respect platform vars on Replit
});

// DATABASE_URL always comes from .env, even on Replit, since this project
// uses an external Neon database rather than the Replit-managed one.
if (parsed?.parsed?.DATABASE_URL) {
  process.env.DATABASE_URL = parsed.parsed.DATABASE_URL;
}

// Restore command-line values that take precedence over the .env file.
if (portBefore    !== undefined) process.env.PORT     = portBefore;
if (nodeEnvBefore !== undefined) process.env.NODE_ENV = nodeEnvBefore;
