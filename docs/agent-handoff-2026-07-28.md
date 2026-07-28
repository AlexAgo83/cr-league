# Agent Handoff - 2026-07-28

## Current State
- `req_129` / `task_130` (0.6 beta season lifecycle and league management) is fully **Done and closed**. `item_331` (optional variable shop) shipped; `item_332` and `item_333` are Archived with documented reopen triggers. `prod_081` and specs `spec_004/005/006/009` are Settled.
- **v0.6.0 is released and live in production** (`https://cr-league-api.onrender.com`, web at `https://cr-league.onrender.com`). Tag `v0.6.0`, GitHub Release published, `deploy-release.yml` succeeded, production `/health` confirmed `version: 0.6.0`.
- A whole-repo review after the v0.6.0 release (architecture, security, test/CI health) found no high-severity security issues and no dead code, but surfaced 12 independent code-quality/hardening findings, now scaffolded as **`req_130` / `task_131` ("repo review remediation pass 7")** — Status: Ready, not yet implemented.
- `logics-manager status` reports the pass-7 corpus as the only open workflow chain. `logics-manager lint`/`audit` are clean (only the expected pre-implementation AC-traceability warnings on `req_130`, normal for an unimplemented request).

## Next Work: req_130 / task_131 (repo review remediation pass 7)
12 independent backlog slices, each self-contained (read the backlog doc, no need to re-read prior conversation history):
- `item_335` — add missing `@@index([leagueId])` on `Team` and `GrandPrix` (quick, low-risk).
- `item_336` — fix `testMemoryDb.ts`'s silent `select`-ignoring bug on `grandPrix.findMany`.
- `item_337` — harden `testMemoryDb.ts` further (include/mutation-count drift); **depends on `item_336` landing first** (reuses its shared helper).
- `item_338` — add Playwright E2E coverage for the 0.6 corpus's highest-risk flows (commissioner Race direction, variable shop, team profiles) — currently zero E2E coverage on any of them.
- `item_339` — raise branch coverage on `ReplayProgress.tsx`, `replayMoment.ts`, `useReplayClock.ts`; the repo's branch-coverage threshold (80%) currently has only a 0.65-point margin.
- `item_340` — move `seasonStandings`/`derivedRivalForTeam` from `apps/web/src/app/helpers.ts` into `packages/shared`; disambiguate the derived-rival concept from `RaceDecision.rivalTeamId`.
- `item_341` — rename `apps/api/src/features/admin/store.ts` (filename collision with the `leagues/store.ts` barrel convention).
- `item_342` — split `apps/api/src/features/leagues/lifecycle.ts` (671 lines / 18 exports) by responsibility.
- `item_343` — rate-limit every route under `/admin/*` (currently unthrottled, unlike league write routes).
- `item_344` — **High priority**: hash `Team.claimCode` at rest with a backward-compatible migration. This is not preventive — v0.6.0 is already live, so real leagues/teams created since release already have plaintext `claimCode` rows in the production database today. Validate the legacy-upgrade path against production-shaped data, not only fresh test rows.
- `item_345` — replace hardcoded UI-copy assertions in `tests/e2e/private-league.spec.ts` with `data-testid` (already broke once this session on a button rename).
- `item_346` — optional: CI-only Playwright retries, **only if** real flakiness evidence is found in CI history; otherwise skip and record that in the closeout report.

`task_131`'s suggested sequencing: DB index first -> testMemoryDb select-fix then hardening -> E2E/coverage in parallel -> code-organization batch (standings move, admin rename, lifecycle split) testing after each individually -> admin rate-limit -> claimCode hashing (last among required work, benefits from the rest already landing) -> E2E data-testid -> evaluate CI retries. Keep commits scoped per slice, not one giant commit.

## Validation To Re-run
- `logics-manager lint --require-status`
- `logics-manager audit --group-by-doc`
- `npm run typecheck`
- `npm test` (full suite) and `npx vitest run --coverage`
- `npm run build`
- `npm run test:e2e`
- `npm run balance:gate`
- `npm run logics:validate`

## Watchouts
- `apps/api/src/testMemoryDb.ts` is a hand-rolled in-memory Prisma fake that has already silently diverged from real Prisma semantics twice this session (`include: { teams: true }` boolean shorthand, and the `select`-ignoring bug fixed as part of the v0.6.0 release prep). Treat any change to a real Prisma call's `where`/`include`/`select` shape as a signal to check whether the fake actually handles it.
- `item_344`'s migration touches live production data — do not treat "existing rows" as hypothetical; there are real rows today.
- `item_337`, `item_340`, and `item_342` all touch widely-imported modules (`testMemoryDb.ts`, `apps/web/src/app/helpers.ts`, `apps/api/src/features/leagues/lifecycle.ts`) — run the full test suite after each slice individually, not just at the end.
