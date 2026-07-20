## item_141_single_recommended_cta_at_grand_prix_start - Single recommended CTA at Grand Prix start
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Low
> Theme: First-session UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- On a fresh GP, Edit plan and New lap time pulse simultaneously because their highlight conditions are independent, so the recommended first action is ambiguous.
- The playtest that produced roadmap patch 0.3.16 found players hesitating at exactly this fork.

# Scope
- In:
  - Gate the plan CTAs' highlight-command on the existence of at least one qualifying attempt (or a submitted plan), so only the chrono CTA pulses at GP start.
  - Keep the existing highlight-clearing behavior on click and the per-state primary command mapping unchanged.
  - Coordinate with the req_058 command-clicked collapse: implement on whichever structure is in main when this starts.
  - Update App.test.tsx highlight assertions and the e2e highlight lifecycle spec to the single-recommendation behavior.
- Out:
  - Changing the desk phase machine or button order.
  - New animation styles.

# Acceptance criteria
- AC1: With no plan and zero attempts, only the chrono CTA carries highlight-command.
- AC2: After one attempt, the plan path highlights as today.
- AC3: Unit and e2e highlight tests pass with the new rule.

# Implementation Notes
- 2026-07-20 wave 1: gated the prepare/send-plan highlight path on at least one qualifying attempt in `App.tsx` and gated the edit-plan highlight in `DriveView.tsx`, leaving `New chrono` as the only fresh-GP highlighted CTA.
- Unit coverage now asserts a single highlighted race action at zero attempts and `Send plan` returning after the first chrono.
- E2E coverage now asserts the initial single highlighted CTA; the mocked flow does not run a qualifying attempt, so post-chrono highlight recovery stays covered by the unit test.

# Validation
- 2026-07-20 targeted: `rtk npm run typecheck`; `rtk npm run lint`; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts`; `rtk npx playwright test tests/e2e/private-league.spec.ts -g "first-click commands"`.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: With no plan and zero attempts, only the chrono CTA carries highlight-command.
- request-AC4 -> This backlog slice. Proof: AC2: After one attempt, the plan path highlights as today.
- request-AC3 -> This backlog slice. Evidence needed: The EN chrono CTA reads 'New chrono' and the league/championship/plan/chrono/launch vocabulary uses one term per concept across rail, subscreen, action, and hint keys in both locales, with the i18n parity test passing.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_023_first_gp_action_clarity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`
- Primary task(s): `task_060_orchestrate_first_gp_action_clarity`

# AI Context
- Summary: Single recommended CTA at Grand Prix start
- Keywords: scaffolded-backlog, single recommended cta at grand prix start, implementation-ready
- Use when: Implementing the scaffolded slice for Single recommended CTA at Grand Prix start.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_060_orchestrate_first_gp_action_clarity`

# Notes
- Task `task_060_orchestrate_first_gp_action_clarity` was finished via `logics-manager flow finish task` on 2026-07-20.
