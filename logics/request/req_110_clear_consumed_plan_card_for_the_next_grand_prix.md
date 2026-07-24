## req_110_clear_consumed_plan_card_for_the_next_grand_prix - Clear consumed plan card for the next Grand Prix
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Plan state integrity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Clear the selected plan card when a resolved Grand Prix advances to the next race day.

# Context
- The race engine consumes and removes the card from inventory correctly.
- `form.cardId` remained in the persisted local plan draft, so UI surfaces reading the raw form could still show the previous card.
- The Plan screen hid the issue because its selected-card derivation filters against current inventory.

# Acceptance criteria
- AC1: A successful next-GP transition clears `form.cardId`.
- AC2: The cleared value is persisted and no longer appears in the current-plan UI.
- AC3: A failed transition does not clear the local draft.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/web/src/app/leagueMutations.ts`
- `apps/web/src/app/usePlanForm.ts`
- `apps/web/src/app/App.test.tsx`

# AI Context
- Summary: Draft a bounded request for clear consumed plan card for the next grand prix.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_268_clear_consumed_plan_card_for_the_next_grand_prix`
