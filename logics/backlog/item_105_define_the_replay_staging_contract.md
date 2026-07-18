## item_105_define_the_replay_staging_contract - Define the replay staging contract
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Replay architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current replay uses simulation trace snapshots directly, so presentation artifacts can leak into perceived race realism.
- Better overtakes require short scripted phases, but those phases should not mutate the simulation result.
- Without a contract, replay improvements risk mixing display-only animation logic into `simulateRace`.

# Scope
- In:
  - Create or document a deterministic replay staging model that consumes `RaceResult`, `ReplayTracePoint[]`, and circuit metadata.
  - Define beat types for grid/start, pacing, close-follow, overtake, settle, weather shift, key event, and finish.
  - Specify how beats preserve final classification, event timing semantics, and progress marker behavior.
  - Define how rank transitions are detected from trace order changes and converted into staged overtake windows.
  - Keep the contract small enough to implement in shared or web code without a new dependency.
- Out:
  - Changing `RaceResult` persistence shape unless the adapter cannot be local.
  - Adding a backend replay endpoint.
  - Replacing the existing event timeline or report text.
  - Building a replay editor or content-authoring DSL.

# Acceptance criteria
- AC1: The contract names the input data, output beat shape, timing fields, and deterministic seed/source rules.
- AC2: The contract states which fields are simulation truth and which are presentation-only.
- AC3: At least one trace order change maps to a staged overtake beat with approach, swap, and settle windows.
- AC4: The final replay beat order matches `RaceResult.classification`.
- AC5: The implementation location is justified as shared-domain helper, web replay helper, or another bounded module.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: The contract names the input data, output beat shape, timing fields, and deterministic seed/source rules.
- request-AC4 -> This backlog slice. Proof: AC2: The contract states which fields are simulation truth and which are presentation-only.
- request-AC5 -> This backlog slice. Proof: AC3: At least one trace order change maps to a staged overtake beat with approach, swap, and settle windows.
- request-AC7 -> This backlog slice. Proof: AC4: The final replay beat order matches `RaceResult.classification`.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_coherent_race_replay_and_simulation_realism_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`
- Primary task(s): `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`

# AI Context
- Summary: Define the replay staging contract
- Keywords: scaffolded-backlog, define the replay staging contract, implementation-ready
- Use when: Implementing the scaffolded slice for Define the replay staging contract.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
