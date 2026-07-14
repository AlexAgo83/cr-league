## item_036_add_playtest_session_reset_and_league_dashboard_clarity - Add playtest session reset and league dashboard clarity
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Playtest operation and dashboard clarity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The private-league prototype can run a 3-GP loop, but repeating a playtest still takes too much manual reset work. The league sidebar also mixes useful signals with raw lists, so an operator has to scan too hard during a session.

# Scope
- In:
  - restart current league from round 1;
  - keep existing league code, teams, and claims;
  - reset GP history, decisions, points, credits, and starter cards;
  - guarded restart button in the app;
  - dashboard summary for invite code, current GP, readiness, leader, player team, standings, garage, and history.
- Out:
  - account/auth changes;
  - automatic scheduler;
  - full season model;
  - production admin console;
  - visual track replay.

# Acceptance criteria
- AC1: A league can be restarted from round 1 while keeping league code, teams, and claim codes.
- AC2: Restart clears GP history, directives, points, credits, and cards back to starter state.
- AC3: The web UI exposes a guarded restart action for the current league.
- AC4: The league dashboard highlights invite code, current GP, readiness, leader, player team, standings, garage, and GP history.
- AC5: Unit/e2e/API tests and desktop/mobile visual checks cover the slice.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 keeps league identity stable while resetting round.
- request-AC2 -> This backlog slice. Proof: AC2 defines the reset surface.
- request-AC3 -> This backlog slice. Proof: AC3 requires a guarded UI command.
- request-AC4 -> This backlog slice. Proof: AC4 defines dashboard content.
- request-AC5 -> This backlog slice. Proof: AC5 requires automated and visual validation.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_030_add_playtest_session_reset_and_league_dashboard_clarity`
- Primary task(s): `task_031_add_playtest_session_reset_and_league_dashboard_clarity`

# AI Context
- Summary: Add repeatable playtest reset and a clearer league dashboard.
- Keywords: backlog-groom, playtest-reset, league-dashboard, standings, readiness
- Use when: Implementing or reviewing the private-league reset/dashboard slice.
- Skip when: The change is unrelated to repeatable playtest operation or league panel clarity.

# Priority
- Priority: Medium
- Rationale: Useful before the next real playtest, but still below correctness/security blockers.

# Notes
- Hybrid rationale: Derived from request `req_030_add_playtest_session_reset_and_league_dashboard_clarity` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_030_add_playtest_session_reset_and_league_dashboard_clarity.md`.
- Generated locally by logics-manager.
- Task `task_031_add_playtest_session_reset_and_league_dashboard_clarity` was finished via `logics-manager flow finish task` on 2026-07-14.

# Tasks
- `task_031_add_playtest_session_reset_and_league_dashboard_clarity`
