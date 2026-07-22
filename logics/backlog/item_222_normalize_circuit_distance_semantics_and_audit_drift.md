## item_222_normalize_circuit_distance_semantics_and_audit_drift - Normalize circuit distance semantics and audit drift
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 55%
> Complexity: Medium
> Theme: Race-track data model
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The circuit identity carries both `trackLengthMeters` and `routeLengthMeters`, and their values can differ significantly on some circuits.
- `trackLengthMeters` currently feeds simulation distance and some labels, while `routeLengthMeters` feeds replay pacing.
- The difference may be intentional, but without a named contract and audit threshold it reads as inconsistent data.

# Scope
- In:
  - Define the meaning of `trackLengthMeters` and `routeLengthMeters` in docs and code comments only where necessary.
  - Choose the owner for simulation scoring distance, replay pacing, and UI distance labels.
  - Extend circuit audit so large differences are either accepted with documented intent or flagged.
  - Update affected helpers so distance labels and replay scaling use the chosen source consistently.
  - Add focused tests for the distance contract where current behavior has changed or was ambiguous.
- Out:
  - Regenerating all route geometry unless audit proves it is required.
  - Changing race balance by recalculating historical results.
  - Adding user-facing technical labels for both distances.

# Acceptance criteria
- AC1: The distance contract is documented and reflected in the relevant helper names or tests.
- AC2: `audit:circuits` fails or warns on suspicious undocumented drift between simulation and route distances.
- AC3: Replay pacing, simulation distance, and circuit distance labels use the chosen sources consistently.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: The distance contract is documented and reflected in the relevant helper names or tests.
- request-AC8 -> This backlog slice. Proof: AC2: `audit:circuits` fails or warns on suspicious undocumented drift between simulation and route distances.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_059_canonical_race_track_replay_trace_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_096_canonical_race_track_replay_trace_and_simulation_handoff`
- Primary task(s): `task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff`

# AI Context
- Summary: Normalize circuit distance semantics and audit drift
- Keywords: scaffolded-backlog, normalize circuit distance semantics and audit drift, implementation-ready
- Use when: Implementing the scaffolded slice for Normalize circuit distance semantics and audit drift.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
