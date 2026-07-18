## task_049_orchestrate_replay_spectacle_fun_pass - Orchestrate replay spectacle fun pass
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read `ReplayView.tsx`, `CircuitMap.tsx`, replay tests, `RaceResult`/simulation domain types, i18n files, replay/private-league e2e, and the open first-session UX corpus before editing.
- [ ] 2. Confirm whether `item_108` notification cleanup is complete; if not, account for it as a visual dependency and avoid designing spectacle under stale global toasts.
- [ ] 3. Implement grid-start staging first, because it fixes the first seconds of every replay and has a narrow deterministic surface.
- [ ] 4. Build the race-director beat generator from existing replay facts, trace gaps/order, events, weather, and classification, with a readable test/debug output.
- [ ] 5. Add player focus context derived from replay state and director beats.
- [ ] 6. Map overtakes and position changes to small visual highlights on cars, tower rows, and timeline markers.
- [ ] 7. Validate across at least four circuits and record screenshots or scripted observations for start, action, quiet stretch, player focus, and result return.
- [ ] 8. Update docs/specs/Logics proof and run typecheck, lint, unit tests, build, e2e, i18n validation, and Logics validation.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_113_add_deterministic_grid_start_staging_to_replay`
- `item_114_generate_race_director_beats_from_replay_facts_and_trace`
- `item_115_show_player_race_focus_context_during_replay`
- `item_116_add_overtake_and_position_change_highlights`
- `item_117_validate_replay_spectacle_across_circuits_and_quiet_stretches`

# Definition of Done (DoD)
- [ ] Grid-start staging is deterministic, readable, and tested.
- [ ] Race-director beat generation covers action and quiet replay windows without fake events.
- [ ] Player focus context exposes position trend, nearby gaps, and latest player-relevant beat.
- [ ] Overtake/position-change highlights are visible, localized, seek-stable, and tested.
- [ ] Replay spectacle layout is verified on desktop and 390px mobile without obscuring controls/tower/timeline.
- [ ] Playtest proof covers at least four circuits with start, action, quiet stretch, player focus, and result return.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof deferred until deterministic grid-start staging is implemented and verified.
- request-AC2 -> This task. Proof deferred until race-director beat overlay is implemented and tested.
- request-AC3 -> This task. Proof deferred until player focus context is visible and tested.
- request-AC4 -> This task. Proof deferred until overtake/position-change highlights are visible and seek-stable.
- request-AC5 -> This task. Proof deferred until quiet rhythm beats are deterministic and truthful.
- request-AC6 -> This task. Proof deferred until replay spectacle determinism is covered by tests.
- request-AC7 -> This task. Proof deferred until desktop/mobile layout proof shows overlays do not obscure replay essentials.
- request-AC8 -> This task. Proof deferred until focused tests cover grid start, director beats, player context, highlights, quiet fallback, and final order.
- request-AC9 -> This task. Proof deferred until full validation gate passes.
- request-AC10 -> This task. Proof deferred until four-circuit playtest proof is recorded.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.
- Run `npm run test:e2e`.
- Run `logics-manager i18n validate` if copy changes.
- Run `npm run logics:validate`.

# Report
- Not started. This task is ready for an implementation agent.

# AI Context
- Summary: Orchestrate replay spectacle fun pass
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_048_make_race_replay_feel_like_a_fun_race_spectacle`
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)
