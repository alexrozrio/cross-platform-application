// This file is loaded via `node --import ./env-setup.mjs` BEFORE any module
// in the bundle is evaluated — solving the ESM timing problem where lib/db
// reads DATABASE_URL at import time.
//
// On Replit the platform injects correct env vars before the process starts,
// so we must NOT override them.  Locally (no REPL_ID) we use override:true
// so the .env file wins over any stale system-level DATABASE_URL on Windows.

import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { configDotenv } = require('dotenv');

const __dirname = dirname(fileURLToPath(import.meta.url));
const onReplit  = Boolean(process.env.REPL_ID);

configDotenv({
  path: resolve(__dirname, '.env'),
  override: !onReplit,   // override stale system env vars locally; respect platform vars on Replit
});
