## item_268_clear_consumed_plan_card_for_the_next_grand_prix - Clear consumed plan card for the next Grand Prix
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Plan state integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The persisted plan draft can retain a consumed card after advancing to the next Grand Prix.

# Scope
- In:
  - Reset only the local card selection after the next-GP API call succeeds.
  - Preserve approach, preparation, and pit strategy.
  - Cover persistence and current-plan rendering in the existing full-flow test.
- Out:
  - Card consumption rules, inventory mutation, or race balance changes.

# Acceptance criteria
- AC1: The next-GP success path sets `cardId` to an empty selection.
- AC2: Local storage and the map plan panel do not retain the consumed card.
- AC3: The reset occurs inside the successful API callback.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `startNextGrandPrix` resets the functional form state.
- request-AC2 -> This backlog slice. Proof: `usePlanForm` persists the reset and the App test checks both storage and UI.
- request-AC3 -> This backlog slice. Proof: The reset follows the awaited API response.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_110_clear_consumed_plan_card_for_the_next_grand_prix.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Clear consumed plan card for the next Grand Prix
- Keywords: backlog-groom, request, clear consumed plan card for the next grand prix, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Clear consumed plan card for the next Grand Prix.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_110_clear_consumed_plan_card_for_the_next_grand_prix` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_110_clear_consumed_plan_card_for_the_next_grand_prix.md`.
- Generated locally by logics-manager.
- Task `task_111_clear_consumed_plan_card_for_the_next_grand_prix` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_111_clear_consumed_plan_card_for_the_next_grand_prix`
