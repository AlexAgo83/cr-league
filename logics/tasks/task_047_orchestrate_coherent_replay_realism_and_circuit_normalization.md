## task_047_orchestrate_coherent_replay_realism_and_circuit_normalization - Orchestrate coherent replay realism and circuit normalization
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 99
> Confidence: 95
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex-work4

# Context
- This task coordinates the implementation of `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`.
- Start from the current five-segment simulation trace, the React/SVG replay map, and the existing circuit route/lap data.
- The first implementation wave must measure current circuit distance drift before changing laps, scaling, or replay animation behavior.
- Normalization should bias toward larger, more flowing circuits rather than using the shortest or twistiest layouts as the target feel.
- Keep simulation truth separate from replay presentation: final classification, reports, rewards, and consumed cards remain deterministic outcome data.
- If the current `RaceResult` is too sparse, enrich it with deterministic race facts before making the replay layer infer too much.
- Replay tuning must include a readable plan/debug output so the implementation agent can inspect scripted beats directly.
- Backward compatibility is mandatory: `RaceResult.replayTrace` is already optional and older persisted races rely on `fallbackReplayTrace`; enrichment fields must be optional and staging must degrade gracefully so already-resolved Grands Prix keep a working replay.
- The audit must distinguish duration drift from on-screen speed differences: `replayDistanceScale` in `ReplayView.tsx` already normalizes perceived duration to a reference distance, so the 3.1x distance spread may manifest as car speed, not replay length.
- Heading smoothing must account for both animation paths in `CircuitMap.tsx` (pose-based transform and the SMIL `animateMotion` fallback), flag degenerate route geometry before interpolating, precompute heavy work outside the `requestAnimationFrame` loop, and record the accepted consequence that persisted races replay with new lap counts.

# Plan
- [x] 1. Read the current simulation, replay, circuit, map, and tests before editing: `simulateRace.ts`, `race.ts`, `circuits.ts`, `ReplayView.tsx`, `CircuitMap.tsx`, and replay/private-league tests.
- [x] 2. Add the circuit audit command first and capture route length, lap count, total distance, and a simple twistiness/complexity signal so lap or scaling changes are evidence-based.
- [x] 3. Choose the target perceived total-distance band, bias it toward larger and more flowing circuits, then normalize lap counts or replay scaling while keeping shared and web circuit data aligned.
- [x] 4. Define the replay staging contract before implementation, including whether `RaceResult` needs deterministic race-fact enrichment and where the boundary with presentation-only beats sits.
- [x] 5. Add minimal `RaceResult` enrichment if needed, then implement deterministic replay staging and integrate it into `ReplayView` with detailed staged overtake movement, tower agreement, marker seeking, and finish-order preservation.
- [x] 5b. Smooth car heading through direction changes: replace the per-segment `atan2` snap in `CircuitMap.tsx` `poseOnRoute` with continuous heading interpolation and tune the existing `DRIFT_LOOKAHEAD`/`MAX_DRIFT_ANGLE` drift so sharp corners read as a natural bounded drift/slide (presentation-only, deterministic, tunable constants).
- [x] 6. Validate shortest, longest, wettest, and high-overtaking circuits with focused tests and visual screenshots on desktop and mobile.
- [x] 7. Update specs, playtest prompts, and Logics proof, then run typecheck, lint, unit tests, build, e2e, i18n validation if copy changed, and Logics validation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_104_audit_and_normalize_circuit_race_distances`
- `item_105_define_the_replay_staging_contract`
- `item_106_implement_arcade_plausible_replay_movement`
- `item_107_validate_replay_realism_with_tests_and_playtest_prompts`

# Definition of Done (DoD)
- [x] Circuit audit command and output contract are implemented and documented.
- [x] Circuit lap counts or replay scaling are normalized against the selected target band, with a documented bias toward larger and less twisty routes.
- [x] Replay staging contract is implemented or documented before presentation integration, including the `RaceResult` enrichment decision and readable debug or fixture output.
- [x] Any `RaceResult` enrichment is deterministic, domain-level, and avoids UI animation details.
- [x] Replay movement stages overtakes and preserves final classification deterministically.
- [x] Car heading is continuous through direction changes with a bounded drift effect at sharp corners, proven by a heading-continuity unit test.
- [x] Representative circuit extremes are validated with tests and desktop/mobile visual checks.
- [x] Affected specs/docs and Logics closeout proof are updated.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `scripts/audit-circuits.mjs` reads circuit identities plus route geometry and reports route length, configured laps, total race distance, recommended laps, turn count, twistiness, target-band status, and geometry failures.
- request-AC2 -> This task. Proof: `packages/shared/src/domain/circuits.ts` normalizes short route lap counts into the audit target band, while larger flowing circuits define the reference feel; `npm run audit:circuits` reports every circuit as target.
- request-AC3 -> This task. Proof: replay changes leave final classification, rewards, cards, reports, and event semantics in `simulateRace` deterministic; lap count changes are display-only because simulation does not read `circuit.laps`.
- request-AC4 -> This task. Proof: `RaceResult.replayFacts` adds optional deterministic order-change facts and stores no UI animation instructions, camera choreography, CSS, or display coordinates.
- request-AC5 -> This task. Proof: `buildReplayPlan` converts `RaceResult` and trace data into deterministic overtake beats with setup, close-gap, overlap, swap, and settle phases.
- request-AC6 -> This task. Proof: replay car progress consumes the staged overtake plan, and `replayPlanDebugLines` exposes a readable deterministic dump covered by `ReplayView.test.ts`.
- request-AC7 -> This task. Proof: `tests/e2e/private-league.spec.ts` covers desktop and mobile replay/private-league flows after normalized laps, including replay framing assertions.
- request-AC8 -> This task. Proof: unit tests cover replay facts, replay plan determinism, multi-overtake trace handling, final-order preservation, and heading continuity; `npm run audit:circuits` validates normalization math.
- request-AC9 -> This task. Proof: passed `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, and `npm run logics:validate` during closeout.
- request-AC10 -> This task. Proof: `CircuitMap.tsx` computes route heading from lookahead points, keeps drift bounded by `MAX_DRIFT_ANGLE`, and `CircuitMap.test.ts` proves continuity on a sharp-turn route.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.
- Run focused replay/private-league e2e checks, then `npm run test:e2e` if feasible.
- Run `logics-manager i18n validate` if user-facing copy changes.
- Run `npm run logics:validate` or `logics-manager lint --require-status && logics-manager audit --group-by-doc`.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Implemented circuit audit metrics and lap normalization; `npm run audit:circuits` reports every circuit inside the target band.
- Added optional deterministic `RaceResult.replayFacts.orderChanges` and kept replay facts domain-level.
- Added `buildReplayPlan` and `replayPlanDebugLines` for staged, inspectable replay overtakes.
- Smoothed `CircuitMap` heading through corners with lookahead heading and bounded drift.
- Updated unit/e2e coverage and current UI assertions for normalized laps, profile version, garage default tab, and dynamic replay traits.
- Validation passed: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, `npm run logics:validate`.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_104_audit_and_normalize_circuit_race_distances`, `item_105_define_the_replay_staging_contract`, `item_106_implement_arcade_plausible_replay_movement`, `item_107_validate_replay_realism_with_tests_and_playtest_prompts`
- Related request(s): `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`

# AI Context
- Summary: Orchestrate coherent replay realism and circuit normalization
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`
- Product brief(s): `prod_017_coherent_race_replay_and_simulation_realism_product_brief`
- Architecture decision(s): recorded in the `item_105_define_the_replay_staging_contract` staging contract doc (no separate ADR)
