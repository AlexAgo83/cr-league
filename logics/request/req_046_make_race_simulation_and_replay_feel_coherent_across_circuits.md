## req_046_make_race_simulation_and_replay_feel_coherent_across_circuits - Make race simulation and replay feel coherent across circuits
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 99
> Confidence: 95
> Complexity: High
> Theme: Race simulation realism and replay coherence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the visual replay feel like a believable arcade race rather than a raw interpolation of classification math.
- Normalize circuit pacing so different city routes remain distinct but do not produce wildly different replay lengths, lap counts, or perceived race duration.
- Prefer longer, more flowing circuit profiles when normalization needs a bias: short or very twisty routes should not become the reference feel for the championship.
- Separate race outcome truth from replay presentation so the simulation stays deterministic while the replay can stage overtakes, gaps, and momentum more convincingly.
- Enrich `RaceResult` with deterministic race facts if the current payload is too sparse for a convincing replay: finer gaps, order-change facts, pressure windows, momentum shifts, and event-to-replay metadata are acceptable.
- Audit the current circuit geometry and lap counts with a repeatable tool before changing balance-sensitive values.
- Smooth car heading through direction changes: cars currently snap to each polyline segment's angle at route vertices, which reads as brutal, unrealistic turns; heading should interpolate continuously along the route with a visual drift/slide effect at sharp corners so cornering feels natural and arcade-plausible.
- Give implementation agents a way to inspect replay scripts themselves through deterministic debug output, fixtures, or a small readable replay-plan dump.
- Keep the work development-ready for another AI: clear files, scope, acceptance criteria, risks, validation gates, and staged implementation order.

# Context
- The product now has a playable asynchronous championship loop, a visual replay map, timed replay notifications, circuit maps, garage progression, and validation coverage.
- The current simulation in `packages/shared/src/simulation/simulateRace.ts` decides standings through five race segments and emits `ReplayTracePoint` snapshots with progress, order, times, and gaps.
- The current replay in `apps/web/src/features/ReplayView.tsx` derives live position, tower order, progress markers, weather markers, car progress, and camera state from the simulation trace plus `CityCircuit.laps`.
- The current map in `apps/web/src/features/CircuitMap.tsx` projects city routes and places cars on the route path by progress. It does not own race outcome logic.
- The current circuit identities in `packages/shared/src/domain/circuits.ts` define lap counts and traits, while `apps/web/src/app/circuits.ts` owns the detailed display routes. These two sources must stay aligned.
- A quick display-distance sample showed a large spread in total visual race distance: Paris Left Bank Loop is roughly 3.1 times Berlin Mitte Dash after applying current lap counts.
- Circuit normalization should not blindly equalize every route. Larger circuits and routes with fewer sharp turns should be favored as the target feel because they better support readable replay spacing, camera tracking, and overtakes.
- The desired feel is arcade-plausible, not a full racing physics model. Scripted passing beats, close-follow moments, and presentation-only interpolation are in scope if the final classification and event semantics remain deterministic.
- `RaceResult` may grow to expose replay-useful race facts, but it must not contain UI animation instructions, CSS concepts, camera choreography, or display-only easing values.
- `RaceResult.replayTrace` is already optional and older persisted races rely on a fallback trace in `ReplayView`, so any enrichment field must be optional and the replay must degrade gracefully for already-resolved Grands Prix.
- `replayDistanceScale` in `ReplayView` already normalizes perceived replay duration to a reference distance, so the audit must establish whether the measured distance spread shows up as duration drift or as on-screen car-speed differences before deciding what to normalize.
- `CircuitMap.tsx` already has a partial drift mechanism (`DRIFT_LOOKAHEAD`, `MAX_DRIFT_ANGLE`, `angleDelta`) applied as a rotation offset, but the base car angle comes from a per-segment `atan2` in `poseOnRoute`, so heading still snaps at polyline vertices. The fix is presentation-only (smoother heading interpolation plus tuned drift) and belongs in the map/replay view layer, never in `RaceResult`.
- Verified: `circuit.laps` is not read by `simulateRace`, so lap normalization changes no race outcome. Consequence to document: already-persisted races replay with the new lap counts because the replay reads current circuit data — this perceived-pacing change on old replays is the accepted, documented exception under AC3.

