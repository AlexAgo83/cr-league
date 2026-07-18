## item_121_add_weather_visual_states_to_the_circuit_map - Add weather visual states to the circuit map
> From version: 0.3.7
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Map atmosphere
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Weather is currently readable as text but not visible in the map, so rain and dry conditions do not feel materially different.

# Scope
- In:
  - Add lightweight CSS/SVG overlays in `CircuitMap` for dry, light rain, and heavy rain.
  - Use likely weather for pre-race views and resolved/current replay weather where available.
  - Ensure overlays do not obscure route, cars, map controls, or trait panels.
  - Add visual regression-oriented E2E or DOM tests for weather classes and mobile non-overlap.
- Out:
  - Particle system dependency.
  - Per-pixel canvas weather simulation.
  - Changing simulation weather odds.

# Acceptance criteria
- AC1: Dry, light rain, and heavy rain map states have distinct class-driven visual treatments.
- AC2: The route and moving cars remain visible in all weather states.
- AC3: Mobile map layout remains non-overlapping.
- AC4: Tests verify state class selection and at least one mobile layout guard.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Dry, light rain, and heavy rain map states have distinct class-driven visual treatments.
- request-AC9 -> This backlog slice. Proof: AC2: The route and moving cars remain visible in all weather states.
- request-AC10 -> This backlog slice. Proof: AC3: Mobile map layout remains non-overlapping.
- request-AC5 -> This backlog slice. Evidence needed: Replay events can appear as short visual callouts near the affected car(s), keyed from real simulation events and bounded so the map stays legible.
- request-AC6 -> This backlog slice. Evidence needed: After replay completion, the player sees a payoff recap containing position change, points, credits, card spend/consumption, and championship movement when available.
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
- Summary: Add weather visual states to the circuit map
- Keywords: scaffolded-backlog, add weather visual states to the circuit map, implementation-ready
- Use when: Implementing the scaffolded slice for Add weather visual states to the circuit map.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_050_orchestrate_race_learning_and_feedback_systems`

# Notes
- Task `task_050_orchestrate_race_learning_and_feedback_systems` was finished via `logics-manager flow finish task` on 2026-07-18.
