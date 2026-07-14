## req_030_add_playtest_session_reset_and_league_dashboard_clarity - Add playtest session reset and league dashboard clarity
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: After improving the race desk, playtest operation still needs a fast way to restart a 3-GP session and a clearer league dashboard for standings, readiness, current GP, invite code, and history. Keep it bounded to existing private-league mechanics.
> Confidence: high
> Complexity: Medium
> Theme: General
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let the operator restart a private playtest session without recreating the league or making testers rejoin.
- Make the league panel easier to scan during a 3-GP test: invite code, current GP, readiness, leader, standings, garage, and history.
- Keep the change inside existing private-league mechanics; no accounts, scheduler, or new season model.

# Context
- The race desk now makes the current command clearer.
- The next playtest friction is operational: repeating a test session requires manual setup, and the league panel still reads like raw data.
- A simple restart endpoint and a clearer dashboard are enough for the next colleague playtest.

# Acceptance criteria
- AC1: A league can be restarted from round 1 while keeping league code, teams, and claim codes.
- AC2: Restart clears GP history, directives, points, credits, and cards back to starter state.
- AC3: The web UI exposes a guarded restart action for the current league.
- AC4: The league dashboard highlights invite code, current GP, readiness, leader, player team, standings, garage, and GP history.
- AC5: Unit/e2e/API tests and desktop/mobile visual checks cover the slice.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/api/src/features/leagues/store.ts`
- `apps/api/src/features/leagues/routes.ts`
- `apps/web/src/app/App.tsx`
- `tests/e2e/private-league.spec.ts`

# AI Context
- Summary: Add a bounded private-league playtest restart and clearer league dashboard.
- Keywords: playtest-reset, league-dashboard, standings, readiness, private-league
- Use when: Working on repeatable 3-GP playtest operation and dashboard clarity.
- Skip when: The work is about full auth, scheduler automation, or visual race replay.

# Backlog
- none
- `item_036_add_playtest_session_reset_and_league_dashboard_clarity`
