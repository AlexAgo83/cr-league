## task_081_orchestrate_plan_commit_clarity - Orchestrate plan commit clarity
> From version: 0.3.26
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
- Implementation keeps the resolved primary command as the single submit/launch source and adds only directive-panel UI copy around selected-card consumption.

# Plan
- [x] 1. Confirm where the plan card selector lives in PlanView/DirectivePanel and where primaryCommand is resolved in App.tsx and consumed by DriveView.
- [x] 2. Add a pre-commit consumption notice in the plan card selector with EN/FR copy.
- [x] 3. Thread primaryCommand into DirectivePanel and render a contextual launch/send action reusing its action, label, and gating.
- [x] 4. Verify there is no second competing launch path and no change to consumption rules or the simulation.
- [x] 5. Run typecheck, test, build, lint, e2e, and logics:validate; record validation evidence in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready.

# AC Traceability
- request-AC1 -> This task. Proof: `DirectivePanel` renders `directive_card_consumption_warning` with the selected card label when a card is attached.
- request-AC2 -> This task. Proof: `PlanView` passes the existing `primaryCommand` into `DirectivePanel`, and the inline directive button calls the provided `primaryCommand.action`.
- request-AC3 -> This task. Proof: the inline directive button renders `primaryCommand.label` and reads `primaryCommand.disabled`, preserving existing submit/launch gating.
- request-AC4 -> This task. Proof: EN/FR warning copy was added; inline action copy reuses existing localized primary-command labels.
- request-AC5 -> This task. Proof: only UI/i18n/test/docs files changed; no simulation, reward, consumption-rule, shared model, or API files changed.
- request-AC6 -> This task. Proof: focused component tests plus full typecheck, lint, unit, build, e2e, and Logics gates passed.

# Validation
- `npm run typecheck` passed.
- `npx vitest run apps/web/src/features/DirectivePanel.test.tsx` passed: 2 tests.
- `npm run lint` passed.
- `npm run test` passed: 25 passed, 1 skipped; 227 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run test:e2e` passed: 4 Playwright tests.
- `npm run logics:validate` passed after workflow closeout.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Added pre-commit selected-card consumption warning in the directive card selector.
- Added a directive-tab inline primary command that reuses the existing submit/launch command object.
- Added EN/FR warning copy and focused `DirectivePanel` component tests.
- No card economy, simulation, reward, consumption-rule, shared model, or API contract changes were made.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`
- Related request(s): `req_080_warn_card_consumption_before_commit_and_add_an_inline_launch_action_on_the_directive_tab`

# AI Context
- Summary: Orchestrate plan commit clarity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_080_warn_card_consumption_before_commit_and_add_an_inline_launch_action_on_the_directive_tab`
- Product brief(s): `prod_044_plan_commit_clarity_product_brief`
- Architecture decision(s): (none yet)
