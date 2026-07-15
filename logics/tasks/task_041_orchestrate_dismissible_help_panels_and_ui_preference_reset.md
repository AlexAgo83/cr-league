## task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset - Orchestrate dismissible help panels and UI preference reset
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 94
> Confidence: 89
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Inspect `App.tsx`, `ReplayView.tsx`, i18n catalogs, layout CSS, and existing tests before editing.
- [x] 2. Define the UI preference reset boundary with explicit localStorage keys and narrow prefixes.
- [x] 3. Add dismissed state and accessible close controls for the Race prep and Race replay contextual panels.
- [x] 4. Add a non-destructive Reset UI preferences action to the Profile menu and update in-memory state after reset.
- [x] 5. Add localized EN/FR copy for close labels, reset action, and status feedback.
- [x] 6. Update unit and e2e tests for dismissal persistence, reset behavior, replay preference policy, and durable data preservation.
- [x] 7. Run focused tests first, then full typecheck, lint, app tests, e2e coverage, build, and Logics validation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_075_define_the_ui_preference_storage_boundary`
- `item_076_make_contextual_help_panels_dismissible`
- `item_077_add_reset_ui_preferences_to_the_profile_menu`
- `item_078_validate_preference_reset_and_panel_behavior`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `App.tsx` adds an accessible close control for the Race prep phase panel and preserves map/directive layout.
- request-AC2 -> This task. Proof: `ReplayView.tsx` adds an accessible close control for the replay copy panel without altering replay controls, map, tower, or timeline markers.
- request-AC3 -> This task. Proof: dismissed help state is persisted in `cr-league-dismissed-race-prep-help` and `cr-league-dismissed-replay-help`.
- request-AC4 -> This task. Proof: Profile menu includes localized `Reset UI preferences` / `Réinitialiser préférences UI`.
- request-AC5 -> This task. Proof: `resetUiPreferences` clears dismissed panel keys and updates in-memory state via `preferencesResetSignal`.
- request-AC6 -> This task. Proof: `UI_PREFERENCE_KEYS` explicitly clears dismissed panels, replay speed, replay focus, and narrow `cr-league-season-recap:` keys.
- request-AC7 -> This task. Proof: reset code does not touch profile/session/player claim keys, and unit tests assert durable keys survive.
- request-AC8 -> This task. Proof: language is deliberately preserved because `LANGUAGE_KEY` is not in `UI_PREFERENCE_KEYS`, and tests assert it survives reset.
- request-AC9 -> This task. Proof: close buttons and reset action use localized accessible names and existing keyboard-accessible buttons.
- request-AC10 -> This task. Proof: `App.test.tsx` covers dismissal, reset re-show, replay preference reset, season recap reset, and durable data preservation.

# Validation
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test -- apps/web` passed.
- `npm run test:e2e -- --project=chromium` passed.
- `npm run build` passed.
- Implemented dismissible Race prep and replay copy panels, safe profile-menu UI preference reset, localized copy, explicit reset allowlist, and regression coverage for reset safety. Validation passed: npm run typecheck; npm run lint; npm test -- apps/web; npm run test:e2e -- --project=chromium; npm run build.
- Finish workflow executed on 2026-07-16.
- Linked backlog/request close verification passed.

# Report
- Implemented dismissible Race prep and replay copy panels, safe profile-menu UI preference reset, localized copy, explicit reset allowlist, and regression coverage for reset safety.
- Finished on 2026-07-16.
- Linked backlog item(s): `item_075_define_the_ui_preference_storage_boundary`, `item_076_make_contextual_help_panels_dismissible`, `item_077_add_reset_ui_preferences_to_the_profile_menu`, `item_078_validate_preference_reset_and_panel_behavior`
- Related request(s): `req_040_add_dismissible_help_panels_and_ui_preference_reset`

# AI Context
- Summary: Orchestrate dismissible help panels and UI preference reset
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_040_add_dismissible_help_panels_and_ui_preference_reset`
- Product brief(s): `prod_011_dismissible_help_panels_and_ui_preferences_product_brief`
- Architecture decision(s): (none yet)
