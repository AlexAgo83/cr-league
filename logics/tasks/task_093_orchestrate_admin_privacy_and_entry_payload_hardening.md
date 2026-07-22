## task_093_orchestrate_admin_privacy_and_entry_payload_hardening - Orchestrate admin privacy and entry payload hardening
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
- [ ] 1. Start by deleting or proof-gating the admin-status route; prefer deletion unless a client test proves refresh is required.
- [ ] 2. Remove the unauthenticated client refresh path and update profile/admin tests to lock the new privacy contract.
- [ ] 3. Run the API and web profile/admin test slices, then the full test suite.
- [ ] 4. Measure the current build output and inspect whether circuitRoutes are in the main entry path.
- [ ] 5. If route coordinates dominate, lazy-load route coordinates for map/replay consumers while keeping lightweight circuit identity eager.
- [ ] 6. Run typecheck, lint, tests, build, and logics validation; record before/after build evidence in task closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_208_remove_public_admin_eligibility_lookup`
- `item_209_measure_and_reduce_the_main_entry_bundle_warning`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> item_208_remove_public_admin_eligibility_lookup. Proof deferred to implementation closeout.
- request-AC2 -> item_208_remove_public_admin_eligibility_lookup. Proof deferred to implementation closeout.
- request-AC3 -> item_208_remove_public_admin_eligibility_lookup. Proof deferred to implementation closeout.
- request-AC4 -> item_209_measure_and_reduce_the_main_entry_bundle_warning. Proof deferred to implementation closeout.
- request-AC5 -> This task. Proof deferred to implementation closeout.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build` and record the main entry chunk size.
- Run `npm run logics:validate`.

# Report
- Pending implementation. Start with `item_208_remove_public_admin_eligibility_lookup`, then measure `item_209_measure_and_reduce_the_main_entry_bundle_warning`.

# AI Context
- Summary: Orchestrate admin privacy and entry payload hardening
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_092_admin_status_privacy_and_entry_bundle_hardening`
- Product brief(s): `prod_056_admin_privacy_and_entry_payload_hardening_product_brief`
- Architecture decision(s): (none yet)