# Acceptance criteria
- AC1: A documented circuit audit reports per-circuit display route length, configured laps, total display distance, recommended laps, and outliers, with a repeatable command checked into the repo.
- AC2: Circuit lap counts or replay distance scaling are adjusted so normal race routes land inside an agreed target band for perceived total race distance, favoring longer and less twisty routes as the reference feel, with explicit exceptions if any route intentionally remains shorter or tighter.
- AC3: The race outcome model remains deterministic and keeps final classification, rewards, consumed cards, report text, and event semantics stable unless a change is deliberately documented.
- AC4: `RaceResult` is enriched when needed with deterministic replay-useful race facts, such as finer gaps, order-change facts, pressure windows, attack/defense context, momentum shifts, and event-to-replay metadata, without storing UI animation instructions.
- AC5: A presentation-layer replay script or staging adapter converts `RaceResult` plus circuit context into deterministic replay beats for starts, pace phases, close-follow phases, attack setup, overtakes, defense, gap rebuild, weather changes, key events, and finish order.
- AC6: Replay overtakes are visually staged as approach, overlap or offset, order swap, and settle phases instead of abrupt rank jumps or disconnected car positions, and the script can be inspected through a readable debug dump or deterministic fixture.
- AC7: Replay behavior is consistent across at least the shortest, longest, most technical, and wettest circuits in the rotation, with desktop and mobile screenshots or e2e checks showing no broken framing or overlapping labels.
- AC8: Unit tests cover circuit normalization math, RaceResult enrichment determinism, replay script determinism, final-order preservation, and at least one multi-overtake trace.
- AC9: Existing gates still pass: typecheck, lint, unit tests, build, e2e replay/private-league checks, i18n validation if copy changes, and Logics validation.
- AC10: Car heading changes continuously along the route instead of snapping at polyline vertices: heading is interpolated (with lookahead or corner smoothing) and sharp corners show a bounded visual drift/slide effect, with tunable constants and a unit test proving heading continuity on a route with at least one sharp turn.

# AC Traceability
- AC1 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: `scripts/audit-circuits.mjs` now reads current circuit identity/lap data and route geometry, prints route length, laps, race distance, recommended laps, turn count, twistiness, geometry failures, and target-band status.
- AC2 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: `packages/shared/src/domain/circuits.ts` normalizes short circuits to the audit target band while preserving larger flowing circuits as the reference feel; `npm run audit:circuits` reports every circuit as `target`.
- AC3 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: `simulateRace` still produces deterministic final classification/rewards/report semantics, `circuit.laps` is not used by simulation, and `npm test` covers simulation determinism after replay changes.
- AC4 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: `RaceResult.replayFacts` adds optional deterministic `orderChanges` domain facts only; no UI animation, camera, CSS, or display coordinates are stored in `RaceResult`.
- AC5 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: `buildReplayPlan` in `apps/web/src/features/ReplayView.tsx` converts `RaceResult`/trace data into deterministic overtake beats with setup, close-gap, overlap, swap, and settle phases.
- AC6 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: replay car progress consumes the staged plan, `replayPlanDebugLines` exposes a readable deterministic dump, and `ReplayView.test.ts` asserts inspectable staged phases from an order-change trace.
- AC7 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: `tests/e2e/private-league.spec.ts` passes across desktop/mobile replay layout checks after normalized laps, and Playwright captured the existing representative replay screenshots.
- AC8 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: tests cover circuit audit/normalization via `npm run audit:circuits`, `RaceResult` replay facts in `simulateRace.test.ts`, replay plan determinism/inspectability in `ReplayView.test.ts`, final order preservation in existing replay tests, and heading continuity in `CircuitMap.test.ts`.
- AC9 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: passed `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, and `npm run logics:validate`.
- AC10 -> `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`. Proof: `CircuitMap.tsx` now computes heading from lookahead points instead of raw segment `atan2`, keeps bounded drift via `MAX_DRIFT_ANGLE`, and `CircuitMap.test.ts` proves bounded heading deltas on a sharp-turn route.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_017_coherent_race_replay_and_simulation_realism_product_brief`
- Architecture decision(s): recorded in the `item_105_define_the_replay_staging_contract` staging contract doc (no separate ADR)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/product/prod_002_visual_replay_v0_product_brief.md
- logics/product/prod_010_full_width_replay_moment_notifications_product_brief.md
- logics/specs/spec_001_grand_prix_core_loop_and_simulation_v1.md
- logics/specs/spec_004_race_report_and_replay_ux.md
- logics/specs/spec_011_simulation_algorithm_v0.md
- logics/specs/spec_016_implementation_roadmap.md
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/ReplayView.test.ts
- apps/web/src/app/circuits.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/App.test.tsx
- packages/shared/src/domain/race.ts
- packages/shared/src/domain/circuits.ts
- packages/shared/src/domain/circuits.test.ts
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/simulateRace.test.ts
- tests/e2e/private-league.spec.ts
- Current diagnostic: `simulateRace` emits a five-segment `replayTrace`; `ReplayView` turns it into replay movement using `circuit.laps`, `circuitDisplayLength`, `replayDistanceScale`, trace gaps, and rank transitions.
- Current diagnostic: display-distance sampling reported total visual distances from about 3235 units for Berlin Mitte Dash to about 10155 units for Paris Left Bank Loop, so circuits do not currently feel comparable in replay length.
- Current diagnostic: scripted/arcade overtakes are acceptable, but order changes should feel staged instead of teleporting between unrelated circuit progress states.

# AI Context
- Summary: Make race simulation and replay feel coherent across circuits
- Keywords: request-chain-scaffold, make race simulation and replay feel coherent across circuits, development-ready
- Use when: You need to implement or review the scaffolded workflow for Make race simulation and replay feel coherent across circuits.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_104_audit_and_normalize_circuit_race_distances`
- `item_105_define_the_replay_staging_contract`
- `item_106_implement_arcade_plausible_replay_movement`
- `item_107_validate_replay_realism_with_tests_and_playtest_prompts`
