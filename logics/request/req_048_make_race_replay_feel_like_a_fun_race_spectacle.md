## req_048_make_race_replay_feel_like_a_fun_race_spectacle - Make race replay feel like a fun race spectacle
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Replay spectacle and race storytelling
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Turn the replay from a technically readable animated map into a fun race spectacle that tells what is happening.
- Add a deterministic grid-start presentation so the first seconds feel like a race launch rather than a crowded marker stack.
- Add a lightweight race-director layer that narrates meaningful action without replacing the visual replay.
- Make the player's race legible through focus context: current position, gap ahead/behind, last player event, and gain/loss from start.
- Make overtakes and position changes visibly exciting through local badges, tower pulses, timeline cues, and clear `P5 -> P4` style feedback.
- Fill quiet stretches with truthful rhythm beats so the replay still has tension when there is no major event.
- Keep the implementation deterministic and presentation-only: no race outcome, reward, card, report, or simulation semantics should change.
- Avoid a new rendering engine or dependency; use existing React, SVG, CSS, replay facts, and tests.
- Coordinate with the open first-session UX corpus: global stale notifications must not cover replay spectacle elements.

# Context
- `ReplayView.tsx` already receives `RaceResult`, `ReplayTracePoint[]`, team liveries, player team id, and circuit data.
- `ReplayView.tsx` already builds deterministic `ReplayPlan` overtakes from `RaceResult.replayFacts.orderChanges` or trace order changes.
- `ReplayView.tsx` already renders a tower, map cars, timeline markers, active moment notifications, focus driver control, speed control, and replay progress.
- `CircuitMap.tsx` renders cars on projected SVG routes with livery, label, progress, and camera/focus behavior.
- `RaceResult.replayFacts` currently exposes deterministic order-change facts only; additional replay-useful facts are acceptable only if they remain domain facts and optional.
- The previous replay realism pass normalized circuit pacing and smoothed car heading, so this pass should focus on storytelling and spectacle rather than route normalization.
- `item_111_add_a_readable_staged_grid_start_beat_to_race_replay` in the first-session UX corpus overlaps with this request; this request should either consume that item or supersede it with a fuller replay-spectacle implementation.
- `item_108_replace_stale_notification_stacking_with_command_lifecycle_feedback` should be completed before final replay playtest because global notifications currently cover timeline and controls.
- No new audio, 3D, canvas renderer, replay editor, analytics, or external assets are needed for this pass.

# Acceptance criteria
- AC1: Replay starts with a deterministic grid-start beat: cars begin separated in readable grid positions, launch over a short window, and transition into existing replay movement without changing classification.
- AC2: A race-director panel or equivalent lightweight overlay surfaces the current meaningful beat with concise copy, such as attack, defense, gap opening, pack compact, weather phase, final lap pressure, or player-specific event.
- AC3: Player focus context is visible when a player team exists: current position, gain/loss from start, gap ahead, gap behind, and latest player-relevant event are available without opening the report.
- AC4: Overtakes and position changes get clear visual emphasis: local car/tower/timeline cues make the position change readable without relying only on watching car movement.
- AC5: Quiet replay stretches produce deterministic truthful rhythm beats derived from trace gaps/order/weather/events, without inventing fake overtakes or fake outcomes.
- AC6: Replay spectacle remains deterministic from the same `RaceResult` plus circuit: no random UI beats, no local-clock-dependent storytelling, and no simulation truth mutation.
- AC7: The overlay layout does not obscure replay controls, tower, timeline, car cluster, or mobile map framing at desktop and 390px mobile widths.
- AC8: Tests cover grid-start determinism, race-director beat generation, player focus context, overtake highlight mapping, quiet rhythm beat fallback, and final-order preservation.
- AC9: Existing gates still pass: typecheck, lint, unit tests, build, e2e replay/private-league checks, i18n validation if copy changes, and Logics validation.
- AC10: Playtest proof is recorded with screenshots or scripted observations across at least four circuits, including a short/technical route and a longer flowing route, showing start, mid-race action, quiet stretch, and player focus.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_002_visual_replay_v0_product_brief.md
- logics/product/prod_017_coherent_race_replay_and_simulation_realism_product_brief.md
- logics/request/req_046_make_race_simulation_and_replay_feel_coherent_across_circuits.md
- logics/request/req_047_polish_first_session_ux_after_playtest_findings.md
- logics/backlog/item_108_replace_stale_notification_stacking_with_command_lifecycle_feedback.md
- logics/backlog/item_111_add_a_readable_staged_grid_start_beat_to_race_replay.md
- logics/specs/spec_004_race_report_and_replay_ux.md
- logics/specs/spec_011_simulation_algorithm_v0.md
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/ReplayView.test.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/app/App.tsx
- apps/web/src/app/App.test.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/styles/layout.css
- packages/shared/src/domain/race.ts
- packages/shared/src/simulation/simulateRace.ts
- tests/e2e/private-league.spec.ts
- Playtest diagnostic: four resolved GP replays were reviewed across Paris Docklands, Paris Left Bank, Amsterdam Canal, and Amsterdam Harbor.
- Playtest diagnostic: replay is stable and readable as telemetry, but not yet consistently fun as a race spectacle.
- Playtest diagnostic: Amsterdam Canal became more engaging when `Launch Boost +1 pos` appeared; visible race moments create the strongest fun.
- Playtest diagnostic: starts still read as a clustered car under the start line rather than a race grid launch.
- Playtest diagnostic: when the player is P8, the tower shows the position but the replay does not explain the player's race, gaps, pressure, or losses.
- Playtest diagnostic: quiet replay stretches need non-misleading race-director beats such as pack compact, leader escaping, battle for P3, weather phase, or final lap pressure.
- Dependency diagnostic: stale global notifications currently cover replay controls and should be resolved by `item_108` before or alongside spectacle overlays.

# AI Context
- Summary: Make race replay feel like a fun race spectacle
- Keywords: request-chain-scaffold, make race replay feel like a fun race spectacle, development-ready
- Use when: You need to implement or review the scaffolded workflow for Make race replay feel like a fun race spectacle.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_113_add_deterministic_grid_start_staging_to_replay`
- `item_114_generate_race_director_beats_from_replay_facts_and_trace`
- `item_115_show_player_race_focus_context_during_replay`
- `item_116_add_overtake_and_position_change_highlights`
- `item_117_validate_replay_spectacle_across_circuits_and_quiet_stretches`
