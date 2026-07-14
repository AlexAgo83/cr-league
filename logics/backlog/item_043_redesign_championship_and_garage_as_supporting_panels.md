## item_043_redesign_championship_and_garage_as_supporting_panels - Redesign championship and garage as supporting panels
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Supporting game panels
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Championship, standings, history, garage, inventory, rewards, and shop currently compete for attention with the race desk.
- The garage and championship should make the loop feel persistent without overwhelming the current GP decision.
- The UI should make post-race rewards and card availability feel like game progression rather than a raw admin list.

# Scope
- In:
  - Redesign the championship overview as a compact supporting panel with invite code, round, readiness, leader, and standings.
  - Redesign the garage as a compact progression panel with last GP rewards, inventory, and available card choices.
  - Separate persistent championship context from immediate race action.
  - Use visual hierarchy to make rewards, credits, and consumed cards scannable.
  - Ensure all visible championship and garage copy uses i18n catalogs.
- Out:
  - New card economy.
  - New shop offer algorithm.
  - Card selling, rarity, drafts, or catch-up tuning.
  - Full season-management UI.

# Acceptance criteria
- AC1: Championship and garage panels are visually secondary to the current race action but remain easy to scan.
- AC2: Post-GP rewards and consumed card information are visible without reading a paragraph.
- AC3: The garage does not show purchasable actions before they are valid.
- AC4: Existing e2e coverage still verifies the 3-GP loop and card purchase path.

# Direction to carry into implementation
- Championship panel:
  - Treat it like a timing screen, not a generic table.
  - Rows should show position, team, points or delta, and a visual mark for the player's team.
  - Header should show round/current GP, leader, invite code, and readiness only if those values are useful in the current state.
  - Keep it visible but visually quieter than Course: smaller heading, tighter rows, no dominant primary button.
- Garage panel:
  - Split progression into credits/rewards, inventory, and available purchases.
  - Each card item should show name, short effect, strategic fit, cost/status, and one action only when valid.
  - Consumed card and reward information should appear as compact result chips after a GP, not as paragraph-only text.
  - Invalid or unavailable purchases should explain why in one short line, using catalog-backed copy.
- The supporting panels should make the league feel persistent, but they must never force the player to hunt for the next race action.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Championship and garage panels are visually secondary to the current race action but remain easy to scan.
- request-AC2 -> This backlog slice. Proof: AC2: Post-GP rewards and consumed card information are visible without reading a paragraph.
- request-AC5 -> This backlog slice. Proof: AC3: The garage does not show purchasable actions before they are valid.
- request-AC7 -> This backlog slice. Proof: AC4: Existing e2e coverage still verifies the 3-GP loop and card purchase path.
- request-AC8 -> This backlog slice. Proof: AC4: Existing e2e coverage still verifies the 3-GP loop and card purchase path.
- request-AC6 -> This backlog slice. Evidence needed: The web implementation is split into practical components or helpers for the redesigned surfaces, without speculative abstractions or new dependencies.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Redesign championship and garage as supporting panels
- Keywords: scaffolded-backlog, redesign championship and garage as supporting panels, implementation-ready
- Use when: Implementing the scaffolded slice for Redesign championship and garage as supporting panels.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_033_orchestrate_race_cockpit_redesign_v0`

# Notes
- Task `task_033_orchestrate_race_cockpit_redesign_v0` was finished via `logics-manager flow finish task` on 2026-07-14.
