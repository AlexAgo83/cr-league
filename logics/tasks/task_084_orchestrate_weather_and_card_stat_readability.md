## task_084_orchestrate_weather_and_card_stat_readability - Orchestrate weather and card stat readability
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Trace the resolved-weather UI path from ReplayProgress and DriveView before editing.
- [x] 2. Move resolved-weather detail into a compact circuit info modal using existing modal patterns.
- [x] 3. Adjust shared card badge CSS to wrap to at least two rows in card cells.
- [x] 4. Add native localized hover/focus explanations to CardStatBadges using existing stat hint copy.
- [x] 5. Run typecheck, focused tests, lint, full tests, build, e2e, and Logics validation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_181_move_resolved_weather_details_to_a_circuit_info_modal`
- `item_182_wrap_card_stat_badges_and_add_stat_explanations`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: `DriveView` renders the compact circuit Info button with the existing map action button styling when `result` is available.
- request-AC3 -> This task. Proof: `RaceWeatherModal` lists the five `RACE_SEGMENTS` with resolved weather in EN/FR and uses the shared `Modal` close behavior.
- request-AC5 -> This task. Proof: `CardStatBadges` adds localized `title`, `aria-label`, and keyboard focus to Grip, Attack, and Endurance stat badges.
- request-AC7 -> This task. Proof: typecheck OK; lint OK; vitest 230 passed / 4 skipped; build OK; e2e 4 passed; `logics:validate` OK.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- typecheck OK; lint OK; vitest 230 passed / 4 skipped; build OK; e2e 4 passed; logics:validate OK
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- 2026-07-21 wave: moved pre-race opponent configurations out of Drive and into Plan > Chrono after session history, so comparison lives with chrono learning instead of cluttering the circuit view.
- 2026-07-21 wave: moved the selected-card consumption warning into the plan risk panel, keeping the warning visible with the risk read instead of burying it inside the card picker.
- 2026-07-21 wave: moved the Plan primary command below the active configuration choices, so the user reviews the setup list before sending or launching.
- 2026-07-21 wave: split session history into its own panel attached to the chrono header and restyled opponent configuration rows to reuse the session-history cell language with the team name as the row action.
- 2026-07-21 wave: removed the leftover chrono header surface strip and changed opponent rows to team-first, two-column configuration cells.
- 2026-07-21 wave: corrected opponent layout so each team's four config cells stay on one line while the opponent entries themselves flow into two columns when space allows.
- 2026-07-21 wave: added the available New chrono action beside the bottom Plan command so players can retest before sending the plan without leaving the directive panel.
- 2026-07-21 wave: tuned directive command emphasis so New chrono is highlighted before any run and Send plan is highlighted once at least one chrono exists.
- 2026-07-21 wave: moved the chrono hero background onto the panel itself and removed the attached-panel overlap, preventing the light panel surface from showing behind the header on mobile.
- 2026-07-21 wave: moved resolved weather details from the replay legend into a Drive circuit Info modal, with five phase rows and preserved timeline weather markers.
- 2026-07-21 wave: card stat badges now wrap across two reserved rows on Plan/Garage card cells and expose localized native explanations on hover/focus.
- Remaining: none for this task; ready for closeout.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_181_move_resolved_weather_details_to_a_circuit_info_modal`, `item_182_wrap_card_stat_badges_and_add_stat_explanations`
- Related request(s): `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`

# AI Context
- Summary: Orchestrate weather and card stat readability
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`
- Product brief(s): `prod_047_race_weather_and_card_stat_readability_product_brief`
- Architecture decision(s): (none yet)
