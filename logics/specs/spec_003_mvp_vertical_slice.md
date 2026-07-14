## spec_003_mvp_vertical_slice - MVP Vertical Slice
> From version: 1.0.0
> Schema version: 1.0
> Status: Settled
> Understanding: 90%
> Confidence: 85%
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`

# Purpose
Define the smallest implementation slice that can test whether CR League is fun.

The vertical slice should prove the Grand Prix loop before building the full league product.

# Recommendation
Build a solo-first vertical slice that keeps the engine compatible with multiplayer.

Why:

- fastest way to test the race loop;
- no invite/auth/deadline complexity yet;
- bots exercise the same simulation path as multiplayer;
- easier playtesting and iteration.

# Slice Scope
Must include:

- create or use one local team profile;
- solo championship with 6 teams total;
- 5 bot archetypes plus the player;
- 1 season with 3 Grand Prix for prototype validation;
- 1 or 2 circuits;
- weather forecast and resolved weather timeline;
- three preparation choices;
- 6-card initial set;
- race simulation;
- event timeline;
- text report;
- standings and credits;
- simple inventory;
- simple replay placeholder or minimal top-down replay.

# Preferred Build Order
1. Static data: teams, bots, circuits, cards.
2. Preparation screen.
3. Seeded simulation function.
4. Race result and report.
5. Standings and credits.
6. Minimal replay from event timeline.
7. Inventory and one-card-per-GP flow.

# Success Criteria
- A player can complete 3 Grand Prix in under 15 minutes.
- After each race, the player can explain at least one reason for the result.
- At least one race creates a memorable event: weather gamble, card save, rival overtake, late failure, or comeback.
- The player wants to change strategy for the next race.

# Explicit Cuts
- No private multiplayer in the first vertical slice.
- No account system.
- No persisted online league.
- No card shop if post-race rewards are faster to implement.
- No polished art requirement.
- No 3D.

# Hand-off To Full MVP
After the vertical slice proves the loop, expand to:

- private league creation;
- invite code;
- real persistence;
- lazy scheduled resolution;
- larger season;
- shop;
- improved replay.

# Open Questions
- Should the first vertical slice persist locally or use a simple backend immediately?
- Is a text-first replay acceptable for the first internal playtest?
- Should the slice use 3 GP or 5 GP to test season comeback?
