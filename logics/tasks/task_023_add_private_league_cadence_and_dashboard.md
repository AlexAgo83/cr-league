## task_023_add_private_league_cadence_and_dashboard - Add private league cadence and dashboard
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
- `item_028_add_private_league_cadence_and_dashboard`

# Acceptance criteria
- AC1: Cadence/deadline persist and roundtrip through API.
- AC2: Invalid cadence is rejected.
- AC3: History returns previous and current GP.
- AC4: Dashboard shows readiness and next action.
- AC5: Local claim can be forgotten.
- AC6: Tests and smoke cover the behavior.
- AC7: Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: Prisma `League.cadence` and `preparationDeadlineAt`.
- request-AC2 -> This task. Proof: `updateLeagueSettings` validates supported cadence values.
- request-AC3 -> This task. Proof: `LeagueState.grandPrixHistory`.
- request-AC4 -> This task. Proof: `Team.ready` and `actionState.nextAction`.
- request-AC5 -> This task. Proof: dashboard renders cadence, next action, player team, readiness, and history.
- request-AC6 -> This task. Proof: `Forget team` clears localStorage claim.
- request-AC7 -> This task. Proof: smoke updates settings and asserts history.
- request-AC8 -> This task. Proof: validation commands below.
- backlog-AC1 -> This task. Proof: API test updates weekly cadence/deadline.
- backlog-AC2 -> This task. Proof: API test rejects `always_on`.
- backlog-AC3 -> This task. Proof: API test expects rounds `[2, 1]`.
- backlog-AC4 -> This task. Proof: web test renders readiness and next-GP flow.
- backlog-AC5 -> This task. Proof: web test forgets local claim.
- backlog-AC6 -> This task. Proof: tests and smoke updated.
- backlog-AC7 -> This task. Proof: validation commands passed.

# Implementation Notes
- Added migration `20260714213000_add_league_cadence`.
- Added `POST /leagues/:leagueId/settings`.
- Expanded `LeagueState` with cadence, deadline, GP history, per-team readiness, and next action.
- Updated web dashboard with settings controls, readiness labels, player team, claim reset, and GP history.

# Validation
- 2026-07-14: `npm run db:generate` passed.
- 2026-07-14: `npm run typecheck` passed.
- 2026-07-14: `npm test` passed.
- 2026-07-14: `npm run build` passed.
- 2026-07-14: `npm run lint` passed.
- 2026-07-14: `logics-manager i18n validate` passed.
- 2026-07-14: temporary Docker PostgreSQL migration and seed passed on DB port 55435.
- 2026-07-14: `npm run smoke:league` passed against temporary PostgreSQL with API port 4976.
- 2026-07-14: `npm run logics:validate` passed.
- 2026-07-14: `logics-manager flow validate req_022_add_private_league_cadence_and_dashboard` passed with 0 findings.
- 2026-07-14: `logics-manager flow validate-closeout task_023_add_private_league_cadence_and_dashboard` passed.
- 2026-07-14: `logics-manager flow repair links task_023_add_private_league_cadence_and_dashboard` linked the task from the product brief.

# Report
- Added manual cadence/deadline settings and a clearer private league dashboard.
- Scheduler workers, notifications, permissions, richer layout, replay polish, and economy remain out of scope.

# AI Context
- Summary: Implement private league cadence settings and dashboard clarity.
- Keywords: task, cadence, deadline, dashboard, readiness, history, local-claim
- Use when: Reviewing private league dashboard implementation.
- Skip when: Work is still product shaping or about scheduler/auth/economy.

# Links
- Request: `req_022_add_private_league_cadence_and_dashboard`
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_001_cr_league_v1_static_pwa_api_architecture`
