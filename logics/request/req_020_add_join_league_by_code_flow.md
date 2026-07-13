## req_020_add_join_league_by_code_flow - Add join league by code flow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 88%
> Complexity: Medium
> Theme: Multiplayer onboarding
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let a player join an existing active league with the short invite code shown by the creator.
- Keep the first multiplayer slice intentionally small: no account system, lobby chat, permissions, ready checks, or long-lived invitation management.
- Preserve the solo/demo create flow while proving that a joined team can participate in the next Grand Prix simulation.

# Context
- The product brief calls for a simple colleague-friendly invite flow, ideally a 6-character code.
- The current prototype already creates a persisted demo league and exposes the league code, but there is no way for another player to use it.
- The first implementation should work against PostgreSQL and the web prototype without introducing a heavier backend architecture.

# Acceptance criteria
- AC1: API exposes a join endpoint accepting a league code and team name.
- AC2: Join code matching is normalized so lowercase input can join an uppercase league code.
- AC3: Unknown league codes return 404 Not Found.
- AC4: Duplicate team names in the same league return 409 Conflict.
- AC5: Joining after the current Grand Prix is resolved returns 409 Conflict.
- AC6: A joined team appears in the league state and can be included when the Grand Prix resolves.
- AC7: Web UI lets a player enter an invite code and join without removing the create-league path.
- AC8: API, web, and real PostgreSQL smoke coverage validate the flow.
- AC9: Validation passes and i18n strings stay inside the existing catalog contract.

# AC Traceability
- AC1 -> `task_021_add_join_league_by_code_flow`. Proof: `POST /leagues/join` implemented.
- AC2 -> `task_021_add_join_league_by_code_flow`. Proof: `joinLeagueByCode` normalizes `code.trim().toUpperCase()`.
- AC3 -> `task_021_add_join_league_by_code_flow`. Proof: route returns 404 when no league matches the code.
- AC4 -> `task_021_add_join_league_by_code_flow`. Proof: store rejects same-name teams case-insensitively.
- AC5 -> `task_021_add_join_league_by_code_flow`. Proof: store rejects joins after current GP status is `resolved`.
- AC6 -> `task_021_add_join_league_by_code_flow`. Proof: API tests and smoke resolve a league after a joined team is added.
- AC7 -> `task_021_add_join_league_by_code_flow`. Proof: `App.tsx` adds join code input and join action.
- AC8 -> `task_021_add_join_league_by_code_flow`. Proof: `npm test` and temporary PostgreSQL `smoke:league` passed.
- AC9 -> `task_021_add_join_league_by_code_flow`. Proof: validation commands passed on 2026-07-14.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `logics/tasks/task_017_add_playable_demo_league_web_flow.md`
- `logics/tasks/task_016_add_minimal_league_persistence_api.md`
- `scripts/smoke-league-flow.ts`

# AI Context
- Summary: Add the first minimal multiplayer invite flow with short code join.
- Keywords: league-code, join-flow, multiplayer-onboarding, invite-code, smoke-test
- Use when: Reviewing or extending the league invite-code join path.
- Skip when: Designing auth, permissions, lobby readiness, matchmaking, or full season scheduling.

# Backlog
- `item_026_add_join_league_by_code_flow`
