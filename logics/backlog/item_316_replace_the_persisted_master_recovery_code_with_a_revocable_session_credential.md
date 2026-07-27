## item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential - Replace the persisted master recovery code with a revocable session credential
> From version: 0.5.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Security
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- POST /profiles/recover returns the plaintext recoveryCode and the client persists the entire ProfileSession, including that code and every team claimCode, to localStorage under cr-league-profile-session.
- The code is the master credential for the profile and never rotates on its own, so a single script execution in the page yields permanent account takeover rather than a bounded session compromise.
- The stored code is not display-only: it is replayed as ownership proof on writes in raceActions.ts and sessionActions.ts and verified by ensureProfileOwnership, so it cannot simply be removed from storage.

# Scope
- In:
  - Introduce a session credential distinct from the recovery code: issued on successful profile creation and recovery, stored hashed at rest server-side, revocable, and invalidated when the recovery code is rotated.
  - Persist only that session credential client-side; keep the plaintext recovery code in memory for the one-time reveal UI and never write it to storage.
  - Accept the session credential in ensureProfileOwnership alongside the existing recovery-code path so in-flight clients are not locked out, and record whether the recovery-code path is kept or removed.
  - Apply the same decision to team claim codes carried in the same stored payload.
  - Add a regression test asserting that no browser storage key contains the recovery code after a recover-and-reload cycle.
  - Cover the flows end to end: recover profile, create league, join league, rejoin a saved team, switch saved leagues, all surviving a page reload.
- Out:
  - Adding an authentication provider, OAuth, JWT library, or external session store.
  - Changing the email recovery product flow or the one-time code reveal UX.
  - Rewriting the scrypt hashing or the recovery rate limiter, both of which the review confirmed sound.
  - Broadening the profile model beyond what the credential change requires.

# Acceptance criteria
- AC1: After profile recovery and a page reload, no browser storage key contains the plaintext recovery code, proven by an automated test.
- AC2: Create league, join league, rejoin a saved team, and switch saved leagues all still succeed after a reload with no re-entry of the recovery code.
- AC3: The replacement credential is stored hashed server-side, is revocable, and is invalidated when the recovery code is rotated through the recovery flow.
- AC4: Team claim codes are given the same treatment or their retained sensitivity is documented with a rationale.
- AC5: Any Prisma schema change ships with a migration, and the client-compatibility decision is recorded.
- AC6: typecheck, lint, unit tests, coverage, build, and the Chromium e2e private-league flow all pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: After profile recovery and a page reload, no browser storage key contains the plaintext recovery code, proven by an automated test.
- request-AC2 -> This backlog slice. Proof: AC2: Create league, join league, rejoin a saved team, and switch saved leagues all still succeed after a reload with no re-entry of the recovery code.
- request-AC3 -> This backlog slice. Proof: AC3: The replacement credential is stored hashed server-side, is revocable, and is invalidated when the recovery code is rotated through the recovery flow.
- request-AC4 -> This backlog slice. Proof: AC4: Team claim codes are given the same treatment or their retained sensitivity is documented with a rationale.
- request-AC5 -> This backlog slice. Proof: AC5: Any Prisma schema change ships with a migration, and the client-compatibility decision is recorded.
- request-AC8 -> This backlog slice. Proof: AC6: typecheck, lint, unit tests, coverage, build, and the Chromium e2e private-league flow all pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_078_credential_storage_and_dependency_currency_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_126_review_remediation_stop_persisting_the_master_recovery_credential_restore_dependency_currency_finish_app_tsx_state_consolidation`
- Primary task(s): `task_127_orchestrate_credential_storage_and_dependency_currency_remediation`

# AI Context
- Summary: Replace the persisted master recovery code with a revocable session credential
- Keywords: scaffolded-backlog, replace the persisted master recovery code with a revocable session credential, implementation-ready
- Use when: Implementing the scaffolded slice for Replace the persisted master recovery code with a revocable session credential.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
