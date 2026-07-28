# Agent Handoff - 2026-07-28 (repo review remediation pass 7 closeout)

Supersedes `docs/agent-handoff-2026-07-28.md`, which described this corpus before implementation.

## Current State
- **`req_130` / `task_131` (repo review remediation pass 7) is Done and closed.** All 12 backlog slices (`item_335`-`item_346`) are Done; `prod_082` is Settled.
- `logics-manager status` reports **zero open workflow docs**. `logics-manager lint --require-status` and `audit --group-by-doc` are clean (0 blocking, 0 warnings).
- v0.6.0 remains the released version in production. **Nothing from this pass has been released yet** — it is all on `main`, unreleased.

## What Landed (one commit per slice)
| Slice | Change |
|---|---|
| `item_335` | `@@index([leagueId])` on `Team` and `GrandPrix` + migration `20260728160000_add_league_id_indexes` |
| `item_336` | shared `applySelect` helper in `testMemoryDb.ts`; `select` now honoured (the `grandPrix.findMany` bug is fixed) |
| `item_337` | `include` gating on `team`/`league`/`profile` finders, relation `take` honoured, real `deleteMany` counts |
| `item_338` | 3 new Playwright scenarios: Race direction + reminder, variable shop, team profile (suite 4 -> 7) |
| `item_339` | branch coverage on `replayMoment` / `ReplayProgress` / `useReplayClock`; repo branch 80.83% -> 81.72% |
| `item_340` | `seasonStandings` + renamed `standingsRival` moved to `packages/shared/src/domain/standings.ts` |
| `item_341` | `admin/store.ts` -> `admin/adminData.ts` |
| `item_342` | `lifecycle.ts` 671 -> 375 lines; new `leagueState.ts`, `teamAdmin.ts`, `reminders.ts`, `visibility.ts` |
| `item_343` | `ADMIN_RATE_LIMIT` 20/min on all six `/admin/*` routes |
| `item_344` | `Team.claimCodeHash` + migration `20260728170000_hash_team_claim_code`, legacy accept-once-then-upgrade |
| `item_345` | `data-testid` for structural E2E locators; tabs reuse the existing `data-section-tab` |
| `item_346` | **deliberately not implemented** — no CI flakiness evidence; recorded on the backlog doc |

## Before The Next Release
- **`item_344` ships a Prisma migration that touches live data.** `20260728170000_hash_team_claim_code` only adds a nullable `claimCodeHash` column, so the deploy itself is safe and reversible. There is **no backfill**: pre-migration teams keep their plaintext `claimCode` until each one claims once, at which point the row is rewritten to hash-only. That is by design — the plaintext is the only input that can produce the hash.
- Residual risk to decide on, not a bug: teams that never claim again keep a plaintext code in the database forever. Clearing that would mean invalidating and re-issuing claim codes. Deliberately out of scope here.
- `20260728160000_add_league_id_indexes` creates two non-concurrent indexes. Fine at current table sizes; if the production tables have grown, consider `CREATE INDEX CONCURRENTLY` instead.

## Validation (all green at closeout)
- `npm run typecheck`, `npm run lint`, `npm run build`
- `npm test` — 405 passed, 9 skipped (was 373/7 before the pass)
- `npx vitest run --coverage` — branches 81.72% vs the 80% threshold
- `npm run test:e2e` — 7 passed
- `POSTGRES_INTEGRATION=1 DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55437/cr_league npx vitest run apps/api/src/app.postgres.test.ts` — 9 passed (a `postgres:16-alpine` container is already running locally as `cr-league-playtest`)
- `npm run balance:gate` — exit 0
- `npm run logics:validate`

## Candidates For Next Work (evidence-gated, nothing scaffolded)
- **Coverage follow-up**: `item_339` hit its AC but the global margin is 1.72 points. The remaining weak files are outside that slice's scope: `apps/web/src/app/pwa.ts` (23% branch), `adminActions.ts` (42%), `mailer.ts` (43%), several `*Actions.ts` at 50-63%.
- **Claim-code residue**: decide whether to invalidate and re-issue the plaintext codes that will never self-upgrade.
- Still parked in the roadmap watchlist, unchanged: Prisma 7 / ESLint 10 migrations (they are the recurring CI failures), and JSON-column normalization.

## Watchouts That Survive This Pass
- `apps/api/src/testMemoryDb.ts` is still a hand-rolled fake. It is much closer to real Prisma now (select, include gating, relation `take`, mutation counts, all pinned by `testMemoryDb.test.ts`), but any new `where`/`include`/`select` shape in a real call still needs checking against it.
- `packages/shared/src/domain/standings.ts` has the only *derived* rival (`standingsRival`). The explicit `RaceDecision.rivalTeamId` is a different mechanism; both now carry cross-reference comments. Do not merge them.
