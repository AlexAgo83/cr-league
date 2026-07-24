## item_275_decompose_app_tsx_into_focused_screen_components - Decompose App.tsx into focused screen components
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Frontend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- App.tsx is 841 lines and concentrates view routing plus several screen concerns.
- The size makes the top-level component hard to read and to change safely.
- Screen concerns that could stand alone are inlined.

# Scope
- In:
  - Extract each self-contained screen concern from App.tsx into its own focused child component.
  - Keep App.tsx as a thin router/composition layer over the extracted children.
  - Preserve rendered output, props flow, and behavior; verify with the existing App tests.
- Out:
  - Changing rendered output, styling, or component behavior.
  - Introducing a state-management library or routing dependency.
  - Refactoring the replay or circuit-map subsystems.

# Acceptance criteria
- AC1: App.tsx delegates each screen concern to a focused child with identical rendered output.
- AC2: No single web component file remains an 800+ line grab-bag.
- AC3: The existing App test suites pass unchanged.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: App.tsx delegates each screen concern to a focused child with identical rendered output.
- request-AC5 -> This backlog slice. Proof: AC2: No single web component file remains an 800+ line grab-bag.
- request-AC4 -> This backlog slice. Evidence needed: Overall branch coverage rises meaningfully toward line coverage by covering previously-uncovered error and rule-violation branches, with no assertions weakened or tests skipped to inflate the number.
- request-AC6 -> This backlog slice. Evidence needed: The duplicated object-shape preamble in the leagues/routes.ts body guards is extracted into one shared helper used by all 14 guards, with their field checks and accepted/rejected inputs unchanged.
- request-AC7 -> This backlog slice. Evidence needed: The inlined per-view second-formatting (lap/best times and gaps) is centralized in one web helper, with rendered text byte-identical to today.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_115_repo_review_maintainability_follow_up`
- Primary task(s): `task_116_orchestrate_repo_review_maintainability_follow_up`

# AI Context
- Summary: Decompose App.tsx into focused screen components
- Keywords: scaffolded-backlog, decompose app.tsx into focused screen components, implementation-ready
- Use when: Implementing the scaffolded slice for Decompose App.tsx into focused screen components.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Delivered (uncommitted): extracted HomeSplash, modal-state plumbing, and static UI preference keys from App.tsx; App.tsx is now 796 lines. Verified with web typecheck, focused lint, and 55 App/Profile tests.
- Task `task_116_orchestrate_repo_review_maintainability_follow_up` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_116_orchestrate_repo_review_maintainability_follow_up`
