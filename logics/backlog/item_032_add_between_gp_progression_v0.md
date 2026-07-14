## item_032_add_between_gp_progression_v0 - Add between-GP progression v0
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Economy and progression
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The prototype rewards credits after a GP, but credits do not yet create a return decision. Cards are also selectable without ownership, which weakens the fantasy of managing a team garage. Add a thin, testable progression layer that makes credits become inventory before the next GP.

# Scope
- In:
  - persisted team card inventory;
  - starter card for human teams;
  - fixed-price card shop API;
  - owned-card validation on directive submission;
  - consumable card removal after GP resolution;
  - minimal app garage/inventory UI with EN/FR copy;
  - docs and Logics updates.
- Out:
  - selling cards;
  - rarity, packs, draft offers, or dynamic pricing;
  - catch-up economy balancing;
  - full card collection UX;
  - scheduler or notification work.

# Acceptance criteria
- AC1: League state exposes `teams[].cards` and a `cardShop`.
- AC2: `POST /leagues/:leagueId/cards/buy` buys a valid card for a team with enough credits.
- AC3: `submitDecision` rejects a card that is not in the team's inventory.
- AC4: `resolveCurrentGrandPrix` consumes played cards from inventory.
- AC5: The web app displays player credits, inventory counts, and buy buttons in a garage section.
- AC6: Validation covers API behavior and web rendering.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 exposes persisted inventory in league state.
- request-AC2 -> This backlog slice. Proof: AC2 covers buying a card with credits.
- request-AC3 -> This backlog slice. Proof: AC3 validates owned-card usage.
- request-AC4 -> This backlog slice. Proof: AC4 covers post-resolution consumption.
- request-AC5 -> This backlog slice. Proof: AC5 covers the minimal garage UI and bilingual copy.
- request-AC6 -> This backlog slice. Proof: AC6 covers docs and Logics updates.

# Decision framing
- Product framing: Thin progression hook after playtest feedback.
- Product signals: Between-GP motivation is now the next risk after guidance/replay.
- Product follow-up: Later economy work should tune catch-up rules and card acquisition depth from real playtest feedback.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_026_add_between_gp_progression_v0`
- Primary task(s): `task_027_add_between_gp_progression_v0`

# AI Context
- Summary: Add the first card inventory and garage progression hook between GPs.
- Keywords: backlog, cards, inventory, garage, credits, progression
- Use when: Use when implementing or reviewing the delivery slice for Add between-GP progression v0.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: Playtest feedback identified weak between-GP motivation as a blocker for repeated sessions.

# Notes
- Hybrid rationale: Derived from request `req_026_add_between_gp_progression_v0` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_026_add_between_gp_progression_v0.md`.
- Generated locally by logics-manager.
- Task `task_027_add_between_gp_progression_v0` was finished via `logics-manager flow finish task` on 2026-07-14.

# Tasks
- `task_027_add_between_gp_progression_v0`
