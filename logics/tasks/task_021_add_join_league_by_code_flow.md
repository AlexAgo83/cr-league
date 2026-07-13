## task_021_add_join_league_by_code_flow - Add join league by code flow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 88%
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
- `item_026_add_join_league_by_code_flow`

# Acceptance criteria
- AC1: Join by code succeeds for an active league.
- AC2: Lowercase or mixed-case invite code input works.
- AC3: Unknown codes return 404.
- AC4: Duplicate team names return 409.
- AC5: Resolved current GP blocks late joins with 409.
- AC6: The race simulation accepts the joined roster.
- AC7: Web exposes create and join actions in the existing race desk.
- AC8: Tests, build, lint, i18n, Logics validation, and real DB smoke pass.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/api/src/features/leagues/routes.ts` exposes `POST /leagues/join`.
- request-AC2 -> This task. Proof: `joinLeagueByCode` normalizes invite codes with `trim().toUpperCase()`, and web uppercases input while typing.
- request-AC3 -> This task. Proof: `POST /leagues/join` returns 404 when `joinLeagueByCode` returns `null`.
- request-AC4 -> This task. Proof: `joinLeagueByCode` rejects duplicate team names with `LeagueRuleError`.
- request-AC5 -> This task. Proof: `joinLeagueByCode` rejects joins when current GP status is `resolved`.
- request-AC6 -> This task. Proof: `buildParticipants` now cycles demo templates for rosters larger than the seed demo and tests/smoke resolve after a join.
- request-AC7 -> This task. Proof: `apps/web/src/app/App.tsx` adds join code input and join action beside create.
- request-AC8 -> This task. Proof: API/web tests and `scripts/smoke-league-flow.ts` cover the join path.
- request-AC9 -> This task. Proof: i18n validation and full validation passed on 2026-07-14.
- backlog-AC1 -> This task. Proof: API test `lets a player join an active league by code`.
- backlog-AC2 -> This task. Proof: web test enters lowercase `abc123` and sends `ABC123`.
- backlog-AC3 -> This task. Proof: API test and smoke expect 404 for `NOPE00`.
- backlog-AC4 -> This task. Proof: API test and smoke expect 409 for duplicate team names.
- backlog-AC5 -> This task. Proof: API test and smoke expect 409 after GP resolution.
- backlog-AC6 -> This task. Proof: persisted demo flow test joins before resolving and succeeds.
- backlog-AC7 -> This task. Proof: web app and test include `Join code` and `Join league`.
- backlog-AC8 -> This task. Proof: validation commands below passed.

# Implementation Notes
- Added `JoinLeagueInput` and `joinLeagueByCode` in `apps/api/src/features/leagues/store.ts`.
- Added `POST /leagues/join` in `apps/api/src/features/leagues/routes.ts`.
- Updated the in-memory Prisma fake in `apps/api/src/app.test.ts` with `league.findUnique({ code })` and `team.create`.
- Added web join fields/actions in `apps/web/src/app/App.tsx` and catalog keys in `apps/web/src/i18n/en.json`.
- Updated `scripts/smoke-league-flow.ts` to cover successful join, unknown code, duplicate team, and closed-GP late join.
- Fixed the simulation adapter so joined rosters larger than the demo seed do not fail during resolution.

# Validation
- 2026-07-14: `npm run typecheck` passed.
- 2026-07-14: `npm test` passed.
- 2026-07-14: `npm run build` passed.
- 2026-07-14: `npm run lint` passed.
- 2026-07-14: `logics-manager i18n validate` passed.
- 2026-07-14: temporary Docker PostgreSQL migration and seed passed on DB port 55433.
- 2026-07-14: `npm run smoke:league` passed against temporary PostgreSQL with API port 4974.
- 2026-07-14: `npm run logics:validate` passed.
- 2026-07-14: `logics-manager flow validate req_020_add_join_league_by_code_flow` passed with 0 findings.
- 2026-07-14: `logics-manager flow repair links task_021_add_join_league_by_code_flow` linked the task from the product brief.

# Report
- Implemented minimal join-by-code multiplayer onboarding.
- Scope intentionally excludes auth, ownership, lobby management, invite expiry, and multi-round scheduling.
- Temporary PostgreSQL smoke initially exposed a joined-roster simulation bug; it was fixed and covered.

# AI Context
- Summary: Implement add join league by code flow.
- Keywords: task, implementation, league-code, join-flow, multiplayer-onboarding, smoke-test
- Use when: You need the implementation details for the first multiplayer invite-code flow.
- Skip when: The work is still product shaping or about auth/lobby/season systems.

# Links
- Request: `req_020_add_join_league_by_code_flow`
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
