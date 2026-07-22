## item_198_client_security_and_privacy_hardening - Client security and privacy hardening
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Web security
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- CircuitMap.tsx:456 injects car.livery.primary/secondary into CSS vars unsanitized, while LiveryPlate.tsx:6-13 sanitizes identical values via safeHex.
- copyProfileCode (sessionActions.ts:126) interpolates the raw recovery code into the aria-live status and notification history.
- API_BASE_URL (appStorage.ts:3) falls back to plaintext http, so a missing build env posts credentials over cleartext.
- index.html has no CSP/frame-ancestors, so the app is iframe-embeddable while recoveryCode/claimCode persist in localStorage.

# Scope
- In:
  - Sanitize both livery values through the shared safeHex helper before building the map carStyle.
  - Show a generic copied confirmation and never interpolate the recovery code into announced or persisted status text.
  - Require VITE_API_BASE_URL (or default to https) and refuse non-https bases outside dev.
  - Add a restrictive CSP meta with frame-ancestors 'none' to index.html and consider scoping the stored secrets to sessionStorage.
- Out:
  - Full session auth or CSRF tokens.
  - A server-side CSP/header infrastructure layer beyond the meta and Render config.
  - Changing the invite/claim-code format.

# Acceptance criteria
- AC1: Livery colors are sanitized before map injection.
- AC2: The recovery code never appears in announced or logged status text.
- AC3: Non-https API bases are refused in production builds.
- AC4: index.html carries a CSP restricting frame-ancestors.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Livery colors are sanitized before map injection.
- request-AC6 -> This backlog slice. Proof: AC2: The recovery code never appears in announced or logged status text.
- request-AC3 -> This backlog slice. Evidence needed: The replay honors prefers-reduced-motion (defaults to no auto-motion when reduce is set), the modal focus trap skips hidden elements and focuses the first visible control, and the speed menu either implements listbox keyboard navigation or drops the listbox roles.
- request-AC4 -> This backlog slice. Evidence needed: RaceDecision.teamId is indexed, rivalTeamId is a FK/relation with onDelete handling and an index, the enum-like columns are DB-constrained, and the profileId index migration runs without write-locking teams.
- request-AC5 -> This backlog slice. Evidence needed: The API fails fast on missing WEB_ORIGIN/DATABASE_URL outside development, and render.yaml declares ADMIN_TOKEN and ADMIN_EMAILS.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_052_post_remediation_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
- Primary task(s): `task_089_orchestrate_post_remediation_hardening`

# AI Context
- Summary: Client security and privacy hardening
- Keywords: scaffolded-backlog, client security and privacy hardening, implementation-ready
- Use when: Implementing the scaffolded slice for Client security and privacy hardening.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_089_orchestrate_post_remediation_hardening`

# Notes
- Task `task_089_orchestrate_post_remediation_hardening` was finished via `logics-manager flow finish task` on 2026-07-22.
