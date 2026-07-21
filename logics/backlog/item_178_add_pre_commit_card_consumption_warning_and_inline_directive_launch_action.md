## item_178_add_pre_commit_card_consumption_warning_and_inline_directive_launch_action - Add pre-commit card consumption warning and inline directive launch action
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Plan commit clarity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Card consumption is shown only after the race (GarageView.tsx:189-191), so a player does not know a played card is destroyed until it is gone.
- The directive tab has no launch/send action because DirectivePanel never receives primaryCommand, forcing a tab switch to commit.
- Any added launch button risks duplicating launch logic or competing with the Stand-view primary command.

# Scope
- In:
  - Show a consumption notice in the plan card selector when a card is attached to the race plan.
  - Pass primaryCommand into the directive tab and render a contextual launch/send action from it.
  - Reuse the existing enabled/locked/loading gating from primaryCommand.
  - Add EN/FR copy for the warning and the action.
- Out:
  - Any change to card consumption, banking, or resale rules.
  - Any simulation, reward, or API change.
  - Redesigning plan navigation or adding a second launch button elsewhere.

# Acceptance criteria
- AC1: Selecting a card for the race plan shows a pre-commit consumption notice.
- AC2: The directive tab launches/sends via the existing primaryCommand with identical gating and no duplicated logic.
- AC3: EN/FR copy present; plan UI stays compact.
- AC4: No model, reward, consumption-rule, or API change; typecheck, test, build, lint, e2e, and logics:validate pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `DirectivePanel` shows `directive_card_consumption_warning` with the selected card label when `selectedCardId` is set.
- request-AC2 -> This backlog slice. Proof: `PlanView` passes the existing `primaryCommand` into `DirectivePanel`, whose inline button calls `primaryCommand.action` and renders `primaryCommand.label`.
- request-AC3 -> This backlog slice. Proof: the inline button uses `primaryCommand.disabled`; no launch/submit branching or new API path was added.
- request-AC4 -> This backlog slice. Proof: EN/FR warning copy was added and the inline action reuses existing localized primary-command labels.
- request-AC5 -> This backlog slice. Proof: only web UI, CSS, i18n, tests, and Logics docs changed; no shared model, simulation, reward, consumption, or API files changed.
- request-AC6 -> This backlog slice. Proof: typecheck, lint, unit tests, build, e2e, and Logics validation passed.

# Notes
- Added focused coverage in `apps/web/src/features/DirectivePanel.test.tsx`.
- Task `task_081_orchestrate_plan_commit_clarity` owns closeout validation.
- Task `task_081_orchestrate_plan_commit_clarity` was finished via `logics-manager flow finish task` on 2026-07-21.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_044_plan_commit_clarity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_080_warn_card_consumption_before_commit_and_add_an_inline_launch_action_on_the_directive_tab`
- Primary task(s): `task_081_orchestrate_plan_commit_clarity`

# AI Context
- Summary: Add pre-commit card consumption warning and inline directive launch action
- Keywords: scaffolded-backlog, add pre-commit card consumption warning and inline directive launch action, implementation-ready
- Use when: Implementing the scaffolded slice for Add pre-commit card consumption warning and inline directive launch action.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
