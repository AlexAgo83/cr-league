## item_084_restore_lint_reproducibility_from_a_clean_tree - Restore lint reproducibility from a clean tree
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Tooling hygiene
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- npm run lint currently fails in the reviewed workspace only because ESLint picks up an untracked .shot-tmp.mjs scratch file.
- Transient local files should not make standard repo gates fail for the next agent.

# Scope
- In:
  - Remove the local scratch file if it is still present and not user-owned work, or add a narrow ignore for known generated screenshot scratch files if the workflow creates them repeatedly.
  - Do not hide real source files from lint.
  - Run npm run lint after the cleanup.
- Out:
  - Broad dotfile ignores that could mask committed config mistakes.
  - Changing lint rules unrelated to this failure.

# Acceptance criteria
- AC1: npm run lint passes in a clean checkout.
- AC2: The ignore/delete choice is documented in the implementation closeout.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: npm run lint passes in a clean checkout.
- request-AC2 -> This backlog slice. Evidence needed: The web client includes claimCode in team mutation payloads without exposing it anywhere new in visible UI.
- request-AC3 -> This backlog slice. Evidence needed: Concurrent calls to resolve the same Grand Prix cannot apply points, credits, or card consumption more than once; a second resolver receives a conflict or returns the already-resolved state without duplicate rewards.
- request-AC4 -> This backlog slice. Evidence needed: Concurrent card purchases cannot reduce credits below zero, cannot lose an appended card update, and cannot buy when the pre-update balance is insufficient.
- request-AC5 -> This backlog slice. Evidence needed: /leagues catches LeagueRuleError from createDemoLeague and returns the same client-safe error style as the other league endpoints.
- request-AC6 -> This backlog slice. Evidence needed: League codes and claim codes are generated with crypto random bytes and collision retries that respect the existing unique database constraints.
- request-AC8 -> This backlog slice. Evidence needed: Focused tests cover wrong/missing claimCode, duplicate Grand Prix resolution, card double-spend prevention, create-league validation errors, and deterministic code collision retry behavior where feasible.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Primary task(s): `task_042_orchestrate_api_integrity_hardening`

# AI Context
- Summary: Restore lint reproducibility from a clean tree
- Keywords: scaffolded-backlog, restore lint reproducibility from a clean tree, implementation-ready
- Use when: Implementing the scaffolded slice for Restore lint reproducibility from a clean tree.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_042_orchestrate_api_integrity_hardening`

# Notes
- Task `task_042_orchestrate_api_integrity_hardening` was finished via `logics-manager flow finish task` on 2026-07-18.
