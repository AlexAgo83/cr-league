## item_030_prepare_private_league_playtest_kit - Prepare private league playtest kit
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Testing and playtest
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The private-league prototype has automated coverage, but a human playtest still needs a repeatable setup and visible in-game landmarks.
- Without a playtest fixture and checklist, each run depends on ad hoc operator memory and makes feedback hard to compare.

# Scope
- In:
  - `npm run playtest:seed` creates a `PLAY01` private league fixture with bots;
  - manual 3-GP checklist for two human testers plus bots;
  - dashboard sections for player team, current GP, readiness, standings, and history;
  - lightweight lap-tagged replay timeline;
  - README/roadmap/Logics updates.
- Out:
  - persistent user accounts;
  - admin dashboard;
  - real-time multiplayer presence;
  - automated scheduled resolution;
  - economy/card inventory.

# Acceptance criteria
- AC1: A manual 3-GP private league playtest checklist exists with setup, scenario, observation prompts, questions, and known limits.
- AC2: A seed command creates a reusable private league fixture with a short join code and bot opponents.
- AC3: The dashboard exposes player/team, current GP, player readiness, standings/history, and a clearer result timeline.
- AC4: README explains how to run the playtest seed and where to find the checklist.
- AC5: The roadmap and Logics chain reflect that the private-league playtest kit is available.
- AC6: Validation covers typecheck, unit/component tests, E2E, build, lint, i18n, Logics, and the seed script.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: manual checklist is in scope.
- request-AC2 -> This backlog slice. Proof: playtest seed command is in scope.
- request-AC3 -> This backlog slice. Proof: dashboard and replay clarity pass is in scope.
- request-AC4 -> This backlog slice. Proof: README playtest instructions are in scope.
- request-AC5 -> This backlog slice. Proof: roadmap and Logics updates are in scope.
- request-AC6 -> This backlog slice. Proof: validation evidence is in scope.

# Decision framing
- Product framing: Extends the `0.2` private-league milestone toward a real colleague playtest.
- Product signals: Human comprehension and repeatable playtest setup are now more valuable than deeper economy.
- Product follow-up: Capture actual playtest results before expanding the card/inventory loop.
- Architecture framing: No new architecture decision; this stays within the existing static PWA + Fastify API + PostgreSQL design.
- Architecture follow-up: Revisit scheduler/deadline automation only if manual operation becomes painful.

# Links
- Roadmap(s): `road_001_cr_league_roadmap`
- Request: `req_024_prepare_private_league_playtest_kit`
- Primary task(s): `task_025_prepare_private_league_playtest_kit`

# AI Context
- Summary: Backlog slice for the first manual private-league playtest kit.
- Keywords: backlog, playtest-kit, fixture, checklist, dashboard, replay
- Use when: Implementing or reviewing the manual playtest setup for the private-league prototype.
- Skip when: The work is about production auth, deployment, visual replay, or economy depth.

# Priority
- Priority: High
- Rationale: This converts the current prototype from technically demonstrable to manually testable with colleagues.

# Notes
- Completed on 2026-07-14 as a bounded post-automation playtest-readiness slice.

# Tasks
- `task_025_prepare_private_league_playtest_kit`
