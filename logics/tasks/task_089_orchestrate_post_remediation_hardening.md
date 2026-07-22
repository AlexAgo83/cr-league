## task_089_orchestrate_post_remediation_hardening - Orchestrate post-remediation hardening
> From version: 0.3.27
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
- [ ] 1. Read req_085/req_086/req_087 first; this pass builds on their landed locking, integrity, and fidelity work and must not regress the Postgres integration lane.
- [ ] 2. Close the submit-vs-sell race: re-validate card ownership inside the locked transactions, serialize submit/sell on the team row, and add the sell-vs-submit integration test.
- [ ] 3. Harden the client: sanitize livery colors, stop leaking the recovery code, refuse non-https API bases, and add the CSP/frame-ancestors baseline.
- [ ] 4. Add the accessibility baseline: prefers-reduced-motion gating, the modal focus-trap fix, and the speed-menu keyboard behavior.
- [ ] 5. Tighten the data model: RaceDecision teamId index, rivalTeamId FK/relation, enum constraints, and the concurrent profileId index migration.
- [ ] 6. Add required-env validation and declare the admin envs in render.yaml.
- [ ] 7. Run typecheck, tests, build, lint, e2e, the Postgres lane, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_197_close_the_submit_vs_sell_card_race`
- `item_198_client_security_and_privacy_hardening`
- `item_199_replay_and_dialog_accessibility_baseline`
- `item_200_racedecision_data_model_integrity`
- `item_201_required_env_validation_and_admin_config`

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
- Summary: Orchestrate post-remediation hardening
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
- Product brief(s): `prod_052_post_remediation_hardening_product_brief`
- Architecture decision(s): (none yet)
