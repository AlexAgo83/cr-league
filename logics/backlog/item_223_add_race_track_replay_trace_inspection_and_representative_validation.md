## item_223_add_race_track_replay_trace_inspection_and_representative_validation - Add race-track replay trace inspection and representative validation
> From version: 0.3.28
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Developer validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Race-track replay correctness is hard to judge from unit tests alone because it combines trace progress, ordering, zones, pit phases, and speed-profile spans.
- Recent Prague feedback showed that subjective visibility matters, but future fixes need a repeatable developer artifact before relying on manual watching.
- A lightweight inspector can expose enough state to debug without adding product UI.

# Scope
- In:
  - Add or extend a developer command/script/test artifact that prints or snapshots representative replay trace state.
  - Include progress, live order, car phase, speed-profile kind, zone label, pit moments, and distance basis where available.
  - Cover at least Prague, Monaco, Montreal, and one race with a pit stop.
  - Use the artifact during closeout and record the representative validation proof in the orchestration task.
  - Keep the artifact deterministic and cheap enough for local investigation.
- Out:
  - Shipping a new user-facing debug panel.
  - Pixel-perfect animation screenshots as the primary validation gate.
  - Full telemetry or analytics infrastructure.

# Acceptance criteria
- AC1: A developer can inspect representative canonical replay traces without opening the app UI.
- AC2: The inspection output shows enough race-track state to diagnose tower/map/event disagreements.
- AC3: Closeout records the exact representative circuits and validation commands used.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: A developer can inspect representative canonical replay traces without opening the app UI.
- request-AC7 -> This backlog slice. Proof: AC2: The inspection output shows enough race-track state to diagnose tower/map/event disagreements.
- request-AC8 -> This backlog slice. Proof: AC3: Closeout records the exact representative circuits and validation commands used.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_059_canonical_race_track_replay_trace_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_096_canonical_race_track_replay_trace_and_simulation_handoff`
- Primary task(s): `task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff`

# AI Context
- Summary: Add race-track replay trace inspection and representative validation
- Keywords: scaffolded-backlog, add race-track replay trace inspection and representative validation, implementation-ready
- Use when: Implementing the scaffolded slice for Add race-track replay trace inspection and representative validation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
