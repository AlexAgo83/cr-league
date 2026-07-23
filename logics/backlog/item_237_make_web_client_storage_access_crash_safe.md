## item_237_make_web_client_storage_access_crash_safe - Make web client storage access crash-safe
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Web robustness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

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
- Rationale: Set by scaffold input or defaulted for grooming.
