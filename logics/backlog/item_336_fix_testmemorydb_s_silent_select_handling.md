## item_336_fix_testmemorydb_s_silent_select_handling - Fix testMemoryDb's silent `select` handling
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Test infrastructure integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- apps/api/src/testMemoryDb.ts is a hand-rolled in-memory fake standing in for Prisma in API tests. Its grandPrix.findMany method (testMemoryDb.ts, around line 399-402) ignores a `select` option entirely and always returns full rows.
- apps/api/src/features/leagues/lifecycle.ts:203-206 calls db.grandPrix.findMany({ where, orderBy, select: { id, name, season, round, status, result } }) expecting only those fields back. Because the fake ignores `select`, tests exercising this path cannot catch a real Prisma `select` mistake (accidental over-fetch or a data-leak bug) since the fake always 'succeeds' by returning everything regardless of what was actually requested.
- This exact class of bug (the fake ignoring a real Prisma option shape) was already found and fixed once this session for league.findUnique's `include: { teams: true }` boolean shorthand — this is the same failure mode on a different method.

# Scope
- In:
  - Add one shared helper (e.g. applySelect(row, select)) in testMemoryDb.ts that, given a row object and a Prisma-style `select` object, returns only the selected keys — used consistently everywhere the fake's methods accept a `select` option, not just grandPrix.findMany.
  - Apply the helper to grandPrix.findMany specifically, since that is the currently broken call site.
  - Add or update a unit test asserting that db.grandPrix.findMany({ ..., select: {...} }) returns only the selected fields, so the fake cannot silently regress on this again.
  - Grep every method in testMemoryDb.ts for a `select` parameter in its type signature and confirm each one either genuinely doesn't need it or now uses the new helper — do not leave a second silently-broken select call site.
- Out:
  - Fixing `include`-handling bugs or deleteMany/updateMany count bugs — those are the next backlog slice, which depends on this one landing first for its shared helper.
  - Replacing testMemoryDb.ts with a real database-backed test harness.

# Acceptance criteria
- AC1: A shared applySelect-style helper exists and is used by every testMemoryDb.ts method whose real Prisma counterpart accepts `select`.
- AC2: db.grandPrix.findMany with a `select` option returns exactly the selected fields, proven by a test.
- AC3: The full existing test suite still passes with no behavior change to any other call site.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: A shared applySelect-style helper exists and is used by every testMemoryDb.ts method whose real Prisma counterpart accepts `select`.
- request-AC13 -> This backlog slice. Proof: AC2: db.grandPrix.findMany with a `select` option returns exactly the selected fields, proven by a test.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Fix testMemoryDb's silent `select` handling
- Keywords: scaffolded-backlog, fix testmemorydb's silent `select` handling, implementation-ready
- Use when: Implementing the scaffolded slice for Fix testMemoryDb's silent `select` handling.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
