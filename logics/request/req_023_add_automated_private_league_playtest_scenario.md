## req_023_add_automated_private_league_playtest_scenario - Add automated private league playtest scenario
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 88%
> Complexity: High
> Theme: Testing and playtest
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add automated checks that exercise the private league prototype like an early playtest, not only isolated unit paths.
- Cover a 3 Grand Prix loop at API level and a browser-level user flow through create, configure, submit, resolve, and advance.
- Keep the E2E setup small: one Playwright project, one browser, mocked API for the web test, and no CI matrix yet.

# Context
- The 0.2 prototype now supports rejoin, cadence, readiness, GP history, defaulted resolution, and next-GP progression.
- Before adding economy or replay polish, the project needs a repeatable way to verify that the loop can survive several GP.
- Existing `smoke:league` still verifies the real API + PostgreSQL path; Playwright should complement it by checking UI behavior.

# Acceptance criteria
- AC1: Root scripts include a browser E2E command.
- AC2: Playwright is configured for the web app on a non-default local port.
- AC3: E2E covers a three-GP private league UI loop.
- AC4: API tests cover a three-GP private league scenario against the Fastify app.
- AC5: Generated Playwright artifacts are ignored.
- AC6: README documents the new validation command.
- AC7: Validation passes.

# AC Traceability
- AC1 -> `task_024_add_automated_private_league_playtest_scenario`. Proof: `npm run test:e2e`.
- AC2 -> `task_024_add_automated_private_league_playtest_scenario`. Proof: `playwright.config.ts`.
- AC3 -> `task_024_add_automated_private_league_playtest_scenario`. Proof: `tests/e2e/private-league.spec.ts`.
- AC4 -> `task_024_add_automated_private_league_playtest_scenario`. Proof: `apps/api/src/app.test.ts`.
- AC5 -> `task_024_add_automated_private_league_playtest_scenario`. Proof: `.gitignore`.
- AC6 -> `task_024_add_automated_private_league_playtest_scenario`. Proof: `README.md`.
- AC7 -> `task_024_add_automated_private_league_playtest_scenario`. Proof: validation commands passed on 2026-07-14.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_008_testing_quality`

# References
- `playwright.config.ts`
- `tests/e2e/private-league.spec.ts`
- `apps/api/src/app.test.ts`

# AI Context
- Summary: Add automated 3-GP private league playtest coverage through API and browser E2E.
- Keywords: playwright, e2e, playtest, private-league, three-gp, validation
- Use when: Reviewing automated private league playtest coverage.
- Skip when: Work is about manual playtest notes, card economy, or replay rendering.

# Backlog
- `item_029_add_automated_private_league_playtest_scenario`
