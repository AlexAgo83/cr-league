## task_036_orchestrate_garage_inventory_card_consultation - Orchestrate garage inventory card consultation
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
- [ ] 1. Read `GarageView`, `CardStatBadges`, `helpers`, i18n catalogs, styles, and the existing Garage tests.
- [ ] 2. Implement the smallest local state change needed to open a read-only detail modal from inventory cards.
- [ ] 3. Reuse or lightly factor the existing shop card modal presentation so shop and inventory explain cards consistently.
- [ ] 4. Update EN/FR copy only if existing keys are insufficient.
- [ ] 5. Add focused tests for inventory modal consultation and shop purchase modal behavior.
- [ ] 6. Run typecheck and the focused web app test file, then update closeout evidence.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_057_add_read_only_card_detail_modal_for_garage_inventory`

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
- Summary: Orchestrate garage inventory card consultation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_035_make_garage_inventory_cards_open_the_card_detail_modal`
- Product brief(s): `prod_006_garage_inventory_card_consultation_product_brief`
- Architecture decision(s): (none yet)
