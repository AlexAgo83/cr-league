# CR League 0.1.0
Release date: 2026-07-13

## Added
- Defined the CR League product, gameplay, theme, responsive UX, architecture, and implementation roadmap through Logics.
- Scaffolded the Wave 1 monorepo foundation.
- Added repository governance docs.
- Added npm workspace structure.
- Added Vite React web shell under `apps/web`.
- Added Fastify API shell under `apps/api`.
- Added shared TypeScript package under `packages/shared`.
- Added Prisma/PostgreSQL schema shell under `prisma`.
- Added deterministic minor race notes to make replay output less repetitive.
- Added lightweight i18n catalog support for English and French.
- Added race recap copy and timeline labels in English/French.

## Changed
- Improved the garage loop with a post-GP reward summary, separated inventory/offers, and contextual card fit labels.
- Improved the resolved race screen with a player-focused recap, directive summary, next-GP takeaway, and prioritized timeline.

## Fixed
- Added the first private-league playtest loop, guided GP briefing, replay flavor, and English/French UI switching.
- Added the first between-GP progression hook with persisted card inventory, fixed-price card buying, and card consumption.
- Improved the main race desk with a pit-wall treatment, explicit Prepare/Ready/Resolved states, and one visually dominant command per state.
- Added a guarded playtest session restart and a clearer championship dashboard for code, GP state, readiness, leader, standings, garage, and history.
- Added TypeScript, ESLint, Vitest, and validation scripts.
- Added team card inventories, a card purchase endpoint, owned-card validation, and the minimal garage UI.
- Limited visible shop offers to a small recommended set and covered the updated garage flow in unit/e2e tests.
- Added race desk state copy in English/French and unit/e2e coverage for the guided desk states.
- Added `POST /leagues/:leagueId/restart` and covered restart in API, unit, and e2e tests.
