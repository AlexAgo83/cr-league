## task_131_orchestrate_repo_review_remediation_pass_7 - Orchestrate repo review remediation pass 7
> From version: 0.6.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 8%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Noted that v0.6.0 is live in production and item_344's exposure is already real, not just future risk; no scope or plan change.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- v0.6.0 is live in production (https://cr-league-api.onrender.com). `item_344` (hash team claimCode) is not a preventive fix for a future risk — real leagues/teams created since that release already have plaintext claimCode rows in the production database today. Treat `item_344` as High priority and validate its migration against production-shaped data, not only against fresh test rows.

# Plan
- [x] 1. Land the DB index slice first — it is independent, low-risk, and quick. (`item_335` Done: schema `@@index([leagueId])` on `Team`/`GrandPrix` + migration `20260728160000_add_league_id_indexes`; typecheck and full suite green.)
- [ ] 2. Land the testMemoryDb select-fix slice, then the broader testMemoryDb hardening slice that depends on it (in that order — the hardening slice reuses the select-fix slice's shared helper).
- [ ] 3. Land the 0.6 E2E coverage slice and the coverage-threshold-margin slice in parallel with the above; they are independent of the testMemoryDb and DB-index work.
- [ ] 4. Land the standings/rival code-move, the admin/store.ts rename, and the lifecycle.ts split as a code-organization batch — each is independent of the others but all three touch widely-imported modules, so run the full test suite after each one individually rather than batching all three changes before testing.
- [ ] 5. Land the admin rate-limiting slice (quick, independent).
- [ ] 6. Land the claimCode hashing slice last among the required work — it is the highest-effort and highest-risk slice (schema migration, backward compatibility) and benefits from every other slice's test-suite hardening already being in place.
- [ ] 7. Land the E2E data-testid slice, and evaluate (and land only if justified) the CI-retries slice.
- [ ] 8. Run npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate after the full set of slices; record proof at closeout.
- [ ] 9. Keep commits scoped per slice (or per small related group of slices) rather than one giant commit, so each change is independently reviewable and revertible.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_335_add_missing_leagueid_indexes_on_team_and_grandprix`
- `item_336_fix_testmemorydb_s_silent_select_handling`
- `item_337_harden_testmemorydb_against_further_include_mutation_count_drift`
- `item_338_add_e2e_coverage_for_the_0_6_corpus_s_highest_risk_flows`
- `item_339_raise_branch_coverage_on_weak_replay_timing_files`
- `item_340_move_standings_rival_derivation_logic_into_packages_shared`
- `item_341_rename_admin_store_ts_to_reflect_its_actual_content`
- `item_342_split_lifecycle_ts_by_responsibility`
- `item_343_rate_limit_all_admin_routes`
- `item_344_hash_team_claimcode_at_rest_with_a_backward_compatible_migration`
- `item_345_replace_hardcoded_e2e_copy_assertions_with_data_testid`
- `item_346_add_ci_only_playwright_retries_if_flakiness_is_evidenced`

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
- Summary: Orchestrate repo review remediation pass 7
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
