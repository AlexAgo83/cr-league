## item_125_specify_and_implement_a_simple_tire_strategy_directive - Specify and implement a simple tire strategy directive
> From version: 0.3.7
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Plan strategy depth
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Players asked for more preparation depth around tires, but adding tire choice directly risks bloating the currently simple directive loop.

# Scope
- In:
  - Define a minimal tire strategy field with exactly three choices: soft, medium, hard.
  - Soft: stronger chrono/start, weaker late endurance; medium: neutral; hard: weaker start, stronger finish/endurance.
  - Thread the field through shared decision types, API validation/storage, simulation scoring, `DirectivePanel`, plan confirmation, replay/report copy, and tests.
  - Keep copy clear that this is a tire strategy, not a full pit-stop model.
- Out:
  - Pit stops.
  - Tire wear per lap.
  - Compound inventory.
  - Multiple tire selections per GP.
  - Weather-specific tire variants.

# Acceptance criteria
- AC1: The player can choose soft/medium/hard in Plan and the choice persists in submitted decisions.
- AC2: Simulation applies the simple start/finish tradeoff and tests prove each option changes expected scoring in the intended direction.
- AC3: Existing decisions without tireStrategy are migrated or default safely.
- AC4: EN/FR copy and affected UI/API/shared tests are updated.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: The player can choose soft/medium/hard in Plan and the choice persists in submitted decisions.
- request-AC9 -> This backlog slice. Proof: AC2: Simulation applies the simple start/finish tradeoff and tests prove each option changes expected scoring in the intended direction.
- request-AC10 -> This backlog slice. Proof: AC3: Existing decisions without tireStrategy are migrated or default safely.
- request-AC4 -> This backlog slice. Evidence needed: Map visuals reflect weather states in a lightweight, readable way across desktop and mobile, without hiding route, cars, or controls.
- request-AC5 -> This backlog slice. Evidence needed: Replay events can appear as short visual callouts near the affected car(s), keyed from real simulation events and bounded so the map stays legible.
- request-AC6 -> This backlog slice. Evidence needed: After replay completion, the player sees a payoff recap containing position change, points, credits, card spend/consumption, and championship movement when available.
- request-AC7 -> This backlog slice. Evidence needed: New leagues start without an inventory card and with a deliberate starting credit balance that lets the player choose an early card; tests and fixtures reflect the new economy.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_049_race_learning_and_feedback_systems`
- Primary task(s): `task_050_orchestrate_race_learning_and_feedback_systems`

# AI Context
- Summary: Specify and implement a simple tire strategy directive
- Keywords: scaffolded-backlog, specify and implement a simple tire strategy directive, implementation-ready
- Use when: Implementing the scaffolded slice for Specify and implement a simple tire strategy directive.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_050_orchestrate_race_learning_and_feedback_systems`

# Notes
- Task `task_050_orchestrate_race_learning_and_feedback_systems` was finished via `logics-manager flow finish task` on 2026-07-18.
