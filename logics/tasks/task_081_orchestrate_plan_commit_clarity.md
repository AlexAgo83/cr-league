## task_081_orchestrate_plan_commit_clarity - Orchestrate plan commit clarity
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
- [ ] 1. Confirm where the plan card selector lives in PlanView/DirectivePanel and where primaryCommand is resolved in App.tsx and consumed by DriveView.
- [ ] 2. Add a pre-commit consumption notice in the plan card selector with EN/FR copy.
- [ ] 3. Thread primaryCommand into DirectivePanel and render a contextual launch/send action reusing its action, label, and gating.
- [ ] 4. Verify there is no second competing launch path and no change to consumption rules or the simulation.
- [ ] 5. Run typecheck, test, build, lint, e2e, and logics:validate; record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action`

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
- Summary: Orchestrate plan commit clarity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_080_warn_card_consumption_before_commit_and_add_an_inline_launch_action_on_the_directive_tab`
- Product brief(s): `prod_044_plan_commit_clarity_product_brief`
- Architecture decision(s): (none yet)
