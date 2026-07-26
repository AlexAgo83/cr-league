## item_303_decompose_the_god_modules_lifecycle_ts_and_app_tsx - Decompose the god modules (lifecycle.ts and App.tsx)
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 75%
> Complexity: Medium
> Theme: Maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- lifecycle.ts (689 lines) mixes league CRUD, GP lifecycle, bot generation, input normalization and opponent-reveal visibility.
- App.tsx (796 lines, ~42 hooks) is the UI orchestration bottleneck every feature threads through.

# Scope
- In:
  - Split lifecycle.ts into leagueAdmin / grandPrixLifecycle / bots / visibility keeping the store barrel's public surface intact.
  - Extract App.tsx state groups into per-domain hooks, continuing the useRaceDerivations/leagueMutations pattern.
  - Pure refactor: API responses and behavior unchanged, tests green throughout.
- Out:
  - Behavior/response changes.
  - Touching the reveal visibility logic beyond relocating it.

# Acceptance criteria
- AC1: lifecycle.ts is split by responsibility with the store surface intact.
- AC2: App.tsx orchestration is extracted into per-domain hooks.
- AC3: No behavior/response change; tests pass.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: lifecycle.ts is split by responsibility with the store surface intact.
- request-AC6 -> This backlog slice. Proof: AC2: App.tsx orchestration is extracted into per-domain hooks.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Primary task(s): `task_123_orchestrate_the_source_of_truth_remediation`

# AI Context
- Summary: Decompose the god modules (lifecycle.ts and App.tsx)
- Keywords: scaffolded-backlog, decompose the god modules (lifecycle.ts and app.tsx), implementation-ready
- Use when: Implementing the scaffolded slice for Decompose the god modules (lifecycle.ts and App.tsx).
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
