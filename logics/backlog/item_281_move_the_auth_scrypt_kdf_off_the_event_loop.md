## item_281_move_the_auth_scrypt_kdf_off_the_event_loop - Move the auth scrypt KDF off the event loop
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Low
> Theme: Backend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- hashRecoveryCode (utils.ts:35) and verifyRecoveryCode (utils.ts:49) call scryptSync synchronously on the request path.
- scrypt at default cost is deliberately expensive and, being sync, blocks the single event-loop thread for its full duration.
- Concurrent recover/join calls serialize their KDF time head-to-tail on the one thread.

# Scope
- In:
  - Replace scryptSync with the async crypto.scrypt (promisified) in hashRecoveryCode and verifyRecoveryCode.
  - Thread the now-async calls through their callers (recoverProfile, ensureProfileOwnership, createProfile, requestRecoveryCode).
  - Preserve the exact hash format (scrypt$salt$key), the current/legacy verify outcomes, and timing-safe comparison.
- Out:
  - Changing the KDF parameters, hash format, or the legacy sha256 path semantics.
  - Altering rate-limiting or auth flow behavior.
  - Moving other synchronous work off the loop in this slice.

# Acceptance criteria
- AC1: scryptSync is gone from the request path; the KDF runs on the libuv threadpool.
- AC2: Hash format and verify outcomes (current + legacy + timing-safe) are unchanged, proven by the existing auth tests.
- AC3: Typecheck, lint, and the unit suite stay green.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: scryptSync is gone from the request path; the KDF runs on the libuv threadpool.
- request-AC9 -> This backlog slice. Proof: AC2: Hash format and verify outcomes (current + legacy + timing-safe) are unchanged, proven by the existing auth tests.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Move the auth scrypt KDF off the event loop
- Keywords: scaffolded-backlog, move the auth scrypt kdf off the event loop, implementation-ready
- Use when: Implementing the scaffolded slice for Move the auth scrypt KDF off the event loop.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_117_orchestrate_the_performance_pass` was finished via `logics-manager flow finish task` on 2026-07-24.
