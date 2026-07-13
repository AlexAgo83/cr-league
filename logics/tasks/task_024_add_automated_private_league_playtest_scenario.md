## task_024_add_automated_private_league_playtest_scenario - Add automated private league playtest scenario
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
- `item_029_add_automated_private_league_playtest_scenario`

# Acceptance criteria
- AC1: `npm run test:e2e` runs Playwright.
- AC2: Browser test covers create/configure/submit/resolve/next GP across three rounds.
- AC3: API test covers three resolved GP and standings/history assertions.
- AC4: Existing validation remains green.
- AC5: Artifacts are not accidentally committed.

# AC Traceability
- request-AC1 -> This task. Proof: root `package.json` includes `test:e2e`.
- request-AC2 -> This task. Proof: `playwright.config.ts` serves web on port 4978.
- request-AC3 -> This task. Proof: `tests/e2e/private-league.spec.ts`.
- request-AC4 -> This task. Proof: `apps/api/src/app.test.ts` includes 3-GP scenario.
- request-AC5 -> This task. Proof: `.gitignore` ignores Playwright artifacts.
- request-AC6 -> This task. Proof: README validation list includes `npm run test:e2e`.
- request-AC7 -> This task. Proof: validation commands below.
- backlog-AC1 -> This task. Proof: `npm run test:e2e` passed.
- backlog-AC2 -> This task. Proof: E2E loops through three GP.
- backlog-AC3 -> This task. Proof: API scenario asserts history `[3, 2, 1]` and awarded points.
- backlog-AC4 -> This task. Proof: existing gates passed.
- backlog-AC5 -> This task. Proof: `test-results/` and `playwright-report/` ignored.

# Implementation Notes
- Added dev dependency `@playwright/test`.
- Added `playwright.config.ts`.
- Added `tests/e2e/private-league.spec.ts` with mocked API responses to isolate UI flow.
- Added a Fastify API 3-GP scenario test.

# Validation
- 2026-07-14: `npm run typecheck` passed.
- 2026-07-14: `npm test` passed.
- 2026-07-14: `npm run test:e2e` passed.
- 2026-07-14: `npm run build` passed.
- 2026-07-14: `npm run lint` passed.
- 2026-07-14: `npm run logics:validate` passed.
- 2026-07-14: `logics-manager flow validate req_023_add_automated_private_league_playtest_scenario` passed with 0 findings.
- 2026-07-14: `logics-manager flow repair links task_024_add_automated_private_league_playtest_scenario` linked the task from the product brief.
- 2026-07-14: `logics-manager flow validate-closeout task_024_add_automated_private_league_playtest_scenario` passed.

# Report
- Added automated private league playtest coverage without adding CI/browser matrix complexity.
- Real PostgreSQL coverage remains in `npm run smoke:league`; Playwright mocks API by design for fast UI checks.

# AI Context
- Summary: Implement automated 3-GP private league API and Playwright coverage.
- Keywords: task, playwright, e2e, private-league, three-gp, test
- Use when: Reviewing automated playtest scenario implementation.
- Skip when: The work is still planning or about production CI/visual regression.

# Links
- Request: `req_023_add_automated_private_league_playtest_scenario`
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_008_testing_quality`
