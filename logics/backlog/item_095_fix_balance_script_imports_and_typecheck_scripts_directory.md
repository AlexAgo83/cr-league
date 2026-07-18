## item_095_fix_balance_script_imports_and_typecheck_scripts_directory - Fix balance script imports and typecheck scripts directory
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Build integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- scripts/balance-simulations.ts imports CARD_PRICES and createPrng, which packages/shared/src/index.ts does not export, so the balance tool cannot run.
- scripts/ is outside the tsconfig project references, so this breakage is invisible to npm run typecheck and CI.

# Scope
- In:
  - Export createPrng (and ECONOMY_MODE_CREDIT_BONUS for consistency) from packages/shared/src/index.ts.
  - Change the script to use the existing flat CARD_PRICE constant instead of the nonexistent per-card price map.
  - Add a scripts/tsconfig.json and include it in the root typecheck (project reference or a dedicated typecheck script wired into npm run typecheck).
  - Run the balance script once to confirm it executes end to end.
- Out:
  - Introducing per-card pricing.
  - Rewriting audit-circuits.mjs regex parsing (acceptable as-is for a dev tool).
  - Adding tests for scripts.

# Acceptance criteria
- AC1: npm run balance:sim executes without import errors.
- AC2: npm run typecheck fails if a script references a nonexistent shared export.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: npm run balance:sim executes without import errors.
- request-AC7 -> This backlog slice. Proof: AC2: npm run typecheck fails if a script references a nonexistent shared export.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Primary task(s): `task_045_orchestrate_repo_review_remediation_pass_3`

# AI Context
- Summary: Fix balance script imports and typecheck scripts directory
- Keywords: scaffolded-backlog, fix balance script imports and typecheck scripts directory, implementation-ready
- Use when: Implementing the scaffolded slice for Fix balance script imports and typecheck scripts directory.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
