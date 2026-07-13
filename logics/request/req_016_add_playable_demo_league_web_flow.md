## req_016_add_playable_demo_league_web_flow - Add playable demo league web flow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Web gameplay
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Replace the static simulation preview with the first playable web loop.
- Let a player create a demo league, configure a team directive, submit it, resolve the Grand Prix, and read the persisted result.
- Keep auth, invite flow, inventory management, scheduling, and multi-round season UX out of scope.

# Context
- The API now exposes minimal persisted league endpoints.
- The existing web app can already display race results, but it does not yet drive the league API.
- This slice should make the concept feel playable without adding product-complete account or league flows.

# Acceptance criteria
- AC1: Web app can create a demo league through `POST /leagues`.
- AC2: Web app renders league code, current Grand Prix status, teams, points, and credits.
- AC3: Web app lets the player choose approach, preparation, and one optional card.
- AC4: Web app submits the player directive through the league decision endpoint.
- AC5: Web app resolves the current Grand Prix through the league resolve endpoint.
- AC6: Web app renders the persisted result classification, key events, and report blocks.
- AC7: Loading and API failure states are visible.
- AC8: Tests cover the playable web flow.
- AC9: Validation passes.
- AC10: Auth, invite flow, inventory persistence, scheduling, and multi-round season UX remain out of scope.

# AC Traceability
- AC1 -> `task_017_add_playable_demo_league_web_flow`. Proof: `Create league` calls `POST /leagues`.
- AC2 -> `task_017_add_playable_demo_league_web_flow`. Proof: league state panel renders code, round, status, teams, points, and credits.
- AC3 -> `task_017_add_playable_demo_league_web_flow`. Proof: form controls approach, preparation, and card selection.
- AC4 -> `task_017_add_playable_demo_league_web_flow`. Proof: `Submit directive` calls the decision endpoint.
- AC5 -> `task_017_add_playable_demo_league_web_flow`. Proof: `Launch GP` calls the resolve endpoint.
- AC6 -> `task_017_add_playable_demo_league_web_flow`. Proof: result panels render classification, events, and report.
- AC7 -> `task_017_add_playable_demo_league_web_flow`. Proof: message/status state covers loading and API error.
- AC8 -> `task_017_add_playable_demo_league_web_flow`. Proof: web test plays through create, submit, and resolve.
- AC9 -> `task_017_add_playable_demo_league_web_flow`. Proof: validation commands passed.
- AC10 -> `task_017_add_playable_demo_league_web_flow`. Proof: no auth, invite, inventory, scheduling, or multi-round UX was added.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `req_015_add_minimal_league_persistence_api`
- `task_016_add_minimal_league_persistence_api`
- `spec_016_implementation_roadmap`

# AI Context
- Summary: Add the first playable persisted demo league web loop.
- Keywords: web, playable-demo, league-api, race-decision, grand-prix-result
- Use when: Working on the first player-facing loop that consumes persisted league APIs.
- Skip when: Working on auth, invites, inventory, scheduling, or full season management.

# Backlog
- `item_022_add_playable_demo_league_web_flow`
