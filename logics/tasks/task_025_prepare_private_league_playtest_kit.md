## task_025_prepare_private_league_playtest_kit - Prepare private league playtest kit
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
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
- `item_030_prepare_private_league_playtest_kit`

# Acceptance criteria
- AC1: A manual 3-GP private league playtest checklist exists with setup, scenario, observation prompts, questions, and known limits.
- AC2: A seed command creates a reusable private league fixture with a short join code and bot opponents.
- AC3: The dashboard exposes player/team, current GP, player readiness, standings/history, and a clearer result timeline.
- AC4: README explains how to run the playtest seed and where to find the checklist.
- AC5: The roadmap and Logics chain reflect that the private-league playtest kit is available.
- AC6: Validation covers typecheck, unit/component tests, E2E, build, lint, i18n, Logics, and the seed script.

# Implementation
- Added `scripts/seed-playtest-league.ts` and root `npm run playtest:seed`.
- Added `docs/playtest/private-league-3gp-checklist.md`.
- Added dashboard sections and a lap-tagged replay timeline in the web app.
- Added i18n keys and layout styles for the new UI landmarks.
- Updated component/E2E tests to assert the dashboard and replay markers.
- Updated README and roadmap references.

# Validation
- 2026-07-14: `npm run typecheck` passed.
- 2026-07-14: `npm test` passed with 3 files and 14 tests.
- 2026-07-14: `npm run test:e2e` passed with 1 Chromium test.
- 2026-07-14: `npm run build` passed.
- 2026-07-14: `npm run lint` passed.
- 2026-07-14: `logics-manager i18n validate` passed.
- 2026-07-14: `npm run logics:validate` passed with 0 blocking issues before task closeout.
- 2026-07-14: `npx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --types node --skipLibCheck scripts/seed-playtest-league.ts` passed.
- 2026-07-14: Temporary PostgreSQL smoke applied Prisma migrations and ran `npm run playtest:seed`, creating league code `PLAY01`.
- 2026-07-14: `logics-manager flow validate req_024_prepare_private_league_playtest_kit` passed.
- 2026-07-14: `logics-manager flow validate-closeout task_025_prepare_private_league_playtest_kit` passed.
- 2026-07-14: Final `npm run logics:validate` passed with 0 warnings.

# Report
- Implementation complete.

# AI Context
- Summary: Implement the private-league playtest fixture, checklist, and dashboard/replay clarity pass.
- Keywords: task, playtest, fixture, checklist, dashboard, replay, i18n
- Use when: Reviewing the exact files and validation evidence for the manual playtest kit.
- Skip when: Work is about future economy, auth, scheduler, or deployment slices.

# Links
- Request: `req_024_prepare_private_league_playtest_kit`
- Roadmap(s): `road_001_cr_league_roadmap`

# AC Traceability
- request-AC1 -> This task. Proof: `docs/playtest/private-league-3gp-checklist.md`.
- request-AC2 -> This task. Proof: `scripts/seed-playtest-league.ts`, `package.json`, and temporary PostgreSQL seed smoke.
- request-AC3 -> This task. Proof: `apps/web/src/app/App.tsx`, `apps/web/src/styles/layout.css`, component tests, and E2E tests.
- request-AC4 -> This task. Proof: `README.md`.
- request-AC5 -> This task. Proof: `logics/roadmap/road_001_cr_league_roadmap.md` plus this request/backlog/task chain.
- request-AC6 -> This task. Proof: validation section above.
- backlog-AC1 -> This task. Proof: checklist exists under `docs/playtest/`.
- backlog-AC2 -> This task. Proof: root `playtest:seed` runs the fixture script.
- backlog-AC3 -> This task. Proof: web app renders dashboard sections and lap markers.
- backlog-AC4 -> This task. Proof: README links the checklist and seed command.
- backlog-AC5 -> This task. Proof: roadmap links `req_024_prepare_private_league_playtest_kit`.
- backlog-AC6 -> This task. Proof: all listed validations passed on 2026-07-14.
