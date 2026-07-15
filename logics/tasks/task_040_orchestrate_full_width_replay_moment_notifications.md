## task_040_orchestrate_full_width_replay_moment_notifications - Orchestrate full-width replay moment notifications
> From version: 0.1.0
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
- [ ] 1. Inspect `ReplayView.tsx`, `layout.css`, `App.test.tsx`, and `tests/e2e/private-league.spec.ts` before editing.
- [ ] 2. Remove the permanent replay key moments panel and simplify the replay grid so the map spans the available content width.
- [ ] 3. Derive the active replay moment notification from existing `keyMoments`, marker timing, `clock`, and `seek` behavior.
- [ ] 4. Add local replay notification markup and CSS, keeping it clear of controls, tower, map status, and progress bar.
- [ ] 5. Preserve progress-bar marker dots and marker click-to-seek behavior.
- [ ] 6. Update unit and e2e tests for the new replay layout and notification behavior.
- [ ] 7. Run focused replay checks first, then the full local validation gate required by the request.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_071_remove_the_permanent_replay_key_moments_panel`
- `item_072_add_timed_replay_moment_notifications`
- `item_073_preserve_marker_seeking_as_the_compact_replay_index`
- `item_074_update_replay_layout_qa_and_tests`

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
- Summary: Orchestrate full-width replay moment notifications
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_039_turn_replay_key_moments_into_timed_notifications`
- Product brief(s): `prod_010_full_width_replay_moment_notifications_product_brief`
- Architecture decision(s): (none yet)
