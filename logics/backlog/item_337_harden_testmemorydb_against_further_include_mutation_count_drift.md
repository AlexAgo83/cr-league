## item_337_harden_testmemorydb_against_further_include_mutation_count_drift - Harden testMemoryDb against further include/mutation-count drift
> From version: 0.6.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Test infrastructure integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Beyond the `select`-ignoring bug fixed in the prerequisite slice, apps/api/src/testMemoryDb.ts has other places where it silently diverges from real Prisma behavior: team.findUnique always attaches the `league` relation regardless of whether the caller's `include` actually requested it (the opposite failure mode — over-including instead of under-including), and several deleteMany/updateMany methods hardcode a return of `{ count: 0 }` instead of the actual number of affected rows.
- This drift means a test can pass against the fake while a caller's real-Prisma `include`/mutation-count expectations are silently wrong, and it means any future test that asserts on a deleteMany/updateMany count will get a hardcoded wrong answer rather than a real one.

# Scope
- In:
  - This slice depends on the prerequisite testMemoryDb select-fix slice landing first — reuse its shared select/include-respecting helper pattern rather than writing a second one.
  - Fix team.findUnique to only attach `league` when the caller's `include` actually requested it.
  - Fix every deleteMany/updateMany method in testMemoryDb.ts that currently hardcodes `{ count: 0 }` to return the real count of rows it affected.
  - Do a full pass over every method in testMemoryDb.ts, comparing its handled where/include/select shapes against every real call site in apps/api/src/features/**/*.ts that uses that Prisma model method, and fix any other mismatch found.
  - Add or update unit tests locking in the corrected behavior for each fix so this class of bug cannot silently regress again.
- Out:
  - The `select`-ignoring bug on grandPrix.findMany — that is the prerequisite slice, not this one.
  - Replacing testMemoryDb.ts with a real database-backed test harness (that is a much larger future effort, not this slice).

# Acceptance criteria
- AC1: team.findUnique only attaches the `league` relation when `include` requests it.
- AC2: Every deleteMany/updateMany method in testMemoryDb.ts returns the real affected-row count.
- AC3: A systematic comparison of every testMemoryDb.ts method against its real call sites' where/include/select shapes is documented in the closeout report, with every mismatch found either fixed or explicitly noted as out of scope with a reason.
- AC4: The full existing test suite still passes with no behavior change to any other call site.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: team.findUnique only attaches the `league` relation when `include` requests it.
- request-AC13 -> This backlog slice. Proof: AC2: Every deleteMany/updateMany method in testMemoryDb.ts returns the real affected-row count.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Harden testMemoryDb against further include/mutation-count drift
- Keywords: scaffolded-backlog, harden testmemorydb against further include/mutation-count drift, implementation-ready
- Use when: Implementing the scaffolded slice for Harden testMemoryDb against further include/mutation-count drift.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Done: `team.findUnique` now attaches `league` only when `include: { league: true }` is passed; `league.findUnique` gates both `teams` and `grandPrixes` on `include` and honours `take` on the included `grandPrixes` relation (previously it always returned every Grand Prix, so `take: 1` at `lifecycle.ts:191` was only accidentally correct); `profile.findUnique` gates the nested `league` on `include.teams.include.league`, matching the already-correct `profile.findMany`.
- `grandPrix.deleteMany` and `raceDecision.deleteMany` return the real affected-row count instead of a hardcoded `{ count: 0 }`. `team.updateMany` and `grandPrix.updateMany` already counted correctly and were left alone.
- Call-site pass done over `apps/api/src/features/**`: every `where`/`include`/`select` shape reaching the fake is now handled or intentionally unsupported.
- Tests added in `apps/api/src/testMemoryDb.test.ts` for include gating, relation `take`, and mutation counts. Full suite green (379 passed, 7 skipped); typecheck and lint clean.
