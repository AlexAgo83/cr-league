## task_065_orchestrate_mobile_modal_hygiene_and_playback_icons - Orchestrate mobile modal hygiene and playback icons
> From version: 0.3.11
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
- [ ] 1. Add the body scroll lock in Modal.tsx (stack-safe, no desktop layout jump) and extend Modal.test.tsx.
- [ ] 2. Make LaunchGpModal compact on mobile: shorter hero, single-column starting grid, min-width:0/overflow guards in AppModals.tsx and layout.css.
- [ ] 3. Swap the emoji playback control in ReplayStageOverlay.tsx for themed inline SVG icons and add the render assertion.
- [ ] 4. Keep each diff small and file-isolated to rebase cleanly against Codex's concurrent shell decomposition.
- [ ] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_154_lock_background_scroll_behind_modals`
- `item_155_make_the_launch_grand_prix_modal_compact_on_mobile`
- `item_156_replace_the_emoji_playback_control_with_a_themed_svg_icon`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate mobile modal hygiene and playback icons
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_064_mobile_modal_hygiene_and_real_playback_icons`
- Product brief(s): `prod_028_mobile_modal_hygiene_and_playback_icons_product_brief`
- Architecture decision(s): (none yet)
