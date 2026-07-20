## item_135_brute_force_resistant_account_recovery - Brute-force-resistant account recovery
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 98
> Confidence: 92
> Progress: 100
> Complexity: Medium
> Theme: Account security
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Recovery codes are 4 random bytes (32 bits) hashed with unsalted single-round SHA-256, so a leaked database cracks offline in seconds.
- /profiles/recover has no rate limiting, so a known email can be brute-forced online.

# Scope
- In:
  - Generate recovery codes from at least 16 random bytes in createRecoveryCode.
  - Hash with crypto.scrypt and a per-code random salt, stored in a self-describing format (e.g. scrypt$salt$hash) alongside legacy hashes; verify with timingSafeEqual.
  - On successful recovery with a legacy SHA-256 hash, re-hash or re-issue so old codes converge to the new format.
  - Add an in-process fixed-window rate limiter on /profiles/recover keyed by normalized email and by IP, returning 429 with a retry hint.
  - Tests: new-format roundtrip, legacy fallback and upgrade, rate-limit lockout and window reset.
- Out:
  - Passwords, sessions, or OAuth.
  - Distributed rate limiting or new dependencies.
  - Changing the email delivery path (roadmap 0.4.1).

# Acceptance criteria
- AC1: New recovery codes carry at least 128 bits of entropy and are stored salted with scrypt.
- AC2: Legacy codes still verify once and are upgraded on use.
- AC3: Repeated recover attempts for the same email or IP are throttled with 429.
- AC4: All comparisons on secret material are constant-time.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: New recovery codes carry at least 128 bits of entropy and are stored salted with scrypt.
- request-AC9 -> This backlog slice. Proof: AC2: Legacy codes still verify once and are upgraded on use.
- request-AC3 -> This backlog slice. Evidence needed: restartLeague executes atomically inside runWrite so an injected mid-sequence failure leaves the previous league state intact, with a test proving no league can end up without a current Grand Prix.
- request-AC4 -> This backlog slice. Evidence needed: The admin token comparison is constant-time and localhost CORS origins are absent from the production origin set, verified by tests or config assertions.
- request-AC5 -> This backlog slice. Evidence needed: App.tsx drops below ~700 lines by extracting domain hooks (league, profile, admin, plan form) and view containers, the rejoin effect has correct dependencies or an explicit mount guard, the rejoin logic exists once, the seven command-clicked booleans collapse into one structure, and all existing web tests still pass.
- request-AC6 -> This backlog slice. Evidence needed: ReplayView.tsx is split into a useReplayClock hook and separate scrubber/tower/stage files with no behavior change pinned by the existing replay tests.
- request-AC7 -> This backlog slice. Evidence needed: A CI lane runs integration tests against a real Postgres service covering concurrent qualifying submissions, the resolve transition claim, and the credit-guarded card purchase; the unit lane no longer advertises an unused DATABASE_URL.
- request-AC8 -> This backlog slice. Evidence needed: CI gains dependency scanning (Dependabot config plus an npm audit gate), vitest coverage collection surfaced in CI, eslint enforces react-hooks and jsx-a11y rules with the codebase passing, the release workflow fails on a health-version mismatch, package.json declares engines, and the reports/ gitignore policy is consistent.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-20 implementation wave: createRecoveryCode now uses 16 random bytes; recovery hashes use salted scrypt in a self-describing format; legacy SHA-256 hashes verify and upgrade on successful recovery; /profiles/recover is throttled per normalized email and IP; admin recovery resets reuse the same generator/hash path. Remaining before item closeout: full-suite verification with the rest of req_058.

# Links
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Primary task(s): `task_059_orchestrate_repo_review_remediation_pass_5`

# AI Context
- Summary: Brute-force-resistant account recovery
- Keywords: scaffolded-backlog, brute-force-resistant account recovery, implementation-ready
- Use when: Implementing the scaffolded slice for Brute-force-resistant account recovery.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-20 closeout proof: recovery codes are generated from 16 random bytes, stored as salted scrypt hashes with legacy SHA-256 verification/upgrade, compared with timingSafeEqual-compatible helpers, and /profiles/recover is throttled by normalized email and IP. Verification in this pass: rtk npm run typecheck, rtk npm run lint, full rtk npm test previously passed with 172 tests.

# Tasks
- `task_059_orchestrate_repo_review_remediation_pass_5`

# Notes
- Task `task_059_orchestrate_repo_review_remediation_pass_5` was finished via `logics-manager flow finish task` on 2026-07-20.
