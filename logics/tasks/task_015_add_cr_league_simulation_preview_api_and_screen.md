## task_015_add_cr_league_simulation_preview_api_and_screen - Add CR League simulation preview API and screen
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
- `item_020_add_cr_league_simulation_preview_api_and_screen`

# Acceptance criteria
- AC1: API preview endpoint is available from the running Fastify app.
- AC2: Web preview renders the demo result and can rerun it.
- AC3: Invalid API input is handled as a client error.
- AC4: Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/api/src/features/simulation/routes.ts` registers `POST /simulation/preview`.
- request-AC2 -> This task. Proof: `packages/shared/src/simulation/demoRace.ts` exports `DEMO_RACE_INPUT`.
- request-AC3 -> This task. Proof: preview route returns 400 for invalid non-empty bodies.
- request-AC4 -> This task. Proof: `apps/web/src/app/App.tsx` renders loading/error states, classification, key events, and report blocks.
- request-AC5 -> This task. Proof: `apps/api/src/app.test.ts` and `apps/web/src/app/App.test.tsx` cover the preview path.
- request-AC6 -> This task. Proof: validation commands passed on 2026-07-13.
- request-AC7 -> This task. Proof: no DB, auth, scheduling, inventory persistence, or multiplayer state was introduced.
- backlog-AC1 -> This task. Proof: Fastify registers the preview endpoint from `buildApp`.
- backlog-AC2 -> This task. Proof: web preview loads and can rerun the demo via button.
- backlog-AC3 -> This task. Proof: malformed preview bodies receive a 400 response.
- backlog-AC4 -> This task. Proof: validation commands passed on 2026-07-13.

# Validation
- 2026-07-13: `npm run typecheck` passed.
- 2026-07-13: `npm test` passed.
- 2026-07-13: `npm run build` passed.
- 2026-07-13: `npm run lint` passed.
- 2026-07-13: `npm run logics:validate` passed.
- 2026-07-13: `logics-manager flow validate req_014_add_cr_league_simulation_preview_api_and_screen` passed with 0 findings.
- 2026-07-13: local smoke test passed with API `POST /simulation/preview` returning 200, invalid input returning 400, and Vite serving the web app on `http://localhost:4873/`.
- npm run typecheck; npm test; npm run build; npm run lint; npm run logics:validate; logics-manager flow validate req_014_add_cr_league_simulation_preview_api_and_screen
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Implemented the minimal simulation preview path from Fastify API to React UI.
- Kept DB/auth/scheduling/multiplayer state out of scope.
- Validation passed: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run logics:validate`, `logics-manager flow validate req_014_add_cr_league_simulation_preview_api_and_screen`.
- Local runtime smoke test passed for API and web.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_020_add_cr_league_simulation_preview_api_and_screen`
- Related request(s): `req_014_add_cr_league_simulation_preview_api_and_screen`

# AI Context
- Summary: Implement add cr league simulation preview api and screen.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_014_add_cr_league_simulation_preview_api_and_screen`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
