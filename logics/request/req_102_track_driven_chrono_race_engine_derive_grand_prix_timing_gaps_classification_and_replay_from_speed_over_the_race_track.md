## req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track - Track-driven chrono race engine: derive Grand Prix timing, gaps, classification, and replay from speed over the race track
> From version: 0.4.2
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Simulation engine evolution
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Replace the score-first race decision path with a track-driven chrono model where speed, distance, elapsed time, and circuit zones determine Grand Prix classification.
- Keep the game arcade and controllable: reuse the current decisions, cards, traits, weather, and seeded variance as performance parameters rather than introducing a full physics simulator.
- Make replayTrace a direct capture of the race simulation, so car progress, speed, times, gaps, order, pit phases, overtakes, and final classification all share one source of truth.
- Preserve determinism and player-facing output contracts while allowing expected behavioral changes in timings, gaps, overtakes, and finishing order from the new model.
- Provide enough balance and invariant coverage that another AI can implement the engine without silently breaking card usefulness, weather readability, pit strategy, or replay validity.

# Context
- Current state: simulateRace.ts creates TeamState scores, applies segment deltas in applySegment, classifies by classificationScore, then createDistanceReplayTrace builds plans and trace points from final times. replayTrace.times/gaps are derived from raceDuration/progress and final times, not from an integrated speed model. The recent smoothReplayTraceSpeeds pass only changes replayTrace.cars[*].speed and deliberately leaves chronos untouched.
- Target state: the race engine should simulate each participant over normalized race distance (laps * track length) in deterministic ticks or micro-segments. Each participant has a motion state: distanceMeters, speed, elapsedTime, phase, pit state, and optional local event modifiers. Circuit speed profile and track zones are the primary constraints; decisions/cards/traits/weather modulate target speed, acceleration, braking, cornering, wet grip, consistency, attack, and reliability.
- This is not a full physics engine. Keep it arcade and data-light: no collision geometry, no continuous car-to-car physics, no new dependency, no stochastic non-determinism. The model only needs credible speed changes, finish times, gaps, overtakes, pit effects, and replay trace output.
- The existing RaceInput/RaceResult shape should remain compatible unless a minimal additive field is truly needed. Consumers include API routes, web ReplayView/replayMath, validateReplayTrace, balance scripts, and tests. Prefer a new internal module (for example packages/shared/src/simulation/chronoRaceEngine.ts) called by simulateRace, so the migration is reviewable and the old scoring helpers can be kept only for calibration/tests during the transition.
- Cards and decisions need a mapping into motion parameters. Examples: speed preparation improves topSpeed/acceleration, reliability improves consistency and incident resistance, weather preparation improves wetGrip, aggressive approach improves attack and overtaking but increases risk/variance, prudent improves consistency/braking but lowers attack, launch_boost improves launch acceleration, soft_tires improve cornering/acceleration with late fade risk, defensive_order improves defense/consistency, rain_grip/rain_mapping improve wetGrip, economy/fleet_sponsorship can trade pace for credits without becoming invisible.
- Circuit data already exposes trackLengthMeters, routeLengthMeters, laps, pitLaneProgress, trackZones, and CIRCUIT_SPEED_PROFILES with straight/braking/corner/exit factors. The new engine should consume those rather than inventing generic segment-only motion. RACE_SEGMENTS may still be used for reporting/weather/event grouping, but the chrono truth should come from integrated track progress.
- Events should become observations of the chrono simulation where possible: weather changes, pit imminent/stop/exit, overtakes, defense, minor errors, pace gains, and finish events should align with the simulated phase and trace point. Some flavor events can remain narrative, but they must not contradict the motion state.
- Replay output requirements: replayTrace.cars[*].trackProgress and distanceMeters must be monotonic except documented grid/pit allowances, speed must be bounded and smooth, order should follow distance/progress with stable tie-breaking, gaps/times should derive from elapsed race time and finish crossings, and the final trace order must match classification. validateReplayTrace should be strengthened if needed.
- Balance requirements: the new engine will change outcomes, so use balance simulations over fixed seeds to compare distribution, not exact winners. Track metrics such as average race duration, gap spread, podium volatility, card win-rate uplift, weather-prep value in rain, pit strategy value, comeback rate, and DNF/error frequency if introduced. Avoid tuning by one seed.
- Migration constraint: because the app is not live yet, exact historical behavior does not need to be preserved. Still, do not combine this with unrelated UI refactors, API auth changes, schema migrations, release automation changes, or circuit catalogue rewrites. Keep the blast radius to shared simulation plus tests/docs.

