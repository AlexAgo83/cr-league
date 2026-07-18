## item_124_start_new_leagues_with_credits_instead_of_a_starter_card - Start new leagues with credits instead of a starter card
> From version: 0.3.7
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Starter economy
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Starting with an inventory card introduces the card mechanic before the player has chosen it, while starting with credits would make the garage/shop loop more intentional.

# Scope
- In:
  - Change new human team defaults to empty `cards` and a deliberate starting credit amount sufficient to buy at least one early card if desired.
  - Update API tests, web fixtures, E2E mocks, and onboarding/help copy that assume a starter card.
  - Ensure the first-plan card picker handles empty inventory gracefully.
  - Keep bot starter behavior aligned or explicitly documented if bots differ.
- Out:
  - Changing card prices broadly.
  - Adding starter card selection flow.
  - Full economy rebalance.

# Acceptance criteria
- AC1: A newly created human team has no cards and has starting credits.
- AC2: The garage shop is usable immediately with the starting credit balance.
- AC3: Plan view handles no-card inventory without broken controls.
- AC4: API, unit, and E2E fixtures are updated.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: A newly created human team has no cards and has starting credits.
- request-AC9 -> This backlog slice. Proof: AC2: The garage shop is usable immediately with the starting credit balance.
- request-AC10 -> This backlog slice. Proof: AC3: Plan view handles no-card inventory without broken controls.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_049_race_learning_and_feedback_systems`
- Primary task(s): `task_050_orchestrate_race_learning_and_feedback_systems`

# AI Context
- Summary: Start new leagues with credits instead of a starter card
- Keywords: scaffolded-backlog, start new leagues with credits instead of a starter card, implementation-ready
- Use when: Implementing the scaffolded slice for Start new leagues with credits instead of a starter card.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
