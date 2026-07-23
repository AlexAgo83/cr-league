## item_244_close_the_account_enumeration_oracle_on_profile_creation - Close the account-enumeration oracle on profile creation
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: API security
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- createProfile (storeCore.ts) throws a distinct 'This email already has a profile' for existing emails, while requestRecoveryCode returns a constant { ok: true } regardless of existence.
- POST /profiles therefore remains an existence oracle even though it is rate-limited, and this is the open half of req_099 item 238.

# Scope
- In:
  - Decide Option A (existing email -> behave like requestRecoveryCode, email the owner, return neutral) or Option B (keep the distinct message, accept the leak), and record the decision and rationale in the orchestration task.
  - Apply the chosen option, keeping new-email signup working and the DB duplicate guard intact.
  - If Option A, verify the client no longer depends on the plaintext recoveryCode in the response.
- Out:
  - Reworking the claim-code/recovery model.
  - Adding email verification flows.

# Acceptance criteria
- AC1: POST /profiles no longer distinguishes existing from new emails in its response (Option A), or the team has explicitly chosen Option B, recorded in the task.
- AC2: New-email signup still works and duplicate accounts are still prevented at the DB.
- AC3: The recovery cooldown/limiter is respected by any new send path.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: POST /profiles no longer distinguishes existing from new emails in its response (Option A), or the team has explicitly chosen Option B, recorded in the task.
- request-AC6 -> This backlog slice. Proof: AC2: New-email signup still works and duplicate accounts are still prevented at the DB.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_063_post_remediation_review_fixes_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
- Primary task(s): `task_101_orchestrate_post_remediation_review_fixes`

# AI Context
- Summary: Close the account-enumeration oracle on profile creation
- Keywords: scaffolded-backlog, close the account-enumeration oracle on profile creation, implementation-ready
- Use when: Implementing the scaffolded slice for Close the account-enumeration oracle on profile creation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
