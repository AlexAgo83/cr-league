## item_258_extract_the_chrono_race_engine_module_and_contract - Extract the chrono race engine module and contract
> From version: 0.4.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Engine architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- simulateRace.ts currently owns scoring, events, chrono timing, replay trace generation, smoothing, validation assumptions, classification, and reporting.
- A second simulation step will be risky unless the chrono contract and pure helpers are isolated behind a narrow internal module.

# Scope
- In:
  - Create packages/shared/src/simulation/chronoRaceEngine.ts or an equivalent focused internal module.
  - Move ChronoMotionParameters, CARD_MOTION_EFFECTS, motion parameter builders, chrono profile/circuit/racecraft factors, and final-time calculation into the module.
  - Document module inputs, outputs, deterministic tie-breakers, and compatibility boundaries in comments or a nearby doc.
  - Keep simulateRace as the only public race entry point and avoid public RaceInput/RaceResult changes.
  - Add focused module tests for mapping, deterministic finish times, and compatibility with existing simulateRace behavior.
- Out:
  - Building the full time-distance trace in this slice.
  - Retuning balance numbers beyond preserving current tests.
  - Changing API routes, web components, or circuit data.

# Acceptance criteria
- AC1: chronoRaceEngine module exists with a small documented contract and no UI/API coupling.
- AC2: simulateRace delegates chrono timing/mapping to the module while preserving RaceResult shape.
- AC3: Tests prove every existing approach, preparation, pit strategy, and card still maps to runtime motion parameters.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: chronoRaceEngine module exists with a small documented contract and no UI/API coupling.
- request-AC5 -> This backlog slice. Proof: AC2: simulateRace delegates chrono timing/mapping to the module while preserving RaceResult shape.
- request-AC6 -> This backlog slice. Proof: AC3: Tests prove every existing approach, preparation, pit strategy, and card still maps to runtime motion parameters.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_066_chrono_engine_v2_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_103_chrono_engine_v2_extract_the_race_engine_module_and_make_replay_trace_a_minimal_time_distance_simulation`
- Primary task(s): `task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture`

# AI Context
- Summary: Extract the chrono race engine module and contract
- Keywords: scaffolded-backlog, extract the chrono race engine module and contract, implementation-ready
- Use when: Implementing the scaffolded slice for Extract the chrono race engine module and contract.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
