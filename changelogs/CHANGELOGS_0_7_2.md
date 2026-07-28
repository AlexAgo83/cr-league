# CR League 0.7.2
Release date: 2026-07-28

This is the shipped 0.7 release. It supersedes the `v0.7.0` and `v0.7.1` release attempts, which were published before CI/deploy were fully green.

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
- Removed an unused shared-engine test import that made the GitHub CI lint job fail on `v0.7.0`.
- Updated the Playwright private-league setup helper to enter the Multiplayer path after the new Solo / Multiplayer choice screen.
- Updated an obsolete E2E assertion so the garage empty-inventory asset is allowed.

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run balance:gate`
- `npm run test:e2e -- --project=chromium --trace=retain-on-failure`
- `npx vitest run packages/shared/src/domain/leagueEngine.test.ts apps/api/src/app.test.ts apps/api/src/app.postgres.test.ts apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/soloStorage.test.ts apps/web/src/i18n/index.test.ts --environment jsdom`
- `logics-manager lint --require-status`
- `logics-manager audit --group-by-doc`
