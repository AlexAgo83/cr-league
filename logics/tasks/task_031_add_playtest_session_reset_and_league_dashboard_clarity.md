## task_031_add_playtest_session_reset_and_league_dashboard_clarity - Add playtest session reset and league dashboard clarity
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
- `item_036_add_playtest_session_reset_and_league_dashboard_clarity`

# Acceptance criteria
- AC1: A league can be restarted from round 1 while keeping league code, teams, and claim codes.
- AC2: Restart clears GP history, directives, points, credits, and cards back to starter state.
- AC3: The web UI exposes a guarded restart action for the current league.
- AC4: The league dashboard highlights invite code, current GP, readiness, leader, player team, standings, garage, and GP history.
- AC5: Unit/e2e/API tests and desktop/mobile visual checks cover the slice.

# Validation
- Run `npm run typecheck`.
- Run `npm test`.
- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run test:e2e`.
- Run `logics-manager i18n validate`.
- Run `npm run logics:validate`.
- Visually inspect dashboard desktop and mobile screenshots.
- npm run typecheck passed; npm test passed; npm run lint passed; npm run build passed; npm run test:e2e passed; logics-manager i18n validate passed; npm run logics:validate passed before closeout with only deferred traceability warnings; visual checks passed for /tmp/cr-league-dashboard-desktop2.png and /tmp/cr-league-dashboard-mobile2.png.
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- Implementation complete:
  - added `POST /leagues/:leagueId/restart`;
  - reset keeps league/team identity but clears race history and progression state;
  - added guarded Restart session UI action;
  - redesigned league panel into a compact championship dashboard;
  - updated EN/FR copy, API tests, UI tests, and e2e flow.
- Visual proof generated locally:
  - `/tmp/cr-league-dashboard-desktop2.png`
  - `/tmp/cr-league-dashboard-mobile2.png`
- Finished on 2026-07-14.
- Linked backlog item(s): `item_036_add_playtest_session_reset_and_league_dashboard_clarity`
- Related request(s): `req_030_add_playtest_session_reset_and_league_dashboard_clarity`

# AI Context
- Summary: Implement repeatable playtest restart and clearer league dashboard.
- Keywords: task, playtest-reset, league-dashboard, standings, readiness
- Use when: Reviewing or extending the reset/dashboard slice.
- Skip when: Work is about scheduler automation, auth, or full replay visuals.

# Links
- Request: `req_030_add_playtest_session_reset_and_league_dashboard_clarity`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `restartLeague` in `apps/api/src/features/leagues/store.ts` creates a fresh round 1 GP while preserving league, teams, and claim codes; API test covers it.
- request-AC2 -> This task. Proof: `restartLeague` deletes current GP/decisions, resets points/credits/cards, and `apps/api/src/app.test.ts` asserts round 1, single history entry, zeroed team state, and starter card.
- request-AC3 -> This task. Proof: `apps/web/src/app/App.tsx` exposes `Restart session` with native confirmation and preserves the current player claim in local UI state.
- request-AC4 -> This task. Proof: `apps/web/src/app/App.tsx` and `apps/web/src/styles/layout.css` render the dashboard summary, invite code, player team, garage, standings, and GP history.
- request-AC5 -> This task. Proof: `apps/api/src/app.test.ts`, `apps/web/src/app/App.test.tsx`, and `tests/e2e/private-league.spec.ts` cover reset/dashboard flow; desktop/mobile screenshots were visually checked.