# Acceptance criteria
- AC1: simulateRace uses a deterministic track-driven chrono engine for Grand Prix results: classification is derived from finish times over simulated distance, not from classificationScore alone, and replayTrace is captured from the same motion state.
- AC2: Decisions, cards, traits, weather, pit strategy, and circuit speed profiles all feed documented motion parameters; no existing card or preparation path becomes written-but-unread.
- AC3: Times and gaps are internally coherent: final classification order, final trace order, finish events, replayTrace.times, replayTrace.gaps, and ReplayView finishTimes agree for fixed seeds.
- AC4: Motion remains arcade-realistic and valid: no backwards progress, no impossible speed, bounded acceleration/deceleration, plausible pit entry/stop/exit, and overtake phases line up with actual order changes.
- AC5: Determinism is proven across repeated runs for representative seeds/circuits/weather/pit/card combinations, and balance simulations show acceptable distributions for winner spread, gap spread, card impact, weather impact, and pit strategy impact.
- AC6: The migration is contained: public RaceInput/RaceResult contracts remain compatible unless an additive field is justified, web replay still works without UI rewrites, and unrelated API/storage/release/circuit-catalog files are untouched.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, npm run balance:sim (or a bounded documented subset), and npm run logics:validate pass, with validation evidence recorded at task closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_065_track_driven_chrono_race_engine_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- docs/release-contract.md
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/simulateRace.test.ts
- packages/shared/src/simulation/replayTrace.ts
- packages/shared/src/simulation/validateReplayTrace.ts
- packages/shared/src/simulation/validateReplayTrace.test.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/domain/decisionDeltas.ts
- packages/shared/src/domain/circuits.ts
- scripts/balance-simulations.ts
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/CircuitMap.tsx
- Design discussion on 2026-07-23: the current engine is score-first. Decisions, traits, cards, weather, and seeded variance accumulate abstract scores in simulateRace.ts; classification is derived from classificationScore(score + positionDelta), and createDistanceReplayTrace then fabricates a plausible trace/timing layer. A small safe patch now smooths replayTrace.cars[*].speed only, but chronos, gaps, and classification still come from the score-first model. The desired longer-term evolution is not a half-measure: move to an arcade track-driven chrono model where performance parameters produce speed over the circuit, the race advances through time/distance, finish times determine classification, and replayTrace is a capture of that simulation rather than a reconstruction. This is pre-live, so a core engine evolution is acceptable if it is carefully specified, deterministic, tested, and balance-calibrated.

# AI Context
- Summary: Track-driven chrono race engine: derive Grand Prix timing, gaps, classification, and replay from speed over the race track
- Keywords: request-chain-scaffold, track-driven chrono race engine: derive grand prix timing, gaps, classification, and replay from speed over the race track, development-ready
- Use when: You need to implement or review the scaffolded workflow for Track-driven chrono race engine: derive Grand Prix timing, gaps, classification, and replay from speed over the race track.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_252_define_the_chrono_engine_contract_and_motion_parameter_mapping`
- `item_253_implement_deterministic_track_driven_time_distance_simulation`
- `item_254_integrate_pit_stops_overtakes_defense_and_events_into_chrono_motion`
- `item_255_make_replay_trace_and_web_replay_consume_chrono_truth`
- `item_256_calibrate_balance_and_preserve_gameplay_value_across_the_new_engine`
- `item_257_migration_gates_tests_and_rollout_readiness_for_chrono_engine`
