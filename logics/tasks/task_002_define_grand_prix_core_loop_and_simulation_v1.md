## task_002_define_grand_prix_core_loop_and_simulation_v1 - Define Grand Prix core loop and simulation V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Gameplay design
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Produce the first detailed gameplay spec for CR League's Grand Prix loop and V1 simulation model.
- The output is documentation, not production code.
- The spec should be detailed enough to drive a future implementation task for a solo vertical slice.

# Plan
- [x] 1. Confirm scope, dependencies, and linked acceptance criteria.
- [x] 2. Draft `logics/specs/spec_001_grand_prix_core_loop_and_simulation_v1.md`.
- [x] 3. Define the player-facing loop from briefing to next-race progression.
- [x] 4. Define the implementation-facing simulation contract: inputs, segments, events, outputs, and idempotency assumptions.
- [x] 5. Add a complete example Grand Prix and V1 non-goals.
- [x] 6. Update affected Logics docs in the same wave and leave the repository commit-ready.
- [x] 7. Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close a wave or step until the relevant automated tests and quality checks have been run successfully.

# Backlog
- `item_007_define_grand_prix_core_loop_and_simulation_v1`

# Definition of Done (DoD)
- [x] Spec is written and reviewable.
- [x] Validation passes.
- [x] Linked docs are synchronized.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `logics/specs/spec_001_grand_prix_core_loop_and_simulation_v1.md` exists and is linked from this task.
- request-AC2 -> This task. Proof: the spec defines all Grand Prix phases from briefing through preparation, lock/launch, resolution, replay, report, rewards, and next-race progression.
- request-AC3 -> This task. Proof: the spec defines simulation inputs, derived scores, segment resolution, event timeline contract, race result contract, replay requirements, and report requirements.
- request-AC4 -> This task. Proof: the spec includes a complete Silver Ridge GP example with choices, weather, event timeline, report explanation, rewards, and next hook.
- request-AC5 -> This task. Proof: the spec includes explicit V1 Non-goals.
- backlog-AC1 -> This task. Proof: `logics/specs/spec_001_grand_prix_core_loop_and_simulation_v1.md` is present and reviewable.
- backlog-AC2 -> This task. Proof: the spec covers both player-facing loop and implementation-facing simulation contract.
- backlog-AC3 -> This task. Proof: replay and report are generated from the normalized event timeline and race result contract.
- backlog-AC4 -> This task. Proof: V1 non-goals and implementation notes keep the spec bounded.
- backlog-AC5 -> This task. Proof: validation commands are recorded below.
- request-AC4 -> This task. Evidence needed: The spec includes at least one complete example Grand Prix showing how choices produce simulation events and report explanations.
- request-AC5 -> This task. Evidence needed: The spec explicitly bounds what is not modeled in V1.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager audit --group-by-doc`.
- Run `python3 -m logics_manager flow validate req_001_define_grand_prix_core_loop_and_simulation_v1`.
- 2026-07-13: `logics-manager lint --require-status` passed.
- 2026-07-13: `logics-manager audit --group-by-doc` passed with no blocking issues before final closeout preflight; final closeout will re-run audit.
- 2026-07-13: `logics-manager flow validate req_001_define_grand_prix_core_loop_and_simulation_v1` passed with 0 findings.
- logics-manager lint --require-status passed; logics-manager audit --group-by-doc passed; logics-manager flow validate req_001_define_grand_prix_core_loop_and_simulation_v1 passed with 0 findings.
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Design spec pending.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_007_define_grand_prix_core_loop_and_simulation_v1`
- Related request(s): `req_001_define_grand_prix_core_loop_and_simulation_v1`

# AI Context
- Summary: Define the Grand Prix loop and V1 race simulation model.
- Keywords: grand-prix-loop, simulation-v1, gameplay-spec, race-events, replay-report
- Use when: Writing or reviewing the first race-loop design spec.
- Skip when: Implementing unrelated infrastructure or UI flows.

# Links
- Request: `req_001_define_grand_prix_core_loop_and_simulation_v1`
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
