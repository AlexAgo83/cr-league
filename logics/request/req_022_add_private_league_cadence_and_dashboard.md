## req_022_add_private_league_cadence_and_dashboard - Add private league cadence and dashboard
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 86%
> Complexity: High
> Theme: Private league prototype
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the private league prototype clearer to operate between Grand Prix.
- Add simple league cadence/deadline settings, visible readiness state, rejoin controls, and Grand Prix history.
- Keep this slice manual and low-cost: no background scheduler, notification system, or full admin UI.

# Context
- `road_001_cr_league_roadmap` marks `0.2` as foundation started.
- The previous slice added rejoin tokens, defaulted resolution, and next-GP progression.
- The player experience still lacked explicit league settings, action prompts, and history context.

# Acceptance criteria
- AC1: League state includes cadence and optional preparation deadline.
- AC2: API can update cadence/deadline with validation.
- AC3: League state includes Grand Prix history, not only the current GP.
- AC4: League state exposes per-team readiness and next action.
- AC5: Web dashboard shows cadence, next action, player team, team readiness, and GP history.
- AC6: Web lets the local player forget a saved team claim.
- AC7: Smoke verifies settings update and history against PostgreSQL.
- AC8: Validation passes.

# AC Traceability
- AC1 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: `League.cadence` and `League.preparationDeadlineAt`.
- AC2 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: `POST /leagues/:leagueId/settings`.
- AC3 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: `LeagueState.grandPrixHistory`.
- AC4 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: `ready` on teams and `actionState.nextAction`.
- AC5 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: `App.tsx` dashboard updates.
- AC6 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: `Forget team` clears local claim.
- AC7 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: `scripts/smoke-league-flow.ts`.
- AC8 -> `task_023_add_private_league_cadence_and_dashboard`. Proof: validation commands passed on 2026-07-14.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_001_cr_league_v1_static_pwa_api_architecture`

# References
- `logics/roadmap/road_001_cr_league_roadmap.md`
- `logics/request/req_021_build_private_league_prototype_foundation.md`
- `apps/api/src/features/leagues/store.ts`
- `apps/web/src/app/App.tsx`

# AI Context
- Summary: Add private league cadence, readiness dashboard, local claim reset, and GP history.
- Keywords: private-league, cadence, deadline, dashboard, readiness, history, 0.2
- Use when: Reviewing private league session clarity and dashboard state.
- Skip when: Adding scheduler workers, notifications, auth, or economy depth.

# Backlog
- `item_028_add_private_league_cadence_and_dashboard`
