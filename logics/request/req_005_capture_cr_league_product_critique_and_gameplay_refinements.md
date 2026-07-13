## req_005_capture_cr_league_product_critique_and_gameplay_refinements - Capture CR League product critique and gameplay refinements
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Product critique
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Capture a critical product pass after the initial CR League product, gameplay, architecture, and implementation contracts.
- Identify the remaining fun risks before implementation starts.
- Convert the critique into concrete gameplay refinements that should influence the first vertical slice.
- Keep the refinements small enough to preserve the solo-first MVP scope.

# Context
- Existing docs define the product, Grand Prix loop, V1 planning, architecture, and implementation contracts.
- The remaining concern is not technical feasibility but whether the loop is emotionally strong enough.
- The main risk is that the game becomes "choose a few options, then the simulation decides" unless causality, rivalry, card drama, and session pacing are reinforced.

# Acceptance criteria
- AC1: A product critique and gameplay refinements spec exists.
- AC2: The spec identifies the major fun risks.
- AC3: The spec proposes concrete refinements for rivalries, cards, replay/report pacing, bots, card acquisition, season ending, team identity, and comeback framing.
- AC4: The refinements are scoped so they inform V1 without exploding it.
- AC5: Logics validation passes.

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
- `spec_001_grand_prix_core_loop_and_simulation_v1`
- `spec_002_card_set_v1`
- `spec_003_mvp_vertical_slice`
- `spec_004_race_report_and_replay_ux`
- `spec_009_playtest_plan`

# AI Context
- Summary: Draft a bounded request for capture cr league product critique and gameplay refinements.
- Keywords: product-critique, gameplay-refinements, rivalry, cards, replay, bots, season-ending
- Use when: Reviewing the product fun factor or preparing the first implementation/playtest.
- Skip when: Working on pure infrastructure unrelated to gameplay feel.

# Backlog
- `item_011_capture_cr_league_product_critique_and_gameplay_refinements`
