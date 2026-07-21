## item_176_add_a_shared_card_descriptor_condition_strength_band_and_surface_it_in_card_ui - Add a shared card descriptor (condition + strength band) and surface it in card UI
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Race legibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Card magnitudes and trigger conditions are hardcoded in simulateRace.ts and never shown; the UI shows only '+ Grip' style badges and prose.
- Players cannot tell when a card fires or how strict its condition is, so they over- or under-value cards blindly (audit cause B).
- Any UI that restates card effects risks drifting from the simulation because there is no shared source of truth for card metadata.

# Scope
- In:
  - Define a shared per-card descriptor colocated with card effects in packages/shared: trigger condition (segment / weather / proximity) and a relative strength band derived from the coded magnitude, plus the downside.
  - Render the condition and strength band (and downside) in CardStatBadges and the garage/plan card surfaces, legible without color alone.
  - Add EN/FR copy for conditions, strength bands, and downsides.
  - Add a unit test asserting each card's descriptor is consistent with its actual coded effect and that no card is missing a descriptor.
- Out:
  - Displaying raw numeric magnitudes or a computed per-circuit estimate (deferred).
  - Any recommendation, ranking, or best-card labeling.
  - Any change to card magnitudes, prices, economy, or the simulation.
  - Weather timeline semantics (handled in a separate legibility request).

# Acceptance criteria
- AC1: Every card shows its trigger condition and a weak/medium/strong band plus downside in plan and garage, with no raw numbers.
- AC2: A single shared descriptor in packages/shared feeds both the UI and stays consistent with simulation magnitudes, covered by a unit test.
- AC3: No copy recommends or ranks cards; wording is rule-descriptive only.
- AC4: Meaning is not color-only; EN/FR copy present.
- AC5: No simulation, magnitude, price, or economy change; typecheck, test, build, lint, and logics:validate pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Every card shows its trigger condition and a weak/medium/strong band plus downside in plan and garage, with no raw numbers.
- request-AC2 -> This backlog slice. Proof: AC2: A single shared descriptor in packages/shared feeds both the UI and stays consistent with simulation magnitudes, covered by a unit test.
- request-AC3 -> This backlog slice. Proof: AC3: No copy recommends or ranks cards; wording is rule-descriptive only.
- request-AC4 -> This backlog slice. Proof: AC4: Meaning is not color-only; EN/FR copy present.
- request-AC5 -> This backlog slice. Proof: AC5: No simulation, magnitude, price, or economy change; typecheck, test, build, lint, and logics:validate pass.
- request-AC6 -> This backlog slice. Proof: AC5: No simulation, magnitude, price, or economy change; typecheck, test, build, lint, and logics:validate pass.
- request-AC7 -> This backlog slice. Proof: AC5: No simulation, magnitude, price, or economy change; typecheck, test, build, lint, and logics:validate pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_042_race_legibility_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_078_expose_card_trigger_conditions_and_relative_strength_in_plan_and_garage`
- Primary task(s): `task_079_orchestrate_card_effect_legibility`

# AI Context
- Summary: Add a shared card descriptor (condition + strength band) and surface it in card UI
- Keywords: scaffolded-backlog, add a shared card descriptor (condition + strength band) and surface it in card ui, implementation-ready
- Use when: Implementing the scaffolded slice for Add a shared card descriptor (condition + strength band) and surface it in card UI.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_079_orchestrate_card_effect_legibility` was finished via `logics-manager flow finish task` on 2026-07-21.
