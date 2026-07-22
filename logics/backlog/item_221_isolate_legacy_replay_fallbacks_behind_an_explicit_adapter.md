## item_221_isolate_legacy_replay_fallbacks_behind_an_explicit_adapter - Isolate legacy replay fallbacks behind an explicit adapter
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Replay architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- `replayMath.ts` and `replayDirector.ts` still contain fallback reconstruction paths for facts that the simulation now emits.
- Those fallbacks are useful for older persisted results but dangerous if they silently mask incomplete newly generated results.
- Mixing canonical and inferred data in the same helper makes it harder to reason about tower/map/event disagreements.

# Scope
- In:
  - Identify every replay fallback path for director beats, order changes, pit-stop trace progress, player context, generated car progress, and final-time-only movement.
  - Move legacy reconstruction into one explicit adapter or guard that marks the resulting replay data as legacy/fallback.
  - Make generated races use the canonical path and fail validation or tests if required facts are missing.
  - Keep older persisted results watchable through the adapter with focused compatibility tests.
  - Update replay tests so canonical traces and legacy traces have separate expectations.
- Out:
  - Deleting stored legacy race results.
  - Changing public result schemas in a migration-unsafe way.
  - Rewriting ReplayView as part of this request.

# Acceptance criteria
- AC1: Replay fallback reconstruction is centralized or clearly guarded as legacy-only.
- AC2: New generated races no longer silently fall back when canonical replay facts are missing.
- AC3: Tests prove at least one legacy result without complete trace data still produces a valid replay.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Replay fallback reconstruction is centralized or clearly guarded as legacy-only.
- request-AC4 -> This backlog slice. Proof: AC2: New generated races no longer silently fall back when canonical replay facts are missing.
- request-AC8 -> This backlog slice. Proof: AC3: Tests prove at least one legacy result without complete trace data still produces a valid replay.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_059_canonical_race_track_replay_trace_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_096_canonical_race_track_replay_trace_and_simulation_handoff`
- Primary task(s): `task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff`

# AI Context
- Summary: Isolate legacy replay fallbacks behind an explicit adapter
- Keywords: scaffolded-backlog, isolate legacy replay fallbacks behind an explicit adapter, implementation-ready
- Use when: Implementing the scaffolded slice for Isolate legacy replay fallbacks behind an explicit adapter.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
