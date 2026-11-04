# Play Brain Games . Online

A cross-platform puzzle hub (Sudoku, memory match, and jigsaw) with leaderboards, daily challenges, tournaments, login-streak rewards, and Google sign-in. It runs as a web app and as Capacitor Android/iOS shells.

This repository is a **pnpm TypeScript monorepo**. Edit the UI in `artifacts/sudoku-game` and the API in `artifacts/api-server`. Shared schema and generated API clients live under `lib/`.

## Architecture

```
Browser / Capacitor app (@workspace/sudoku-game)
        │  Vite /api proxy in development
        ▼
Express API (@workspace/api-server, port 8080)
        │  Zod validation (generated from OpenAPI)
        ▼
Drizzle ORM (@workspace/db)
        ▼
PostgreSQL (local or Neon)
```

API contracts start in `lib/api-spec/openapi.yaml`. Orval codegen produces Zod schemas (`lib/api-zod`) and TanStack Query hooks (`lib/api-client-react`). The API server validates with the generated Zod package; the frontend talks to the API through the generated React client.

`standalone-api-server` is a self-contained deploy snapshot of the API (bundled, no workspace packages). Change backend logic in `artifacts/api-server`, then rebuild the standalone copy when you need to ship it.

Auth is **Passport + Google OAuth 20**, with guest play when Google credentials are not set. Profiles still have a legacy `clerk_user_id` column; Clerk is not the current auth provider.

## Folder structure

```
Cross-Platform-Game/
├── artifacts/                      # Runnable apps
│   ├── sudoku-game/                # React + Vite client, Capacitor native
│   │   ├── android/                # Capacitor Android project
│   │   ├── ios/                    # Capacitor iOS project
│   │   ├── public/                 # PWA manifest, App Links, static assets
│   │   ├── scripts/                # Prerender and puzzle generation
│   │   └── src/
│   │       ├── pages/              # Routes (portal, games, profile, legal)
│   │       ├── components/         # App UI + shadcn/ui primitives
│   │       ├── hooks/              # Auth, theme, rewards, game logic
│   │       ├── lib/                # Client utilities (offline, share, links)
│   │       ├── config/             # Themes, fonts, icons, feature flags
│   │       └── __tests__/          # Vitest unit tests
│   ├── api-server/                 # Express API (source of truth)
│   │   └── src/
│   │       ├── routes/             # HTTP endpoints
│   │       ├── middlewares/        # Session, Google OAuth
│   │       ├── lib/                # Server utilities
│   │       ├── config/             # Theme / puzzle config
│   │       └── __tests__/
│   └── mockup-sandbox/             # Isolated UI mockup playground
├── lib/                            # Shared workspace packages
│   ├── db/                         # Drizzle schema + Postgres access
│   │   └── src/schema/             # tables: auth, profiles, puzzles, games, …
│   ├── api-spec/                   # OpenAPI spec + Orval codegen
│   ├── api-zod/                    # Generated Zod types
│   └── api-client-react/           # Generated React Query hooks
├── standalone-api-server/          # Bundled API for deploys without the monorepo
├── scripts/                        # Workspace hooks (preinstall, post-merge)
├── server/                         # Thin Replit integration glue
├── attached_assets/                # Shared images (Vite alias @assets)
├── screenshots/                    # Visual reference shots
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── tsconfig.json
└── vitest.workspace.ts
```

## Workspace packages

| Package | Path | Role |
|---|---|---|
| `@workspace/sudoku-game` | `artifacts/sudoku-game` | Vite + React client and Capacitor shells |
| `@workspace/api-server` | `artifacts/api-server` | Express 5 API |
| `@workspace/mockup-sandbox` | `artifacts/mockup-sandbox` | Design / mockup Vite app |
| `@workspace/db` | `lib/db` | PostgreSQL + Drizzle schema |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI spec and Orval codegen |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod schemas |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated TanStack Query client |
| `@workspace/scripts` | `scripts` | Utility scripts |

