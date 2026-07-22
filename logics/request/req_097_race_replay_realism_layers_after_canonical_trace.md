## req_097_race_replay_realism_layers_after_canonical_trace - Race replay realism layers after canonical trace
> From version: 0.3.28
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Replay realism
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Plan the next replay realism layers as small deterministic slices that build on the canonical race-track replay trace instead of introducing a physics engine.
- Add a launch and first-corner replay phase so race starts feel compact, variable, and readable without changing winners or economy.
- Make visual car spacing reflect chrono gaps so close battles look close and large gaps look isolated while preserving final classification.
- Represent pit stops as a full trace sequence with pit entry, stop, and exit phases instead of a single visual halt.
- Turn canonical order changes into prepared overtake stories with closing, attempt, and settled phases driven by simulation facts.
- Add lightweight traffic/defense behavior only when canonical gaps and zones show cars are close enough, especially outside overtake zones.
- Make weather and late-race fatigue visible through bounded pace/handling modifiers after the trace contract can keep those effects aligned.

# Context
- The user feedback is that race-track replay now feels cleaner, but the next realism gains should be deliberate rather than speculative. The right scope is not full physics; it is a set of trace-level storytelling layers that make existing race facts easier to read.
- `req_096` is the dependency. It should make generated `replayTrace.cars`, replay facts, event progress, live ordering, speed phase, zone metadata, and distance semantics canonical. This request should not bypass that contract.
- The safest order is chrono-gap spacing before traffic/defense, because proximity behavior needs a reliable definition of who is actually close. Pit-lane phases can run in parallel once canonical pit progress exists. Weather and fatigue should come later because they add variability that can hide basic trace issues.
- Every layer should be deterministic from seed, circuit, weather, traits, events, and replay facts. If a layer cannot be explained from existing canonical race data, it should be deferred instead of invented in the renderer.
- Backward compatibility with old persisted results remains a legacy adapter concern. These realism layers target newly generated canonical traces.

# Acceptance criteria
- AC1: The implementation order is documented and gated on the canonical replay trace handoff, so no realism layer depends on web-only semantic inference.
- AC2: Launch and first-corner replay behavior produces compact starts, bounded launch variation, and smooth early field separation without changing final race outcomes.
- AC3: Visual spacing for canonical traces is derived from chrono gaps with documented clamps, so close gaps, medium gaps, and large gaps read consistently on the map and tower.
- AC4: Pit-stop trace output includes pit entry, pit stop, and pit exit phases with aligned event markers, live ordering, and visible time loss.
- AC5: Overtake facts can render as closing, attempt, and settled phases tied to canonical zones and order changes, with no renderer-invented overtakes.
- AC6: Traffic/defense effects apply only under canonical proximity and zone conditions, remain bounded, and do not contradict the final classification.
- AC7: Weather and late-race pace effects are visible, deterministic, bounded, and trace-level; they do not retune rewards, cards, bot strategy, or economy in this request.
- AC8: Each shipped layer includes focused replay/simulation tests or inspection proof, plus `npm run typecheck`, `npm run lint`, `npm run audit:circuits`, and `npm run logics:validate`; broader tests/build are run or explicitly justified in closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_046_make_race_simulation_and_replay_feel_coherent_across_circuits.md
- logics/request/req_048_make_race_replay_feel_like_a_fun_race_spectacle.md
- logics/request/req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map.md
- logics/request/req_093_canonical_track_zones_for_spatial_race_simulation.md
- logics/request/req_095_canonical_corner_speed_profile_for_replay_motion.md
- logics/request/req_096_canonical_race_track_replay_trace_and_simulation_handoff.md
- logics/scaffold/canonical-race-track-replay-trace.json
- packages/shared/src/domain/race.ts
- packages/shared/src/domain/circuits.ts
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/validateReplayTrace.ts
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/features/replay/replayDirector.ts
- apps/web/src/features/replay/useReplayClock.ts
- apps/web/src/features/CircuitMap.tsx
- scripts/audit-circuits.mjs
- Current product direction: after the canonical race-track trace work, replay realism should improve through small deterministic layers: launch/first-corner behavior, chrono-gap visual spacing, pit-lane phases, prepared overtakes, traffic/defense, weather-visible handling, and late-race pace fade.
- Architecture constraint: these layers must build on the canonical replay trace handoff from `req_096`. The simulation/shared layer decides race facts and trace semantics; the web layer renders them. Avoid adding independent visual-only inference that can make map, tower, events, and final classification disagree.

# AI Context
- Summary: Race replay realism layers after canonical trace
- Keywords: request-chain-scaffold, race replay realism layers after canonical trace, development-ready
- Use when: You need to implement or review the scaffolded workflow for Race replay realism layers after canonical trace.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_224_add_launch_and_first_corner_replay_phase`
- `item_225_map_chrono_gaps_to_visual_replay_spacing`
- `item_226_represent_pit_stops_as_entry_stop_and_exit_trace_phases`
- `item_227_turn_order_changes_into_prepared_overtake_stories`
- `item_228_add_bounded_traffic_and_defense_behavior`
- `item_229_make_weather_visible_in_replay_handling`
- `item_230_add_late_race_pace_fade_to_replay_traces`
