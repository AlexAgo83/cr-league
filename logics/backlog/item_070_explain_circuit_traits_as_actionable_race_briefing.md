## item_070_explain_circuit_traits_as_actionable_race_briefing - Explain circuit traits as actionable race briefing
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Circuit briefing clarity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The map currently exposes Grip, Overtaking, and Energy as raw numbers, but a new player cannot tell whether a value is weak, average, or strong.
- The player cannot infer what each trait changes in the race simulation or which directive choice should react to it.
- The trait indicators are useful telemetry, but there is no adjacent explanation that turns them into an actionable pit wall briefing.

# Scope
- In:
  - Keep the current compact map trait indicators visible; do not remove or rename them as the primary telemetry chips.
  - Add a nearby briefing layer that explains each trait with a plain-language level such as weak, balanced, strong, or extreme.
  - Explain what each trait means concretely for a race plan: grip affects stability/weather sensitivity, overtaking affects attack opportunity, energy affects wear/endurance pressure.
  - Connect trait readings to the directive choices without prescribing a single answer: e.g. "high overtaking supports attack", "low energy makes reliability safer", "rain plus grip risk makes weather prep more readable".
  - Add localized EN/FR copy for trait levels, trait meanings, and pit wall reading snippets.
  - Reuse existing `currentCircuit.traits`, `forecastPick`, `MapTraitsPanel`, `DirectivePanel`, and helper logic where possible.
- Out:
  - Changing trait names or simulation values.
  - Changing circuit data or balance.
  - Adding probability predictions, win chance, or AI-generated recommendations.
  - Replacing the map indicators with a tutorial overlay.
  - Introducing new charting or tooltip dependencies.

# Acceptance criteria
- AC1: Grip, Overtaking, and Energy still appear as compact map telemetry values.
- AC2: Each trait value has a visible qualitative reading in the race planning surface, such as weak, medium, strong, or high-risk.
- AC3: Each trait includes one concise explanation of what it changes in player decision terms.
- AC4: The briefing links trait readings to current directive levers: approach, preparation, and card selection.
- AC5: The briefing avoids deterministic advice or outcome promises; it frames tradeoffs and risk.
- AC6: All new trait briefing copy is localized through EN/FR catalogs.
- AC7: Tests cover at least one low/medium/high trait reading and verify that the directive surface displays the briefing.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC4 links trait readings to approach choices.
- request-AC3 -> This backlog slice. Proof: AC4 links trait readings to preparation choices.
- request-AC5 -> This backlog slice. Proof: AC2 and AC3 provide actionably readable inputs for the plan summary.
- request-AC7 -> This backlog slice. Proof: AC6 requires EN/FR catalog coverage.
- request-AC9 -> This backlog slice. Proof: AC1 keeps compact map telemetry while AC2-AC4 add readable explanation nearby.
- request-AC10 -> This backlog slice. Proof: AC1-AC7 define circuit trait briefing acceptance.

# Decision framing
- Product framing: Required because this converts simulation telemetry into player-facing briefing language.
- Architecture framing: Not needed unless implementation introduces shared helper contracts beyond the web UI.

# Links
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Primary task(s): `task_039_orchestrate_pit_wall_race_plan_clarity`

# AI Context
- Summary: Explain circuit traits as actionable race briefing
- Keywords: scaffolded-backlog, circuit traits, map telemetry, pit wall briefing, implementation-ready
- Use when: Implementing trait explanation or map telemetry comprehension inside the pit wall race plan redesign.
- Skip when: The change is only about replay visuals, card economy, or unrelated cockpit layout.

# Priority
- Priority: High
- Rationale: Playtest feedback shows the directive cannot become clear until players understand what the map trait numbers mean and how they inform the plan.
