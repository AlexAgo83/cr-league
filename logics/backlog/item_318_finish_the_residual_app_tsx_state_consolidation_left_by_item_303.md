## item_318_finish_the_residual_app_tsx_state_consolidation_left_by_item_303 - Finish the residual App.tsx state consolidation left by item_303
> From version: 0.5.1
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Low
> Theme: Maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- App.tsx is still 779 lines with 25 useState declarations and passes about 53 props to GameViews.tsx, so every new feature widens that surface.
- item_303 already split lifecycle.ts and extracted per-domain hooks and is marked Done at 0.4.6, so the structural work exists and only the state sprawl remains.
- Without an explicit bound this reads as an invitation to redo the whole decomposition, which would be wasted effort.

# Scope
- In:
  - Group the navigation, modal, and panel-visibility state, roughly half of the current useState calls, into a single reducer or a dedicated hook following the existing per-domain hook pattern.
  - Reduce the GameViews prop surface where the grouping makes it mechanical, without inventing new abstractions.
  - Keep the change a pure refactor: no player-visible behavior change and no new dependency.
  - Update item_303 or link this item to it so the history stays traceable.
- Out:
  - Introducing a state management library, context provider tree, or router.
  - Re-splitting lifecycle.ts or any module already covered by item_303.
  - Redesigning any screen, modal, or navigation flow.
  - Chasing a line-count target for its own sake.

# Acceptance criteria
- AC1: The navigation, modal, and panel-visibility state is consolidated behind one reducer or hook.
- AC2: No player-visible behavior change; existing tests pass without semantic modification.
- AC3: No new runtime dependency is introduced.
- AC4: typecheck, lint, unit tests, and coverage pass with coverage no lower than the 89.37% statement baseline.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: The navigation, modal, and panel-visibility state is consolidated behind one reducer or hook.
- request-AC8 -> This backlog slice. Proof: AC2: No player-visible behavior change; existing tests pass without semantic modification.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_078_credential_storage_and_dependency_currency_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_126_review_remediation_stop_persisting_the_master_recovery_credential_restore_dependency_currency_finish_app_tsx_state_consolidation`
- Primary task(s): `task_127_orchestrate_credential_storage_and_dependency_currency_remediation`

# AI Context
- Summary: Finish the residual App.tsx state consolidation left by item_303
- Keywords: scaffolded-backlog, finish the residual app.tsx state consolidation left by item_303, implementation-ready
- Use when: Implementing the scaffolded slice for Finish the residual App.tsx state consolidation left by item_303.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
