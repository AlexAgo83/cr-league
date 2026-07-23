## task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture - Orchestrate chrono engine v2 module extraction and trace capture
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
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
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: commit `687bba5` extracted chrono timing/mapping into `packages/shared/src/simulation/chronoRaceEngine.ts`; `simulateRace` remains the public entry point and `chronoRaceEngine.test.ts` covers the module contract.
- request-AC2 -> This task. Proof: commit `f063023` added `createChronoReplayTrace`, sampling replay cars/order/times/gaps/phases/speeds from deterministic chrono car motion state.
- request-AC3 -> This task. Proof: commit `f063023` aligned pit phases, overtake annotations, defense markers, event trace progress, and `replayFacts.orderChanges` with actual sampled trace transitions.
- request-AC4 -> This task. Proof: `validateReplayTrace` covers finite final timing/gap coherence, monotonic progress, speed bounds, speed-change bounds, pit ordering, defense proximity, and overtake proximity.
- request-AC5 -> This task. Proof: RaceInput/RaceResult stayed compatible; code changes are limited to shared simulation/replay helpers/tests with no UI/API/storage/release/circuit catalogue edits.
- request-AC6 -> This task. Proof: targeted tests cover chrono module mapping/final timing/sampled trace, simulateRace deterministic replay/pit/weather/card/circuit cases, reward compatibility, and validateReplayTrace negative cases.
- request-AC7 -> This task. Proof: closeout validation records targeted tests, `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`, bounded `npm run balance:sim -- --runs 1 --circuits 2 --limit 5 --json /tmp/cr-league-chrono-v2-balance.json`, and `npm run logics:validate`.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.
- Chrono v2 implementation validation on 2026-07-23: targeted vitest packages/shared/src/simulation/chronoRaceEngine.test.ts packages/shared/src/simulation/simulateRace.test.ts packages/shared/src/simulation/validateReplayTrace.test.ts passed (38 tests); npm run typecheck passed; npm test passed (30 files, 297 tests, 7 skipped); npm run lint passed after removing stale imports; npm run build passed; npm run test:e2e passed (4 Playwright tests). Bounded balance command used the supported flags npm run balance:sim -- --runs 1 --circuits 2 --limit 5 --json /tmp/cr-league-chrono-v2-balance.json, covering 864 races. Balance highlights: circuit avgDuration 122.42s/123.48s, avgGapSpread 12.06s/16.98s; pit summary mini_pack avgPitStops 2, standard 1, heavy_pack 0; high variance remains expected with one run per strategy and is a follow-up tuning risk, not a release blocker.

# Report
- Implementation complete.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_258_extract_the_chrono_race_engine_module_and_contract`, `item_259_capture_replaytrace_from_deterministic_time_distance_motion_state`, `item_260_align_pits_overtakes_defense_and_replay_facts_with_chrono_trace_state`, `item_261_harden_validation_balance_reporting_and_rollout_notes_for_chrono_v2`
- Related request(s): `req_103_chrono_engine_v2_extract_the_race_engine_module_and_make_replay_trace_a_minimal_time_distance_simulation`
- Implemented in commits 687bba5 and f063023. Behavior changes: chrono mapping/timing moved to packages/shared/src/simulation/chronoRaceEngine.ts; simulateRace remains the public entrypoint; replay trace cars now come from deterministic sampled time-distance state inside the chrono module; pit phases, overtake phases, defense markers, replayFacts order changes, and event trace progress are aligned against the sampled trace. RaceInput/RaceResult compatibility was kept; no UI, API, storage, release, or circuit catalogue changes were made. Known tuning risk: the bounded balance run is intentionally small, so card/pit ordering should be reviewed with larger --runs before live economy balancing.

# AI Context
- Summary: Orchestrate chrono engine v2 module extraction and trace capture
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_103_chrono_engine_v2_extract_the_race_engine_module_and_make_replay_trace_a_minimal_time_distance_simulation`
- Product brief(s): `prod_066_chrono_engine_v2_product_brief`
- Architecture decision(s): (none yet)
