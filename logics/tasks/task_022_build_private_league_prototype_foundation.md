## task_022_build_private_league_prototype_foundation - Build private league prototype foundation
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 86%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_027_build_private_league_prototype_foundation`

# Acceptance criteria
- AC1: Created/joined teams receive claim codes.
- AC2: Valid claims can rejoin league state.
- AC3: Invalid claims are rejected.
- AC4: Resolved GP can advance to next GP.
- AC5: Unresolved GP cannot advance.
- AC6: Resolve can run with defaults when explicitly allowed.
- AC7: League state exposes submitted/missing team counts.
- AC8: Web persists player claim and offers next-GP control.
- AC9: Migration/seed/tests/smoke/validation pass.

# AC Traceability
- request-AC1 -> This task. Proof: `Team.claimCode` added and generated in create/join flows.
- request-AC2 -> This task. Proof: `POST /leagues/rejoin` returns state for a valid team claim.
- request-AC3 -> This task. Proof: `POST /leagues/:leagueId/next-grand-prix` creates round + 1 after resolution.
- request-AC4 -> This task. Proof: `startNextGrandPrix` returns 409 for unresolved current GP.
- request-AC5 -> This task. Proof: `resolveCurrentGrandPrix` supports `allowDefaults`.
- request-AC6 -> This task. Proof: `LeagueState.actionState` exposes submitted and missing teams.
- request-AC7 -> This task. Proof: web stores/rejoins local claim, shows ready/missing counts, and adds `Next GP`.
- request-AC8 -> This task. Proof: Prisma schema, migration, and seed include claim codes.
- request-AC9 -> This task. Proof: validation commands passed on 2026-07-14.
- backlog-AC1 -> This task. Proof: API create/join responses include `player.claimCode`.
- backlog-AC2 -> This task. Proof: API and web tests cover rejoin.
- backlog-AC3 -> This task. Proof: API test rejects bad claim with 404.
- backlog-AC4 -> This task. Proof: API test and smoke start round 2.
- backlog-AC5 -> This task. Proof: API test rejects early next-GP call.
- backlog-AC6 -> This task. Proof: API test resolves with `{ allowDefaults: true }`.
- backlog-AC7 -> This task. Proof: tests assert ready/missing state.
- backlog-AC8 -> This task. Proof: `App.tsx` uses localStorage claim and next-GP action.
- backlog-AC9 -> This task. Proof: validation section below.

# Implementation Notes
- Added nullable unique `Team.claimCode` and migration `20260714203000_add_team_claim_code`.
- Added `player` and `actionState` to `LeagueState`.
- Added `rejoinLeague`, `startNextGrandPrix`, and default-enabled resolution in `apps/api/src/features/leagues/store.ts`.
- Added `POST /leagues/rejoin` and `POST /leagues/:leagueId/next-grand-prix`.
- Updated web local claim handling, automatic rejoin, ready/missing display, and next-GP action.
- Updated smoke coverage for rejoin, defaulted resolve, and GP advancement.

# Validation
- 2026-07-14: `npm run db:generate` passed.
- 2026-07-14: `npm run typecheck` passed.
- 2026-07-14: `npm test` passed.
- 2026-07-14: `npm run build` passed.
- 2026-07-14: `npm run lint` passed.
- 2026-07-14: `logics-manager i18n validate` passed.
- 2026-07-14: `npm run logics:validate` passed.
- 2026-07-14: `logics-manager flow validate req_021_build_private_league_prototype_foundation` passed with 0 findings.
- 2026-07-14: temporary Docker PostgreSQL migration and seed passed on DB port 55434.
- 2026-07-14: `npm run smoke:league` passed against temporary PostgreSQL with API port 4975.
- 2026-07-14: `logics-manager flow repair links task_022_build_private_league_prototype_foundation` linked the task from the product brief.

# Report
- Implemented the smallest private-league foundation needed for roadmap `0.2`.
- Full auth, league ownership, scheduled workers, notifications, and economy depth remain explicitly out of scope.

# AI Context
- Summary: Implement first 0.2 private league prototype foundation.
- Keywords: task, private-league, rejoin, claim-code, next-grand-prix, default-decisions
- Use when: Reviewing the implementation details for private league prototype mechanics.
- Skip when: The work is still product shaping or about auth/economy/production deployment.

# Links
- Request: `req_021_build_private_league_prototype_foundation`
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_001_cr_league_v1_static_pwa_api_architecture`
