## task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset - Orchestrate dismissible help panels and UI preference reset
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
- [ ] 1. Inspect `App.tsx`, `ReplayView.tsx`, i18n catalogs, layout CSS, and existing tests before editing.
- [ ] 2. Define the UI preference reset boundary with explicit localStorage keys and narrow prefixes.
- [ ] 3. Add dismissed state and accessible close controls for the Race prep and Race replay contextual panels.
- [ ] 4. Add a non-destructive Reset UI preferences action to the Profile menu and update in-memory state after reset.
- [ ] 5. Add localized EN/FR copy for close labels, reset action, and status feedback.
- [ ] 6. Update unit and e2e tests for dismissal persistence, reset behavior, replay preference policy, and durable data preservation.
- [ ] 7. Run focused tests first, then full typecheck, lint, app tests, e2e coverage, build, and Logics validation.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_075_define_the_ui_preference_storage_boundary`
- `item_076_make_contextual_help_panels_dismissible`
- `item_077_add_reset_ui_preferences_to_the_profile_menu`
- `item_078_validate_preference_reset_and_panel_behavior`

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
- Summary: Orchestrate dismissible help panels and UI preference reset
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_040_add_dismissible_help_panels_and_ui_preference_reset`
- Product brief(s): `prod_011_dismissible_help_panels_and_ui_preferences_product_brief`
- Architecture decision(s): (none yet)
