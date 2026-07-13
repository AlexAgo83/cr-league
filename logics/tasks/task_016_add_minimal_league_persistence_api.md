## task_016_add_minimal_league_persistence_api - Add minimal league persistence API
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
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
- `item_021_add_minimal_league_persistence_api`

# Acceptance criteria
- AC1: Minimal Prisma schema exists.
- AC2: League API endpoints are registered when a DB dependency is provided.
- AC3: API tests cover create/read/decision/resolve flow.
- AC4: Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: `prisma/schema.prisma` defines `League`, `Team`, `GrandPrix`, and `RaceDecision`.
- request-AC2 -> This task. Proof: `apps/api/src/db/client.ts`, `apps/api/src/server.ts`, and `buildApp` DB dependency wiring.
- request-AC3 -> This task. Proof: `POST /leagues` creates demo league teams and current Grand Prix.
- request-AC4 -> This task. Proof: `GET /leagues/:leagueId` reads league state.
- request-AC5 -> This task. Proof: `POST /leagues/:leagueId/decisions` upserts current GP decisions.
- request-AC6 -> This task. Proof: `POST /leagues/:leagueId/resolve` runs `simulateRace`, stores result, and increments team rewards.
- request-AC7 -> This task. Proof: `apps/api/src/app.test.ts` covers the league flow with an in-memory Prisma fake.
- request-AC8 -> This task. Proof: validation commands passed on 2026-07-13.
- request-AC9 -> This task. Proof: frontend gameplay, auth, invite flow, inventory persistence, and scheduling were not implemented.
- backlog-AC1 -> This task. Proof: minimal Prisma schema exists.
- backlog-AC2 -> This task. Proof: league routes are registered when `buildApp` receives a DB dependency.
- backlog-AC3 -> This task. Proof: API test covers create/read through response state, decision upsert, and resolve.
- backlog-AC4 -> This task. Proof: validation commands passed on 2026-07-13.

# Validation
- 2026-07-13: `npx prisma generate` passed.
- 2026-07-13: `npm run typecheck` passed.
- 2026-07-13: `npm test` passed.
- 2026-07-13: `npm run build` passed.
- 2026-07-13: `npm run lint` passed.
- 2026-07-13: `DATABASE_URL='postgresql://user:password@localhost:5432/cr_league?schema=cr_league' npx prisma validate` passed.
- 2026-07-13: `npm run logics:validate` passed.
- 2026-07-13: `logics-manager flow validate req_015_add_minimal_league_persistence_api` passed with 0 findings.
- npx prisma generate; npm run typecheck; npm test; npm run build; npm run lint; DATABASE_URL=postgresql://user:password@localhost:5432/cr_league?schema=cr_league npx prisma validate; npm run logics:validate; logics-manager flow validate req_015_add_minimal_league_persistence_api
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Added minimal Prisma-backed league persistence API.
- Kept frontend gameplay, auth, invite flow, inventory persistence, scheduling, and production migration execution out of scope.
- Validation passed: `npx prisma generate`, `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, Prisma schema validate with `DATABASE_URL`, `npm run logics:validate`, `logics-manager flow validate req_015_add_minimal_league_persistence_api`.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_021_add_minimal_league_persistence_api`
- Related request(s): `req_015_add_minimal_league_persistence_api`

# AI Context
- Summary: Implement add minimal league persistence api.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_015_add_minimal_league_persistence_api`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
