# Brain Games API Server — Standalone Build

This is a fully self-contained build of the API server. It has **no dependency
on the pnpm workspace, `lib/db`, `lib/api-zod`, or any other package in the
monorepo** — everything (routes, Drizzle schema, Zod validation, Express,
auth, etc.) is bundled into `dist/index.mjs`. `env-setup.mjs` is likewise
bundled and includes `dotenv`, so no `npm install` is required to run it.

## Contents

- `dist/index.mjs` — the entire API server, bundled.
- `dist/pino-*.mjs`, `dist/thread-stream-worker.mjs` — logging worker threads
  used by `pino` at runtime (loaded dynamically, must stay alongside
  `index.mjs`).
- `env-setup.mjs` — loads `.env` and sets `DATABASE_URL` before the server
  starts. Bundled, so it needs no `node_modules`.
- `.env` — your Neon Postgres connection string and other config. **Contains
  secrets — do not commit this to a public repo.**
- `package.json` — just a `start` script, no dependencies to install.

## Running it

```bash
node --import ./env-setup.mjs --enable-source-maps ./dist/index.mjs
```

or

```bash
npm run start
```

Set `PORT` as an environment variable to choose the listening port (defaults
to whatever `PORT` is set to, or falls back to the server's internal
default). Example:

```bash
PORT=8080 npm run start
```

## Updating this build

This folder is a snapshot. If you change the app's source code (routes,
schema, etc.) in the main project, you need to rebuild and re-copy:

1. In the main project: `cd artifacts/api-server && pnpm run build`
2. Copy the refreshed `dist/` folder into this standalone folder, replacing
   the old one.
3. If you change `DATABASE_URL` or other env values, just edit `.env` here —
   no rebuild needed for that.

## Requirements

- Node.js 20+
- Network access to your Neon Postgres database (the `DATABASE_URL` in `.env`)
- No `pnpm install` or `node_modules` needed — the bundle is dependency-free.
