## item_240_owner_team_resilience_and_replay_validator_negative_tests - Owner-team resilience and replay-validator negative tests
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Integrity and coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- ownerTeamId has no FK/onDelete and requireAdminClaim (store.ts:1052) requires a human team whose id equals ownerTeamId, so removing that owner team permanently 403s resolve/next-grand-prix/restart.
- validateReplayTrace has zero negative tests; every caller asserts toEqual([]) so its ~30 error branches never run and can silently rot.

# Scope
- In:
  - On owner human-team removal, reassign ownerTeamId to the oldest remaining human team; if none remains, let requireAdminClaim fall back to the oldest human claim instead of hard-403.
  - Add validateReplayTrace.test.ts feeding hand-corrupted traces (backwards progress, oversized jump, missing pit phase, wrong final order, out-of-range distance) asserting the specific error strings.
- Out:
  - A destructive schema migration to add the FK if it can be handled in application code this pass.
  - Rewriting the admin claim model.

# Acceptance criteria
- AC1: Removing an owner human team no longer permanently locks admin controls.
- AC2: validateReplayTrace has negative tests asserting its specific error strings.
- AC3: Existing admin and replay tests stay green.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Removing an owner human team no longer permanently locks admin controls.
- request-AC8 -> This backlog slice. Proof: AC2: validateReplayTrace has negative tests asserting its specific error strings.
- request-AC3 -> This backlog slice. Evidence needed: All localStorage access in apps/web goes through a safe wrapper; the app starts and operates without throwing when localStorage getItem/setItem throw (disabled or quota-exceeded), verified by a test that stubs a throwing storage.
- request-AC4 -> This backlog slice. Evidence needed: normalizeEmail rejects any control/whitespace character so no tab/newline can reach the mail header, and POST /profiles returns a neutral response that no longer reveals whether an email is already registered.
- request-AC5 -> This backlog slice. Evidence needed: Unauthenticated write routes are IP rate-limited, and the admin profile/league list endpoints filter and paginate at the database level (where/skip/take) rather than loading whole tables into memory.
- request-AC7 -> This backlog slice. Evidence needed: Cosmetic replay-trace generation lives in its own module out of the simulation core, the dead normalizeRaceTraits/clampNumber exports are gone, and App.tsx's mutually-exclusive dialogs use a single activeModal state.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Primary task(s): `task_100_orchestrate_review_findings_remediation`

# AI Context
- Summary: Owner-team resilience and replay-validator negative tests
- Keywords: scaffolded-backlog, owner-team resilience and replay-validator negative tests, implementation-ready
- Use when: Implementing the scaffolded slice for Owner-team resilience and replay-validator negative tests.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Owner recovery and replay negative tests protect operations and regressions, but follow the core determinism/card-effect fixes.

# Tasks
- `task_100_orchestrate_review_findings_remediation`

# Notes
- Task `task_100_orchestrate_review_findings_remediation` was finished via `logics-manager flow finish task` on 2026-07-23.
