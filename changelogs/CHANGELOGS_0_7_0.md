# CR League 0.7.0
Release date: 2026-07-28

## Added
- Added the Solo / Multiplayer entry split after the splash screen. Solo now starts before profile setup; Multiplayer keeps the existing profile-backed create, join, and saved league flow.
- Added a one-slot Solo save under `cr-league-solo-save-v1`, isolated from multiplayer profile/session/claim storage.
- Added local Solo gameplay through the first GP loop: briefing, plan, chrono, directive lock, GP resolution, replay/report, next GP, garage card buy/sell, paid car unlocks, livery update, team rename, and confirmed Solo reset.
- Added a compact `Solo` badge in the game topbar when the active league is the local Solo save.

## Changed
- Moved league gameplay rules into the shared engine so Solo localStorage and multiplayer API persistence use the same state transitions.
- API-backed card buy/sell, paid car unlock, livery update, team rename, GP resolution, and next-GP lifecycle now execute shared engine rules before persisting DB deltas.
- Solo hides API-only league controls such as commissioner settings, reminders, and league restart.

## Fixed
- Fixed a GP resolution inventory-write regression from the shared-engine API refactor: the API now locks teams before resolving and only writes card inventories when consumed cards actually change them.
- Kept GP resolution and next-GP concurrency guarded with row locks and the existing unique transition claim.

## Validation
- `npm run typecheck -w @cr-league/shared`
- `npm run typecheck -w @cr-league/api`
- `npm run typecheck -w @cr-league/web`
- `npx vitest run packages/shared/src/domain/leagueEngine.test.ts apps/api/src/app.test.ts apps/api/src/app.postgres.test.ts --environment node`
- `npx vitest run packages/shared/src/domain/leagueEngine.test.ts apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/soloStorage.test.ts apps/web/src/i18n/index.test.ts --environment jsdom`
- `npm run build -w @cr-league/web`
- `logics-manager lint --require-status`
- `logics-manager audit --group-by-doc`
