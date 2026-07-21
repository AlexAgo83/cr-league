## item_190_monotonic_payout_and_no_unplayed_card_consumption - Monotonic payout and no unplayed-card consumption
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Economy integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- classify (simulateRace.ts:924-925) adds comebackBonus = min(40, max(0, position-6)*10) on top of RACE_CREDITS_BY_POSITION=[150,130,115,105,100,100], so P8=120, P9=130, P10+=140 credits beat P3=115, P4=105, P5=P6=100 — finishing near-last pays more than mid-pack.
- On a default/deadline resolve, buildParticipants (store.ts:966-988) gives a non-submitting human defaultCardForTeam(team,...) = team.cards[0] (store.ts:1067-1069), which resolveCurrentGrandPrix then removes from inventory via result.consumedCards (store.ts:733-742) though the player never played it.

# Scope
- In:
  - Reshape the payout so baseCredits+comebackBonus is monotonic non-increasing across positions while retaining a tail cushion (clamp the sum below the next-better position's credits, or adjust the base table plus a smaller bonus).
  - Leave cardId undefined for auto-defaulted humans in buildParticipants so no card is played or consumed; keep bot default-card behavior unchanged.
  - Unit test the full-range payout monotonicity and a default-resolve case asserting an empty/unchanged human inventory; run balance:sim to confirm no unintended shift.
- Out:
  - Retuning per-card or per-approach deltas.
  - Changing points (RACE_POINTS_BY_POSITION) rather than credits.
  - Removing the comeback mechanic.

# Acceptance criteria
- AC1: For every adjacent pair of positions, the worse position's total credits do not exceed the better position's.
- AC2: The tail of the field still receives a comeback cushion above the flat base.
- AC3: A non-submitting human loses no card on default resolve and consumedCards holds only chosen cards.
- AC4: balance:sim shows no unintended economy regression.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: For every adjacent pair of positions, the worse position's total credits do not exceed the better position's.
- request-AC2 -> This backlog slice. Proof: AC2: The tail of the field still receives a comeback cushion above the flat base.
- request-AC6 -> This backlog slice. Proof: AC3: A non-submitting human loses no card on default resolve and consumedCards holds only chosen cards.
- request-AC4 -> This backlog slice. Evidence needed: A decision with rivalTeamId equal to the submitting team is rejected with 400, covered by a test.
- request-AC5 -> This backlog slice. Evidence needed: The recovery limiter prunes expired buckets and does not consume the email attempt when the IP branch rejects; Team.profileId is indexed; buyBotCards no longer writes bot cards from a stale snapshot.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_050_gameplay_and_economy_integrity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
- Primary task(s): `task_087_orchestrate_gameplay_and_economy_integrity_fixes`

# AI Context
- Summary: Monotonic payout and no unplayed-card consumption
- Keywords: scaffolded-backlog, monotonic payout and no unplayed-card consumption, implementation-ready
- Use when: Implementing the scaffolded slice for Monotonic payout and no unplayed-card consumption.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_087_orchestrate_gameplay_and_economy_integrity_fixes` was finished via `logics-manager flow finish task` on 2026-07-22.
