## item_181_move_resolved_weather_details_to_a_circuit_info_modal - Move resolved weather details to a circuit info modal
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Race readability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Resolved weather by phase is currently accurate but exposed as a long inline sentence that competes with replay controls.
- The circuit panel has no compact way to reveal post-race weather details even though it already owns the race context.

# Scope
- In:
  - Add a compact circuit weather info action near the Drive circuit presentation details when resolved weather is available.
  - Reuse existing modal patterns to show phase-by-phase resolved weather copy.
  - Remove or hide the long inline weather sentence from replay progress while preserving weather markers.
- Out:
  - Changing forecast or resolved weather data.
  - Changing replay progress marker behavior.
  - Adding a broad help or tutorial system.

# Acceptance criteria
- AC1: Replay progress no longer renders the raw phase summary sentence inline.
- AC2: The Drive circuit panel shows a compact info action after race resolution.
- AC3: The modal lists start, early, mid, late, and finish weather in EN/FR.
- AC4: Existing replay weather markers remain visible and tested.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Replay progress no longer renders the raw phase summary sentence inline.
- request-AC2 -> This backlog slice. Proof: AC2: The Drive circuit panel shows a compact info action after race resolution.
- request-AC3 -> This backlog slice. Proof: AC3: The modal lists start, early, mid, late, and finish weather in EN/FR.
- request-AC6 -> This backlog slice. Proof: AC4: Existing replay weather markers remain visible and tested.
- request-AC7 -> This backlog slice. Proof: AC4: Existing replay weather markers remain visible and tested.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_047_race_weather_and_card_stat_readability_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`
- Primary task(s): `task_084_orchestrate_weather_and_card_stat_readability`

# AI Context
- Summary: Move resolved weather details to a circuit info modal
- Keywords: scaffolded-backlog, move resolved weather details to a circuit info modal, implementation-ready
- Use when: Implementing the scaffolded slice for Move resolved weather details to a circuit info modal.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
