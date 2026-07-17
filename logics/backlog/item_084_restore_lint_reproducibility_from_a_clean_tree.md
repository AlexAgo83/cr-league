## item_084_restore_lint_reproducibility_from_a_clean_tree - Restore lint reproducibility from a clean tree
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
