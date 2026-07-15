## item_050_slim_the_qualifying_result_to_what_the_client_renders - Slim the qualifying result to what the client renders
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 95
> Progress: 100%
> Complexity: Medium
> Theme: Data shape honesty
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- createQualifyingResult fabricates a full RaceResult (events, replay trace, report) per qualifying run only to satisfy the type, duplicating simulateRace's output shape with a parallel hand-rolled model of roughly 54 lines.
- If the web only reads lap times from qualifying runs, the fabricated fields are dead weight persisted per run.

# Scope
- In:
  - Verify exactly which fields of qualifyingRuns[].result the web client reads (search App.tsx and feature views).
  - If only lap/best-time data is read: define a minimal qualifying result shape, update store, routes, shared types, and web accordingly, including any persisted data migration or backward-compat read.
  - If the fabricated fields are rendered: close the finding as invalid with the evidence, changing nothing.
- Out:
  - Changing qualifying gameplay, scoring, or the number of runs.
  - Building a real qualifying replay.

# Resolution (2026-07-15)
Verification done: the finding is INVALID — the web renders the fabricated result. App.tsx passes `replayQualifyingRun.result` as the `result` prop of a full `ReplayView` inside the qualifying replay modal (apps/web/src/app/App.tsx:1206), so the replay trace, events, and derived fields produced by createQualifyingResult are the data model of the qualifying replay feature, not dead weight. `qualifyingReplayTower` (App.tsx:204) also consumes the runs for the tower entries. Nothing to change; item closed with this proof per AC2.

# Acceptance criteria
- AC1: A written verification note lists every consumer field of qualifyingRuns[].result.
- AC2: Either the minimal shape ships with all gates green, or the finding is closed as invalid with proof.
- AC3: Existing qualifying flows (run, lock, suggestion) behave identically in e2e.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: A written verification note lists every consumer field of qualifyingRuns[].result.
- request-AC9 -> This backlog slice. Proof: AC2: Either the minimal shape ships with all gates green, or the finding is closed as invalid with proof.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_004_over_engineering_cleanup_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_033_over_engineering_cleanup_pass_1`
- Primary task(s): `task_034_orchestrate_over_engineering_cleanup_pass_1`

# AI Context
- Summary: Slim the qualifying result to what the client renders
- Keywords: scaffolded-backlog, slim the qualifying result to what the client renders, implementation-ready
- Use when: Implementing the scaffolded slice for Slim the qualifying result to what the client renders.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_034_orchestrate_over_engineering_cleanup_pass_1`

# Notes
> Non-semantic edit: recorded automatic task finish linkage only.

- Task `task_034_orchestrate_over_engineering_cleanup_pass_1` was finished via `logics-manager flow finish task` on 2026-07-15.
