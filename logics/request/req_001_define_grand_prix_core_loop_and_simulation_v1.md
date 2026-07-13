## req_001_define_grand_prix_core_loop_and_simulation_v1 - Define Grand Prix core loop and simulation V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Gameplay design
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Define the first playable Grand Prix loop in enough detail to guide implementation without relying on conversation memory.
- Specify a V1 race simulation model that is simple, seedable, explainable, and compatible with both solo immediate races and asynchronous multiplayer leagues.
- Define the minimum replay and race report outputs needed to prevent the race result from feeling like a black box.
- Keep the model small enough for an MVP while preserving the product pillars from `prod_001_cr_league_product_brief`: team principal fantasy, strategic pre-race bets, visual replay, clear report, cards, rival goals, and fair comeback opportunities.

# Context
- The player does not drive. The player prepares the team before the Grand Prix, then watches the simulation resolve.
- The product brief establishes three default pre-race decisions: race approach, technical preparation, and special plan.
- The first simulation should not model full motorsport physics. It should generate believable race stories through segment-based resolution, event timelines, and clear causal explanations.
- The same model must serve solo play with bots and private multiplayer leagues.
- Lazy race resolution is acceptable: scheduled races can be simulated on first access after the deadline.
- The desired deliverable is a written spec under `logics/specs/`, not production code.

# Acceptance criteria
- AC1: A dedicated spec exists for Grand Prix Core Loop and Simulation V1.
- AC2: The spec defines all required Grand Prix phases from briefing to next-race progression.
- AC3: The spec defines the simulation inputs, segment model, event timeline, race result outputs, and replay/report requirements.
- AC4: The spec includes at least one complete example Grand Prix showing how choices produce simulation events and report explanations.
- AC5: The spec explicitly bounds what is not modeled in V1.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `prod_001_cr_league_product_brief`
- `logics/product/prod_001_cr_league_product_brief.md`

# AI Context
- Summary: Draft a bounded request for define grand prix core loop and simulation v1.
- Keywords: grand-prix-loop, simulation-v1, race-report, replay, gameplay-design
- Use when: Defining or implementing the first playable race loop and simulation model.
- Skip when: Working on unrelated UI, hosting, authentication, or non-race systems.

# Backlog
- `item_007_define_grand_prix_core_loop_and_simulation_v1`
