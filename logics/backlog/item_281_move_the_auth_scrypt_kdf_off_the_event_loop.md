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
> Non-semantic edit: traceability repair only.

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
- request-AC4 -> This backlog slice. Evidence needed: Circuit route data is loaded on demand for the selected circuit; the eager circuit-routes chunk is off the first-paint critical path; the correct circuit still renders for every round.
- request-AC5 -> This backlog slice. Evidence needed: The GameApp shell is memoized so unrelated state changes no longer rebuild the admin view, overlays, and menus; adminView is not constructed for non-admins; rendered output and behavior are unchanged.
- request-AC6 -> This backlog slice. Evidence needed: getLeagueState is built at most once per mutation and its history query no longer fetches decisions/qualifyingRuns/forecast for past grand prixes; API responses are byte-identical to today.
- request-AC7 -> This backlog slice. Evidence needed: Per-team write loops in resolve, season rollover, and bot purchases are batched, reducing in-transaction round-trips, with identical resulting points/credits/state.
- request-AC8 -> This backlog slice. Evidence needed: simulateRace is computed before the write transaction opens; the transaction performs only validation and writes; race-integrity guarantees and simulation outputs are preserved verbatim.

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
