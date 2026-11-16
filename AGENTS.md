# Project notes

## Verification policy (user preference)

Do NOT run the full test suite for routine changes — it is slow and the user
only wants it at release time.

- **Routine changes** (UI copy, labels, styling, small features): verify with
  a targeted typecheck of touched files and/or a package build
  (`pnpm --filter @workspace/sudoku-game build`). Rebuild + prerender the
  frontend after any `artifacts/sudoku-game` change so `dist/public` and the
  preview server reflect it.
- **Release / explicit request**: run the full suite with `pnpm test:full`
  (same as `pnpm test` — `vitest run`, all projects) plus build + prerender.
- **Middle ground**: `pnpm test:changed` runs only tests related to files
  changed vs git HEAD (`vitest related`).

## Layout

- Frontend: `artifacts/sudoku-game` (React + Vite + Wouter). Build also
  prerenders public routes into `dist/public` (55 routes).
- API: `artifacts/api-server` (Express + Drizzle). Start with
  `node --env-file=.env.local --import ./env-setup.mjs ./dist/index.mjs`
  (env-setup only reads `.env`, which does not exist locally — `.env.local`
  must be passed via `--env-file`).
- Shared quiz/zod types: `lib/api-zod`.

## Conventions

- All non-Sudoku games use canonical level names Easy / Medium / Hard /
  Expert for display. Internal ids (`beginner`, `2x2`, memory grid sizes,
  jigsaw `level` 1–3) must NOT be renamed — they are stored in DB stats,
  challenges, and URLs. Display labels live in `src/lib/*` configs
  (`MINESWEEPER_LEVELS`, `WORD_SEARCH_LEVELS`, `SLIDE_PUZZLE_LEVELS`,
  `JIGSAW_SIZE_NAMES`, memory `GRID_OPTIONS`).
- Jigsaw assist levels are Guided / Assisted / Challenging
  (`JIGSAW_LEVELS` in `src/lib/jigsaw-session.ts`) — do not reuse
  Easy/Medium/Hard for them.
- Sudoku keeps its own grid/difficulty naming — do not apply the canonical
  level names there.
- Level options show the canonical name as the primary label with concrete
  specs (grid size, pairs, mines, words, tiles, questions) as sub-text,
  consistently across portal, game screens, results, challenges,
  leaderboards, duels, and profile.
