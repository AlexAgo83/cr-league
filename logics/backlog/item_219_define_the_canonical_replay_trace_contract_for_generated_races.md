## item_219_define_the_canonical_replay_trace_contract_for_generated_races - Define the canonical replay trace contract for generated races
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 55%
> Complexity: Medium
> Theme: Replay data model
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- New race results carry rich replay facts, but the exact completeness contract is implicit.
- Replay consumers still tolerate missing facts by reconstructing order changes, director beats, pit progress, and live context.
- Without a strict generated-trace contract, future replay and simulation changes can add another local interpretation path.

# Scope
- In:
  - Document and type-check the required replay trace/facts shape for newly resolved races.
  - Require per-car `trackProgress`, phase, and enough timing/order data for live tower and map rendering.
  - Require canonical event progress, director beats, order changes, and zone metadata where current consumers need them.
  - Keep optional fields only where persisted legacy results need compatibility, not as the default generated-race path.
  - Extend or add replay trace validation so generated races fail loudly when required canonical fields are missing.
- Out:
  - Changing final classification or result scoring.
  - Deleting legacy replay support before an adapter exists.
  - Adding physics-only fields that have no current consumer.

# Acceptance criteria
- AC1: The required generated-race replay trace/facts contract is documented in Logics closeout or code-adjacent docs.
- AC2: Tests or validation prove newly resolved races include complete car progress, event progress, order changes, director beats, and zone metadata needed by current replay consumers.
- AC3: Generated-race consumers can distinguish canonical trace data from legacy fallback data.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The required generated-race replay trace/facts contract is documented in Logics closeout or code-adjacent docs.
- request-AC2 -> This backlog slice. Proof: AC2: Tests or validation prove newly resolved races include complete car progress, event progress, order changes, director beats, and zone metadata needed by current replay consumers.
- request-AC4 -> This backlog slice. Proof: AC3: Generated-race consumers can distinguish canonical trace data from legacy fallback data.
- request-AC8 -> This backlog slice. Proof: AC3: Generated-race consumers can distinguish canonical trace data from legacy fallback data.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_059_canonical_race_track_replay_trace_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_096_canonical_race_track_replay_trace_and_simulation_handoff`
- Primary task(s): `task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff`

# AI Context
- Summary: Define the canonical replay trace contract for generated races
- Keywords: scaffolded-backlog, define the canonical replay trace contract for generated races, implementation-ready
- Use when: Implementing the scaffolded slice for Define the canonical replay trace contract for generated races.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
