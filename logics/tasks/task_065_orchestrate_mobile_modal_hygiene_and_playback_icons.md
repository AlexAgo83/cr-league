## task_065_orchestrate_mobile_modal_hygiene_and_playback_icons - Orchestrate mobile modal hygiene and playback icons
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Add the body scroll lock in Modal.tsx (stack-safe, no desktop layout jump) and extend Modal.test.tsx.
- [x] 2. Make LaunchGpModal compact on mobile: shorter hero, single-column starting grid, min-width:0/overflow guards in AppModals.tsx and layout.css.
- [x] 3. Swap the emoji playback control in ReplayStageOverlay.tsx for themed inline SVG icons and add the render assertion.
- [x] 4. Keep each diff small and file-isolated to rebase cleanly against Codex's concurrent shell decomposition.
- [x] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_154_lock_background_scroll_behind_modals`
- `item_155_make_the_launch_grand_prix_modal_compact_on_mobile`
- `item_156_replace_the_emoji_playback_control_with_a_themed_svg_icon`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_154_lock_background_scroll_behind_modals`. Proof: `Modal.tsx` locks body scroll while mounted, restores styles and positive scroll offset on final unmount, and `Modal.test.tsx` covers mount/restore plus stacked modals.
- request-AC2 -> `item_155_make_the_launch_grand_prix_modal_compact_on_mobile`. Proof: `.launch-gp-modal` mobile CSS bounds the dialog at 360px, reduces hero height, removes hero negative-overflow, and stacks starting-grid rows into one column; `tests/e2e/private-league.spec.ts` asserts viewport fit, no horizontal overflow, body lock, and one-column grid.
- request-AC3 -> `item_156_replace_the_emoji_playback_control_with_a_themed_svg_icon`. Proof: `ReplayStageOverlay.tsx` renders inline SVG play/pause icons with `currentColor`; `App.test.tsx` asserts SVG rendering and empty emoji text for both states.
- request-AC4 -> `item_154_lock_background_scroll_behind_modals`, `item_156_replace_the_emoji_playback_control_with_a_themed_svg_icon`. Proof: targeted unit tests passed for Modal lock/restore and replay SVG states.
- request-AC5 -> This task. Proof: `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build`, `rtk npm run lint`, `rtk npm run test:e2e`, and `rtk npm run logics:validate` passed after implementation.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-20 wave 1 targeted proof: `rtk npm test -- apps/web/src/features/Modal.test.tsx apps/web/src/app/App.test.tsx` passed (29 tests).
- command: `rtk npm run logics:validate` | result: passed: lint ok, audit ok | date: 2026-07-20
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Wave 1 implemented: stack-safe modal body scroll lock with scroll position restore, compact 360px launch-GP modal styling with a single-column starting grid, and themed inline SVG play/pause icons preserving the existing replay controls' labels/state.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_154_lock_background_scroll_behind_modals`, `item_155_make_the_launch_grand_prix_modal_compact_on_mobile`, `item_156_replace_the_emoji_playback_control_with_a_themed_svg_icon`
- Related request(s): `req_064_mobile_modal_hygiene_and_real_playback_icons`

# AI Context
- Summary: Orchestrate mobile modal hygiene and playback icons
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_064_mobile_modal_hygiene_and_real_playback_icons`
- Product brief(s): `prod_028_mobile_modal_hygiene_and_playback_icons_product_brief`
- Architecture decision(s): (none yet)
