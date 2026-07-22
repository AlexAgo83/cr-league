## req_098_chrono_replay_race_track_parity - Chrono replay race-track parity
> From version: 0.3.28
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay parity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make chrono replay traces use the same circuit speed-profile handoff as generated race traces where that concept applies to a single-car run.
- Expose chrono-compatible phases such as grid, launch, racing, and finished instead of keeping the whole moving lap as plain racing.
- Make weather and corner handling visible in chrono replay speed metadata without changing the qualifying time model or grid outcome.
- Extend the replay inspection artifact so developers can compare race and chrono traces on representative circuits.
- Keep race-only realism layers out of chrono until a real multi-car chrono or ghost feature exists.

# Context
- The user asked whether the recent race simulation and replay realism work also applies to chronos. The current answer is no: chronos use `createQualifyingRuns` and `createQualifyingReplayTrace`, not `simulateRace`.
- Chrono replays already produce a canonical single-car `replayTrace.cars` payload and the web replay pipeline can consume it. The missing part is parity at the trace-generation boundary.
- `apps/api/src/features/leagues/store.ts` already computes the circuit identity for chrono attempts and imports `trackSpeedProfileForCircuit`; the implementation should pass the circuit speed profile into all `createQualifyingRuns` call sites.
- The qualifying time model is a learning loop. This request should not retune lap times, grid positions, cards, pit strategy, bot strategy, rewards, or economy.
- Race-only concepts from `req_097` remain out of scope for chrono: pit phases, overtake stories, defense, and chrono-gap spacing require multiple cars or race events and would be fake for a solo lap.

# Acceptance criteria
- AC1: Chrono trace generation accepts and applies the circuit speed profile at the shared trace boundary, and all league chrono call sites pass the circuit profile.
- AC2: Chrono replay traces expose bounded `grid`, `launch`, `racing`, and `finished` phases with monotonic progress and stable final time.
- AC3: Weather-visible chrono handling is represented as deterministic trace-level `speed` metadata on relevant spans without changing qualifying lap-time calculation or grid outcomes.
- AC4: `npm run replay:inspect` or an equivalent existing inspection command includes representative chrono traces for Prague, Monaco, and Montreal, with progress, phase, speed, and weather context.
- AC5: Focused tests prove speed-profile application, launch phase presence, weather speed differences, deterministic output, and no lap-time regression for equal inputs.
- AC6: The corpus explicitly documents that pit stops, overtakes, defense, and multi-car gap spacing are not chrono parity requirements for this solo-run scope.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_061_chrono_replay_race_track_parity_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_096_canonical_race_track_replay_trace_and_simulation_handoff.md
- logics/request/req_097_race_replay_realism_layers_after_canonical_trace.md
- logics/scaffold/canonical-race-track-replay-trace.json
- logics/scaffold/race-replay-realism-layers.json
- apps/api/src/features/leagues/qualifying.ts
- apps/api/src/features/leagues/qualifying.test.ts
- apps/api/src/features/leagues/store.ts
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/ReplayView.test.ts
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/features/replay/replayDirector.ts
- packages/shared/src/domain/circuits.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/simulation/simulateRace.ts
- scripts/inspect-replay-trace.ts
- Current product direction: chrono replays should reuse the same race-track motion semantics that are meaningful for a solo run: circuit speed profile, launch/racing/finished phases, weather-visible handling, and inspection proof. Race-only concepts such as pit stops, overtakes, defense, and multi-car gap spacing are intentionally out of scope unless a future ghost or comparison mode adds multiple visible cars.

# AI Context
- Summary: Chrono replay race-track parity
- Keywords: request-chain-scaffold, chrono replay race-track parity, development-ready
- Use when: You need to implement or review the scaffolded workflow for Chrono replay race-track parity.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_231_apply_circuit_speed_profile_to_chrono_replay_traces`
- `item_232_add_chrono_compatible_replay_phases`
- `item_233_make_chrono_weather_handling_visible_in_trace_speed`
- `item_234_extend_replay_inspection_to_chrono_traces`
