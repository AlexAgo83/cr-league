## item_135_brute_force_resistant_account_recovery - Brute-force-resistant account recovery
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 84%
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
