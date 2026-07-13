## item_001_document_and_validate_the_grand_prix_core_loop - Document and validate the Grand Prix core loop
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay foundation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The product will fail if pre-race choices feel like opaque stat tuning or if players cannot understand why a race result happened.
- The core loop must be simple enough for casual players but expressive enough to create memorable race stories.

# Scope
- In:
  - Define the default Grand Prix phases: briefing, preparation, lock/deadline, simulation, replay, report, rewards, standings, next-race setup.
  - Define the initial mandatory decisions: race approach, technical preparation, and one optional special plan such as a card or rival objective.
  - Define how weather, circuit type, risk, reliability, and card effects should be communicated to the player.
  - Define the minimum report content needed to explain the result.
- Out:
  - Exact numerical balancing formulas.
  - Full UI implementation.
  - Live in-race interaction.

# Acceptance criteria
- AC1: The Grand Prix loop can be described in under one minute to a casual player.
- AC2: The loop includes at least three explicit feedback points explaining how player decisions changed the race.
- AC3: The loop supports both immediate solo execution and scheduled multiplayer execution.
- AC4: The loop includes default behavior for absent multiplayer users.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The Grand Prix loop can be described in under one minute to a casual player.
- request-AC3 -> This backlog slice. Proof: AC2: The loop includes at least three explicit feedback points explaining how player decisions changed the race.
- request-AC5 -> This backlog slice. Proof: AC3: The loop supports both immediate solo execution and scheduled multiplayer execution.
- request-AC4 -> This backlog slice. Evidence needed: The brief defines cards as simple, mostly consumable special moves with clear race-story impact and a one-card-per-Grand-Prix V1 assumption.
- request-AC6 -> This backlog slice. Evidence needed: The brief explicitly excludes V1 features that would inflate cost or scope, including live real-time races, complex 3D rendering, deep market systems, advanced notifications, and heavy vehicle upgrade trees.
- request-AC7 -> This backlog slice. Evidence needed: The backlog identifies the first development slices required to validate fun: league setup, team creation, race preparation, simulation, replay/reporting, cards/inventory, and progression.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_define_the_asynchronous_racing_league_game_product_brief`
- Primary task(s): `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery`

# AI Context
- Summary: Document and validate the Grand Prix core loop
- Keywords: scaffolded-backlog, document and validate the grand prix core loop, implementation-ready
- Use when: Implementing the scaffolded slice for Document and validate the Grand Prix core loop.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery` was finished via `logics-manager flow finish task` on 2026-07-13.
