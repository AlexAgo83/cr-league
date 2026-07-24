## item_272_bot_car_progression - Bot car progression
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Bots could visually use car skins without participating in the new garage economy. That makes the paid-car catalog feel player-only and blurs the rule that skins are scoped to the current league/team.

# Scope
- In:
  - free-only bot starting car assignment
  - bot paid-car purchase during next-GP progression when affordable
  - bot car-skin rotation at season rollover from cars available in that league
  - tests proving paid unlocks stay per league/team
- Out:
  - stat upgrades for cars
  - shared/global car ownership between leagues
  - frontend garage UI for bot inventories

# Acceptance criteria
- AC1: New bot teams start on free car skins only.
- AC2: During next-GP progression, bots with enough credits can buy one locked paid car and equip it.
- AC3: At season rollover, bot car skins rotate deterministically from cars available in that league.
- AC4: Paid car unlocks remain team/league-scoped and do not carry into another league.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 covers free-only bot starting skins.
- request-AC2 -> This backlog slice. Proof: AC2 covers bot paid-car purchase during next-GP progression.
- request-AC3 -> This backlog slice. Proof: AC3 covers season rollover skin rotation.
- request-AC4 -> This backlog slice. Proof: AC4 covers per-league/team unlock scoping.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_114_bot_car_progression`
- Primary task(s): `task_115_bot_car_progression`

# AI Context
- Summary: Bot car progression through the existing garage economy.
- Keywords: bot cars, garage economy, paid car unlocks, season rollover, per-league skins
- Use when: Reviewing bot cosmetic progression or paid car scoping.
- Skip when: The work is about player garage UI only or car performance tuning.

# Priority
- Priority: Medium
- Rationale: Keeps the paid garage rules coherent for bot-filled leagues without changing race balance.

# Notes
- Hybrid rationale: Derived from request `req_114_bot_car_progression` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_114_bot_car_progression.md`.
- Generated locally by logics-manager.
- Task `task_115_bot_car_progression` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_115_bot_car_progression`
