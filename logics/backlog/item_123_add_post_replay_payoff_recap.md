## item_123_add_post_replay_payoff_recap - Add post-replay payoff recap
> From version: 0.3.7
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Post-race payoff
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- After watching the replay, the player does not immediately see the practical payoff of the GP: what they gained, lost, spent, and how it affected the season.

# Scope
- In:
  - Add a compact payoff recap shown when replay finishes and available in the report view.
  - Include final position, position change, points, credits, consumed card(s), championship movement when computable, and one short lesson/follow-up.
  - Reuse existing result classification, consumedCards, playerDecision, and standings data; do not add a new API response unless a field is truly missing.
  - Add EN/FR strings and tests for win, loss, consumed-card, and no-card cases.
- Out:
  - Replacing the existing report.
  - Season recap redesign.
  - New reward types.

# Acceptance criteria
- AC1: After replay completion, the player can see a payoff recap without hunting through tables.
- AC2: The recap includes points and credits gained, and consumed cards if any.
- AC3: If championship movement cannot be computed, the recap omits it cleanly.
- AC4: Tests cover the main reward/spend states.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: After replay completion, the player can see a payoff recap without hunting through tables.
- request-AC9 -> This backlog slice. Proof: AC2: The recap includes points and credits gained, and consumed cards if any.
- request-AC10 -> This backlog slice. Proof: AC3: If championship movement cannot be computed, the recap omits it cleanly.
- request-AC4 -> This backlog slice. Evidence needed: Map visuals reflect weather states in a lightweight, readable way across desktop and mobile, without hiding route, cars, or controls.
- request-AC5 -> This backlog slice. Evidence needed: Replay events can appear as short visual callouts near the affected car(s), keyed from real simulation events and bounded so the map stays legible.
- request-AC7 -> This backlog slice. Evidence needed: New leagues start without an inventory card and with a deliberate starting credit balance that lets the player choose an early card; tests and fixtures reflect the new economy.
- request-AC8 -> This backlog slice. Evidence needed: Tire strategy is specified as a small, testable mechanic with three choices (soft/medium/hard or equivalent), clear effects, and no speculative tire-management system.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_049_race_learning_and_feedback_systems`
- Primary task(s): `task_050_orchestrate_race_learning_and_feedback_systems`

# AI Context
- Summary: Add post-replay payoff recap
- Keywords: scaffolded-backlog, add post-replay payoff recap, implementation-ready
- Use when: Implementing the scaffolded slice for Add post-replay payoff recap.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_050_orchestrate_race_learning_and_feedback_systems`

# Notes
- Task `task_050_orchestrate_race_learning_and_feedback_systems` was finished via `logics-manager flow finish task` on 2026-07-18.
