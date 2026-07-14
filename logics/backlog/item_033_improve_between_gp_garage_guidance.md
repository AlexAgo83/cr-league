## item_033_improve_between_gp_garage_guidance - Improve between-GP garage guidance
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Playtest UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The card inventory works, but the player still needs to infer why the garage matters after a race. The V0 shop also exposes too much choice before card balance exists. Improve the garage so it reads as a clear between-GP step.

# Scope
- In:
  - post-GP summary for player rewards and consumed card state;
  - inventory/shop separation;
  - locked-shop hint before GP resolution;
  - limited recommended offer set;
  - contextual card fit labels;
  - EN/FR copy and tests.
- Out:
  - backend economy changes;
  - card selling, rarity, drafts, packs, or balance telemetry;
  - visual track replay.

# Acceptance criteria
- AC1: The garage shows the player post-GP reward and consumed-card summary.
- AC2: Inventory and recommended shop offers are separate, scannable sections.
- AC3: Only up to three card offers are shown.
- AC4: Card labels include `Recommended`, `Risky`, or `Low fit` based on current GP context.
- AC5: Unit/e2e tests cover the updated garage flow.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 covers post-GP summary.
- request-AC2 -> This backlog slice. Proof: AC2 covers section separation.
- request-AC3 -> This backlog slice. Proof: AC3 covers limited offers.
- request-AC4 -> This backlog slice. Proof: AC4 covers card fit labels.
- request-AC5 -> This backlog slice. Proof: AC5 covers EN/FR copy and tests.

# Decision framing
- Product framing: Improve comprehension before adding deeper economy.
- Product signals: Player confirmed the mechanic works; next risk is whether the between-GP step is readable and motivating.
- Product follow-up: Use later playtest feedback before tuning card acquisition depth.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_027_improve_between_gp_garage_guidance`
- Primary task(s): `task_028_improve_between_gp_garage_guidance`

# AI Context
- Summary: Improve the between-GP garage with rewards, inventory/shop separation, and card fit guidance.
- Keywords: backlog, garage, cards, UX, playtest, progression
- Use when: Use when implementing or reviewing the delivery slice for Improve between-GP garage guidance.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: This directly addresses the player's request to make the working progression loop understandable.

# Notes
- Hybrid rationale: Derived from request `req_027_improve_between_gp_garage_guidance` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_027_improve_between_gp_garage_guidance.md`.
- Generated locally by logics-manager.
- Task `task_028_improve_between_gp_garage_guidance` was finished via `logics-manager flow finish task` on 2026-07-14.

# Tasks
- `task_028_improve_between_gp_garage_guidance`
