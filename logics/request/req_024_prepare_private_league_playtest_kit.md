## req_024_prepare_private_league_playtest_kit - Prepare private league playtest kit
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Complexity: Medium
> Theme: Testing and playtest
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the current private-league prototype usable for a first manual colleague playtest, not only automated browser/API checks.
- Provide a repeatable seeded league, a short 3-GP checklist, and clearer UI landmarks so testers can understand the session without database intervention.

# Context
- `req_023_add_automated_private_league_playtest_scenario` added automated confidence for a three-GP loop.
- The next risk is human comprehension: testers need to know which team is theirs, what GP/action is current, and how to run the short playtest.
- The project still avoids account/auth complexity and always-on scheduling until playtest evidence justifies it.

# Acceptance criteria
- AC1: A manual 3-GP private league playtest checklist exists with setup, scenario, observation prompts, questions, and known limits.
- AC2: A seed command creates a reusable private league fixture with a short join code and bot opponents.
- AC3: The dashboard exposes player/team, current GP, player readiness, standings/history, and a clearer result timeline.
- AC4: README explains how to run the playtest seed and where to find the checklist.
- AC5: The roadmap and Logics chain reflect that the private-league playtest kit is available.
- AC6: Validation covers typecheck, unit/component tests, E2E, build, lint, i18n, Logics, and the seed script.

# AC Traceability
- AC1 -> `task_025_prepare_private_league_playtest_kit`. Proof: `docs/playtest/private-league-3gp-checklist.md`.
- AC2 -> `task_025_prepare_private_league_playtest_kit`. Proof: `scripts/seed-playtest-league.ts`, `package.json`, and temporary PostgreSQL seed smoke.
- AC3 -> `task_025_prepare_private_league_playtest_kit`. Proof: `apps/web/src/app/App.tsx`, `apps/web/src/styles/layout.css`, `apps/web/src/app/App.test.tsx`, and `tests/e2e/private-league.spec.ts`.
- AC4 -> `task_025_prepare_private_league_playtest_kit`. Proof: `README.md`.
- AC5 -> `task_025_prepare_private_league_playtest_kit`. Proof: `logics/roadmap/road_001_cr_league_roadmap.md` and the linked request/backlog/task docs.
- AC6 -> `task_025_prepare_private_league_playtest_kit`. Proof: task validation log dated 2026-07-14.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In:
  - playtest fixture seed script;
  - manual checklist document;
  - small dashboard/replay clarity pass;
  - README and roadmap references;
  - validation evidence.
- Out:
  - real accounts;
  - automatic scheduler/deadline worker;
  - card inventory/economy;
  - visual track replay;
  - production deployment.

# Companion docs
- Roadmap(s): `road_001_cr_league_roadmap`

# AI Context
- Summary: Prepare a lightweight manual playtest kit for the private league prototype.
- Keywords: playtest, private-league, fixture, seed, checklist, dashboard, replay-timeline
- Use when: Reviewing how to run the first short private-league playtest or extending the playtest setup.
- Skip when: Work is about economy depth, auth, scheduler workers, or production deployment.

# Backlog
- `item_030_prepare_private_league_playtest_kit`
