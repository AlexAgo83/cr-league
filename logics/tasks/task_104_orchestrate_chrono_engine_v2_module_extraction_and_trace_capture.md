## task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture - Orchestrate chrono engine v2 module extraction and trace capture
> From version: 0.4.2
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 30%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Start by extracting the current chrono mapping/timing code into a focused internal module with tests, without changing behavior beyond import boundaries.
- [ ] 2. Add the minimal deterministic time-distance simulator behind that module and make simulateRace consume its finish times and sampled trace.
- [ ] 3. Move pit phase handling into chrono state first, then align overtake/defense annotations and replay facts with actual trace transitions.
- [ ] 4. Keep RaceInput/RaceResult compatible and avoid UI/API/storage/release/circuit catalogue changes.
- [ ] 5. Run targeted simulation/replay tests after each wave, then full typecheck/test/lint/build/e2e.
- [ ] 6. Run bounded balance simulation and document metrics, review bands, and tuning risks.
- [ ] 7. Close the task only after Logics validation is clean and the diff is contained.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_258_extract_the_chrono_race_engine_module_and_contract`
- `item_259_capture_replaytrace_from_deterministic_time_distance_motion_state`
- `item_260_align_pits_overtakes_defense_and_replay_facts_with_chrono_trace_state`
- `item_261_harden_validation_balance_reporting_and_rollout_notes_for_chrono_v2`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate chrono engine v2 module extraction and trace capture
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_103_chrono_engine_v2_extract_the_race_engine_module_and_make_replay_trace_a_minimal_time_distance_simulation`
- Product brief(s): `prod_066_chrono_engine_v2_product_brief`
- Architecture decision(s): (none yet)
