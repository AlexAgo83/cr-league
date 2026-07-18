## item_121_add_weather_visual_states_to_the_circuit_map - Add weather visual states to the circuit map
> From version: 0.3.7
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
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
