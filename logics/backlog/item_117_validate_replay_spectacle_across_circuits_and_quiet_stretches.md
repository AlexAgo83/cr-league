## item_117_validate_replay_spectacle_across_circuits_and_quiet_stretches - Validate replay spectacle across circuits and quiet stretches
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replay playtest validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Replay fun is partly qualitative, and circuit shape changes how much action is visible.
- The playtest showed stronger engagement on Amsterdam Canal than Paris Left Bank because visible beats were clearer.
- Implementation needs a repeatable validation script/checklist so another AI can prove the replay is more fun without relying only on one lucky race.

# Scope
- In:
  - Add or update e2e/playtest checks that resolve and inspect replays across at least four circuits.
  - Capture proof for start, mid-race action, quiet stretch, player focus, and finish/result return.
  - Record residual risks, especially if global notification cleanup from `item_108` is still pending.
  - Run full validation gates and Logics closeout proof.
  - Update relevant docs/specs with replay spectacle behavior and validation prompts.
- Out:
  - Formal screenshot diff infrastructure.
  - Manual testing of every city circuit.
  - Analytics instrumentation.
  - Balancing race event frequency.

# Acceptance criteria
- AC1: Validation covers at least four circuits including one short/technical and one longer flowing route.
- AC2: Proof includes replay start, mid-race action, quiet stretch, and player focus state.
- AC3: E2E or unit tests cover deterministic behavior for generated beats and highlights.
- AC4: Full local gate commands and outcomes are recorded in task closeout.
- AC5: Any remaining UX risk is documented with a clear follow-up boundary.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Validation covers at least four circuits including one short/technical and one longer flowing route.
- request-AC8 -> This backlog slice. Proof: AC2: Proof includes replay start, mid-race action, quiet stretch, and player focus state.
- request-AC9 -> This backlog slice. Proof: AC3: E2E or unit tests cover deterministic behavior for generated beats and highlights.
- request-AC10 -> This backlog slice. Proof: AC4: Full local gate commands and outcomes are recorded in task closeout.
- request-AC5 -> This backlog slice. Evidence needed: Quiet replay stretches produce deterministic truthful rhythm beats derived from trace gaps/order/weather/events, without inventing fake overtakes or fake outcomes.
- request-AC6 -> This backlog slice. Evidence needed: Replay spectacle remains deterministic from the same `RaceResult` plus circuit: no random UI beats, no local-clock-dependent storytelling, and no simulation truth mutation.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_048_make_race_replay_feel_like_a_fun_race_spectacle`
- Primary task(s): `task_049_orchestrate_replay_spectacle_fun_pass`

# AI Context
- Summary: Validate replay spectacle across circuits and quiet stretches
- Keywords: scaffolded-backlog, validate replay spectacle across circuits and quiet stretches, implementation-ready
- Use when: Implementing the scaffolded slice for Validate replay spectacle across circuits and quiet stretches.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_049_orchestrate_replay_spectacle_fun_pass`

# Notes
- Task `task_049_orchestrate_replay_spectacle_fun_pass` was finished via `logics-manager flow finish task` on 2026-07-18.
