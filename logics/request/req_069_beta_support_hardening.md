## req_069_beta_support_hardening - Beta support hardening
> From version: 0.3.11
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Beta operations and support hardening
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Prepare the hosted beta for support work without manual database intervention for common test-data cleanup and account/league inspection tasks.
- Add safe admin filters and 100-by-100 pagination on admin users and admin leagues screens so support remains usable as data grows.
- Add a guarded admin action to delete test data sets, including test accounts, test leagues, and related rows, with confirmation and audit-friendly feedback.
- Document backup, restore, support triage, and known limits for testers/operators.
- Keep destructive actions explicitly admin-only, confirmation-gated, and covered by API/web tests.

# Context
- 0.4 ship rails are implemented for the current release path, but beta support still needs operational affordances before inviting a broader group.
- Existing admin console functionality and admin-token protection should be reused. Do not introduce a full auth system in this request.
- Repo review remediation pass 5 contains security/trust-boundary work that this request should build on rather than weaken.
- Test-data deletion must be conservative: it should target clearly identified test data sets, avoid accidental production cleanup, and return clear counts/results.
- Runbooks are part of the deliverable, not optional notes.

# Acceptance criteria
- AC1: Admin users and leagues views support server-backed filters plus 100-by-100 pagination, with UI controls that preserve current admin access rules.
- AC2: A safe admin-only test-data cleanup action can delete explicitly selected test accounts/leagues and related rows, requires confirmation, and reports deleted counts.
- AC3: API tests cover filter/pagination behavior, admin authorization, and destructive-action safety boundaries.
- AC4: Web tests or focused component tests cover admin filter/pagination controls and destructive confirmation UX.
- AC5: Backup/restore/support runbooks and a known-limits tester page/doc are added or updated with concrete commands and recovery steps.
- AC6: No full auth system, public self-service delete, or irreversible bulk wipe outside explicit admin test-data cleanup is introduced.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_033_beta_support_hardening_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_036_github_ci_render_blueprint_and_release_contract.md
- logics/request/req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening.md
- apps/api/src/app.ts
- apps/api/src/features/leagues
- apps/web/src/features/AdminConsoleView.tsx
- apps/web/src/app/App.tsx
- docs/runtime-configuration.md
- tests/e2e/private-league.spec.ts
- Roadmap 0.4.3: beta support hardening: admin reset/support path, backup/restore/support runbooks, known-limits page for testers, admin filters and 100-by-100 pagination on both admin screens, a safe admin action to delete test data sets, and small operational affordances discovered during hosted playtests.

# AI Context
- Summary: Beta support hardening
- Keywords: request-chain-scaffold, beta support hardening, development-ready
- Use when: You need to implement or review the scaffolded workflow for Beta support hardening.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_165_add_admin_filters_and_pagination`
- `item_166_add_safe_admin_test_data_cleanup`
- `item_167_write_beta_support_runbooks_and_known_limits`
