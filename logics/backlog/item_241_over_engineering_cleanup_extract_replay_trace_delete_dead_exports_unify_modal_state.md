## item_241_over_engineering_cleanup_extract_replay_trace_delete_dead_exports_unify_modal_state - Over-engineering cleanup: extract replay trace, delete dead exports, unify modal state
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Complexity reduction
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- ~500 of 1207 lines in simulateRace.ts are cosmetic replay/trace/director-beat generation entangled with the core loop.
- normalizeRaceTraits and clampNumber in utils.ts are exported with no non-test callers.
- App.tsx models ~10 mutually-exclusive dialogs as separate useState booleans (:115-132).

# Scope
- In:
  - Move the cosmetic replay/trace helpers into a new packages/shared/src/simulation/replayTrace.ts as a pure, behavior-preserving move.
  - Delete the unused normalizeRaceTraits and clampNumber exports.
  - Replace App.tsx's modal booleans with a single activeModal discriminated-union state plus open/close helpers.
- Out:
  - Changing replay output or trace format.
  - The score-vs-time classification unification (follow-up).
  - Restyling any modal.

# Acceptance criteria
- AC1: Cosmetic replay-trace code lives in its own module and existing tests pass unchanged.
- AC2: The dead utils exports are removed with no remaining references.
- AC3: App.tsx dialogs use a single activeModal state with identical behavior.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Cosmetic replay-trace code lives in its own module and existing tests pass unchanged.
- request-AC8 -> This backlog slice. Proof: AC2: The dead utils exports are removed with no remaining references.
- request-AC3 -> This backlog slice. Evidence needed: All localStorage access in apps/web goes through a safe wrapper; the app starts and operates without throwing when localStorage getItem/setItem throw (disabled or quota-exceeded), verified by a test that stubs a throwing storage.
- request-AC4 -> This backlog slice. Evidence needed: normalizeEmail rejects any control/whitespace character so no tab/newline can reach the mail header, and POST /profiles returns a neutral response that no longer reveals whether an email is already registered.
- request-AC5 -> This backlog slice. Evidence needed: Unauthenticated write routes are IP rate-limited, and the admin profile/league list endpoints filter and paginate at the database level (where/skip/take) rather than loading whole tables into memory.
- request-AC6 -> This backlog slice. Evidence needed: Removing a league's owner human team no longer permanently 403s resolve/next-grand-prix/restart (ownerTeamId is reassigned or falls back to another human claim), and validateReplayTrace has negative tests asserting its specific error strings.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Primary task(s): `task_100_orchestrate_review_findings_remediation`

# AI Context
- Summary: Over-engineering cleanup: extract replay trace, delete dead exports, unify modal state
- Keywords: scaffolded-backlog, over-engineering cleanup: extract replay trace, delete dead exports, unify modal state, implementation-ready
- Use when: Implementing the scaffolded slice for Over-engineering cleanup: extract replay trace, delete dead exports, unify modal state.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Cleanup reduces maintenance risk, but it should land after correctness/security fixes so it does not obscure behavior changes.

# Tasks
- `task_100_orchestrate_review_findings_remediation`

# Notes
- Task `task_100_orchestrate_review_findings_remediation` was finished via `logics-manager flow finish task` on 2026-07-23.
