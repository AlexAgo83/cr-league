## task_111_clear_consumed_plan_card_for_the_next_grand_prix - Clear consumed plan card for the next Grand Prix
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_268_clear_consumed_plan_card_for_the_next_grand_prix`

# Acceptance criteria
- AC1: Pass the plan-form setter into league mutations.
- AC2: Clear only `cardId` after a successful next-GP response.
- AC3: Assert the persisted draft and map panel no longer contain the consumed card.

# AC Traceability
- request-AC1 -> This task. Proof: `startNextGrandPrix` clears `cardId` after setting the returned league state.
- request-AC2 -> This task. Proof: The App flow test checks local storage and the map plan panel.
- request-AC3 -> This task. Proof: The reset is inside the awaited `run` callback after `api` resolves.

# Validation
- `npm test -- --run apps/web/src/app/App.test.tsx` passed: 32 tests.
- `npm run typecheck` passed.
- `npm test` passed: 300 tests, 7 skipped.
- `npm run lint` passed.
- `npm run build` passed.
- `logics-manager lint --require-status` passed.
- `logics-manager audit --group-by-doc` passed with 0 findings.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Cleared the persisted plan-card selection only after the next Grand Prix starts successfully.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_268_clear_consumed_plan_card_for_the_next_grand_prix`
- Related request(s): `req_110_clear_consumed_plan_card_for_the_next_grand_prix`

# AI Context
- Summary: Implement clear consumed plan card for the next grand prix.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_110_clear_consumed_plan_card_for_the_next_grand_prix`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
