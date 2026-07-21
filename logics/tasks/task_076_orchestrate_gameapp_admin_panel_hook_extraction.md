## task_076_orchestrate_gameapp_admin_panel_hook_extraction - Orchestrate GameApp admin-panel hook extraction
> From version: 0.3.26
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
- [ ] 1. Map every admin-only useState in App.tsx and each place GameApp reads or sets it (including the createAdminActions call at App.tsx:233 and the AdminConsoleView props).
- [ ] 2. Create useAdminPanel() in apps/web/src/app holding those states and the createAdminActions wiring, returning state plus handlers.
- [ ] 3. Replace the inline admin state and actions in GameApp with a single useAdminPanel() call, keeping AdminConsoleView props identical.
- [ ] 4. Run typecheck, lint, and vitest; confirm admin console tests still pass unchanged.
- [ ] 5. Run the admin/private-league Playwright flow and record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_173_extract_useadminpanel_from_gameapp`

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
- Summary: Orchestrate GameApp admin-panel hook extraction
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`
- Product brief(s): `prod_039_gameapp_decomposition_product_brief`
- Architecture decision(s): (none yet)
