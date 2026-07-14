## req_027_improve_between_gp_garage_guidance - Improve between-GP garage guidance
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: Playtest confirms the card inventory works, but the player still needs a clearer post-GP summary, a more readable garage, and contextual card recommendations before the next GP.
> Confidence: high
> Complexity: Medium
> Theme: Playtest UX
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the working card inventory understandable during playtests by improving the between-GP garage presentation.
- Keep this as a frontend guidance slice: no new economy rules, no new persistence, no rarity system.

# Context
- The previous slice made cards persistent and purchasable, and user testing confirmed the feature works.
- The product gap is now comprehension: after a GP, the player needs to see what they earned, which card was consumed, and what to buy next.
- The shop should not expose the full catalog at once for V0 because that creates choice noise before balance exists.

# Acceptance criteria
- AC1: The garage shows a post-GP summary for the player with credits, points, and consumed card state.
- AC2: Inventory and shop are visually separated.
- AC3: The shop displays a small recommended offer set rather than the full catalog.
- AC4: Card selection/shop labels show a simple contextual fit signal.
- AC5: English/French copy and tests cover the updated UX.

# AC Traceability
- AC1 -> `task_028_improve_between_gp_garage_guidance`. Proof: `garage-summary` in `apps/web/src/app/App.tsx` shows player GP credits, points, and consumed card state.
- AC2 -> `task_028_improve_between_gp_garage_guidance`. Proof: `garage_inventory` and `garage_shop` headings split inventory from offers in the garage panel.
- AC3 -> `task_028_improve_between_gp_garage_guidance`. Proof: `recommendedShopOffers(...).slice(0, 3)` limits visible offers.
- AC4 -> `task_028_improve_between_gp_garage_guidance`. Proof: `cardFit` drives `Recommended`, `Risky`, and `Low fit` labels in directive and shop UI.
- AC5 -> `task_028_improve_between_gp_garage_guidance`. Proof: EN/FR i18n keys, Vitest assertions, and Playwright garage flow coverage.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Draft a bounded request for improve between-gp garage guidance.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Scope boundaries
- In: post-GP summary, inventory/shop headings, locked-shop hint, three-card recommended offer list, simple card fit labels, tests, docs.
- Out: new backend economy, card rarity, sell/draft mechanics, telemetry, balance tuning.

# Backlog
- `item_033_improve_between_gp_garage_guidance`
