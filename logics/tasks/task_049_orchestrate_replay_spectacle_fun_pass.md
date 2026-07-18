## task_049_orchestrate_replay_spectacle_fun_pass - Orchestrate replay spectacle fun pass
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex-work4

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read `ReplayView.tsx`, `CircuitMap.tsx`, replay tests, `RaceResult`/simulation domain types, i18n files, replay/private-league e2e, and the open first-session UX corpus before editing.
- [x] 2. Confirm whether `item_108` notification cleanup is complete; if not, account for it as a visual dependency and avoid designing spectacle under stale global toasts.
- [x] 3. Implement grid-start staging first, because it fixes the first seconds of every replay and has a narrow deterministic surface.
- [x] 4. Build the race-director beat generator from existing replay facts, trace gaps/order, events, weather, and classification, with a readable test/debug output.
- [x] 5. Add player focus context derived from replay state and director beats.
- [x] 6. Map overtakes and position changes to small visual highlights on cars, tower rows, and timeline markers.
- [x] 7. Validate across at least four circuits and record screenshots or scripted observations for start, action, quiet stretch, player focus, and result return.
- [x] 8. Update docs/specs/Logics proof and run typecheck, lint, unit tests, build, e2e, i18n validation, and Logics validation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_113_add_deterministic_grid_start_staging_to_replay`
- `item_114_generate_race_director_beats_from_replay_facts_and_trace`
- `item_115_show_player_race_focus_context_during_replay`
- `item_116_add_overtake_and_position_change_highlights`
- `item_117_validate_replay_spectacle_across_circuits_and_quiet_stretches`

# Definition of Done (DoD)
- [x] Grid-start staging is deterministic, readable, and tested.
- [x] Race-director beat generation covers action and quiet replay windows without fake events.
- [x] Player focus context exposes position trend, nearby gaps, and latest player-relevant beat.
- [x] Overtake/position-change highlights are visible, localized, seek-stable, and tested.
- [x] Replay spectacle layout is verified on desktop and 390px mobile without obscuring controls/tower/timeline.
- [x] Playtest proof covers at least four circuits with start, action, quiet stretch, player focus, and result return.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `gridStartCarProgress` and `applyGridStart` create deterministic separated launch positions before normal trace movement; final classification is untouched and tested.
- request-AC2 -> This task. Proof: `buildRaceDirectorBeats` and `.replay-director-panel` surface grid, overtake/player, pack, weather, and final beats from existing facts/trace/weather.
- request-AC3 -> This task. Proof: `playerReplayContext` exposes current position, start delta, gap ahead, gap behind, and latest player-related beat in `.replay-player-focus-panel`.
- request-AC4 -> This task. Proof: existing car delta pops are retained, tower rows now receive gain/loss classes and delta chips, and director timeline markers are seekable.
- request-AC5 -> This task. Proof: quiet pack beats are derived from trace order/gaps only and do not invent overtakes or outcomes.
- request-AC6 -> This task. Proof: all replay spectacle helpers are pure functions over `RaceResult`, trace, circuit laps, and player id; covered by `ReplayView.test.ts`.
- request-AC7 -> This task. Proof: e2e `keeps replay layout zones separated` passed after the overlay additions, including desktop replay controls/tower/timeline separation.
- request-AC8 -> This task. Proof: `ReplayView.test.ts` covers grid start, director beats, player context, quiet fallback, and final-order preservation.
- request-AC9 -> This task. Proof: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, and `npm run logics:validate` passed.
- request-AC10 -> This task. Proof: Playwright private-league loop plus replay layout e2e exercise multiple generated rounds/circuits and record replay/drive screenshots under `test-results/`.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.
- Run `npm run test:e2e`.
- Run `logics-manager i18n validate` if copy changes.
- Run `npm run logics:validate`.
- Validation passed: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e, logics-manager i18n validate, npm run logics:validate.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Delivered in commit `3767020` and the final closeout commit. Replay now starts with staged grid spacing, shows a race-director overlay, gives the player position/gap context, highlights position changes in cars/tower/timeline, and keeps the implementation deterministic/presentation-only. Full validation passed.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_113_add_deterministic_grid_start_staging_to_replay`, `item_114_generate_race_director_beats_from_replay_facts_and_trace`, `item_115_show_player_race_focus_context_during_replay`, `item_116_add_overtake_and_position_change_highlights`, `item_117_validate_replay_spectacle_across_circuits_and_quiet_stretches`
- Related request(s): `req_048_make_race_replay_feel_like_a_fun_race_spectacle`

# AI Context
- Summary: Orchestrate replay spectacle fun pass
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_048_make_race_replay_feel_like_a_fun_race_spectacle`
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)
