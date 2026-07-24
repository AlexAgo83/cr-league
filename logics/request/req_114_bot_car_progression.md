## req_114_bot_car_progression - Bot car progression
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: Bots should be able to buy garage cars when they can afford them, may rotate their car skin at season rollover, and car skins/unlocks remain scoped to each league.
> Confidence: high
> Complexity: Medium
> Theme: General
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Owner: codex

# Needs
- Make bot car cosmetics follow the same light garage economy as players: bots start from free cars, can buy paid cosmetic cars when credits allow, and can change car skin when a new season starts.
- Keep car unlocks scoped to the team inside its league. No profile/global skin carry-over is introduced.

# Context
- Player garage cars are already priced and persisted per team.
- Bots already buy cards during the next-GP transition, so bot car spending should live in that existing progression step.
- Season rollover already resets points in `startNextGrandPrix`, making it the narrow place to rotate bot skins.

# Acceptance criteria
- AC1: New bot teams start on free car skins only.
- AC2: During next-GP progression, bots with enough credits can buy one locked paid car and equip it.
- AC3: At season rollover, bot car skins rotate deterministically from cars available in that league.
- AC4: Paid car unlocks remain team/league-scoped and do not carry into another league.

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
- Summary: Add bot cosmetic car progression without global skin ownership.
- Keywords: bot cars, garage economy, car skins, season rollover, per-league unlocks
- Use when: You need to review bot garage progression or car unlock scoping.
- Skip when: The change is about race physics, card balance, or non-cosmetic upgrades.

# Backlog
- none
- `item_272_bot_car_progression`