## Stack and tools

| Layer | Tools |
|---|---|
| Monorepo | pnpm 10 workspaces, TypeScript 5.9 project references |
| Client | React 19, Vite 7, Tailwind CSS 4, shadcn/ui (Radix), wouter |
| Data fetching | TanStack Query, Orval-generated hooks |
| Native / PWA | Capacitor 7 (Android + iOS), App / Browser / Filesystem / Share, Play in-app updates |
| API | Node.js, Express 5, esbuild bundle |
| Database | PostgreSQL, Drizzle ORM, drizzle-kit |
| Validation | Zod, drizzle-zod |
| Auth | Passport, Google OAuth 20, express-session, connect-pg-simple |
| Logging / email | Pino, Nodemailer, Resend |
| Tests / format | Vitest, Prettier |
| Hosting | Replit (dev), standalone API for production-style deploys |

Catalog versions for React, Vite, Tailwind, Drizzle, and Zod are pinned in `pnpm-workspace.yaml`.

## Product surface

The client (`artifacts/sudoku-game/src/pages`) includes:

- Portal / home, Sudoku play (including offline and bookmark URLs)
- Memory match, duels, and challenges
- Jigsaw play, challenges, and invites
- Daily challenge, leaderboard, profile, themes, stats
- Guides, about, privacy, terms, account deletion

The API (`artifacts/api-server/src/routes`) covers health, puzzles, games, daily challenges, challenges, leaderboard, profiles, account, stats, badges, achievements, unlocks, tournaments, memory, jigsaw, and invites.

Database tables live under `lib/db/src/schema/`:

- `auth.ts`, `profiles.ts`, `puzzles.ts`, `games.ts`
- `badges.ts`, `daily-challenges.ts`, `challenges.ts`, `unlocked-items.ts`
- `memory-games.ts`, `memory-challenge-completions.ts`, `memory-duels.ts`
- `guest-profile-transfer-codes.ts`, `jigsaw.ts`

## Run and operate

Install from the repo root:

```bash
pnpm install
```

API (port 8080):

```bash
pnpm --filter @workspace/api-server run dev
```

Frontend (port 19093; `/api` is proxied to the API in development):

```bash
PORT=19093 BASE_PATH=/ pnpm --filter @workspace/sudoku-game run dev
```

On Windows, `dev.bat` starts both processes. Keep secrets in local env files or your shell — do not commit credentials.

Workspace commands:

```bash
pnpm run typecheck
pnpm run build
pnpm test
pnpm --filter @workspace/api-spec run codegen   # regenerate clients from OpenAPI
pnpm --filter @workspace/db run push            # push Drizzle schema (dev only)
```

Required environment:

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — session signing secret

Optional:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — enable Google sign-in
- `NEON_DATABASE_URL` — extra Neon connection used by some background jobs
- `VITE_API_BASE_URL` — production API origin for the client build
- `RESEND_API_KEY` — send challenge notification emails
- `RESEND_FROM_EMAIL` — optional override; defaults to `Play Brain Games . Online <admin@playbraingames.online>`

Without Google credentials the app runs in guest-only mode.

## API contract workflow

1. Edit `lib/api-spec/openapi.yaml`.
2. Run `pnpm --filter @workspace/api-spec run codegen`.
3. Implement or adjust routes in `artifacts/api-server`.
4. Consume the generated hooks from `@workspace/api-client-react` in the frontend.

## Native apps

Capacitor config is `artifacts/sudoku-game/capacitor.config.ts` (`appId`: `online.playbraingames.app`). Web build output is `dist/public`. Android App Links live in `artifacts/sudoku-game/public/.well-known/assetlinks.json`.

Native builds use the deployed API at `https://cross-platform-application.onrender.com` by default. Set `VITE_API_BASE_URL` at build time to override it. Rebuild the web assets and run `npx cap sync android` after changing API configuration.
