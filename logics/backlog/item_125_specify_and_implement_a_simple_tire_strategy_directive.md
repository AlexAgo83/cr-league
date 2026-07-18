## item_125_specify_and_implement_a_simple_tire_strategy_directive - Specify and implement a simple tire strategy directive
> From version: 0.3.7
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
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
