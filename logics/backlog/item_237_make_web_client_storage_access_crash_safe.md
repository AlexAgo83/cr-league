## item_237_make_web_client_storage_access_crash_safe - Make web client storage access crash-safe
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Web robustness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- Every localStorage read/write in apps/web is unguarded; mount-time reads (appStorage.ts loadPlayerClaims:79, loadProfileSession:83, initial locale) throw a SecurityError when storage is disabled, white-screening the app at startup.
- Effect writes (usePlanForm.ts:27, useAppNavigation.ts:51/55/59) throw on QuotaExceededError mid-interaction.

# Scope
- In:
  - Add a safeStorage helper in appStorage.ts wrapping localStorage in try/catch (get returns null on failure; set/remove swallow).
  - Route all mount-time reads and effect writes through it so failures degrade to the existing empty/null fallbacks.
  - Add a test that stubs a throwing storage and asserts the app initializes without throwing.
- Out:
  - Moving secrets to sessionStorage or changing what is persisted.
  - A cross-tab storage-sync layer.

# Acceptance criteria
- AC1: All apps/web localStorage access goes through the safe wrapper.
- AC2: The app starts and runs when getItem/setItem throw.
- AC3: A test covers the throwing-storage path.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: All apps/web localStorage access goes through the safe wrapper.
- request-AC8 -> This backlog slice. Proof: AC2: The app starts and runs when getItem/setItem throw.
- request-AC4 -> This backlog slice. Evidence needed: normalizeEmail rejects any control/whitespace character so no tab/newline can reach the mail header, and POST /profiles returns a neutral response that no longer reveals whether an email is already registered.
- request-AC5 -> This backlog slice. Evidence needed: Unauthenticated write routes are IP rate-limited, and the admin profile/league list endpoints filter and paginate at the database level (where/skip/take) rather than loading whole tables into memory.
- request-AC6 -> This backlog slice. Evidence needed: Removing a league's owner human team no longer permanently 403s resolve/next-grand-prix/restart (ownerTeamId is reassigned or falls back to another human claim), and validateReplayTrace has negative tests asserting its specific error strings.
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
- Summary: Make web client storage access crash-safe
- Keywords: scaffolded-backlog, make web client storage access crash-safe, implementation-ready
- Use when: Implementing the scaffolded slice for Make web client storage access crash-safe.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: A storage exception can white-screen affected browsers, but the fix is isolated and follows existing fallbacks.

# Tasks
- `task_100_orchestrate_review_findings_remediation`

# Notes
- Task `task_100_orchestrate_review_findings_remediation` was finished via `logics-manager flow finish task` on 2026-07-23.
