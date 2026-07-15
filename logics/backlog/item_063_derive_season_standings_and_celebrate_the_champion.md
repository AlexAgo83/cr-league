## item_063_derive_season_standings_and_celebrate_the_champion - Derive season standings and celebrate the champion
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Season payoff
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Season rollover resets every team's points to zero with no snapshot, so the champion and final table vanish the moment the next season starts.
- grandPrixHistory holds everything needed to reconstruct them, but nothing does.

# Scope
- In:
  - Add a seasonStandings(history, season, teams) helper summing per-GP classification points per team for the season's resolved GPs, returning the ordered final table; unit-test with a multi-season fixture including edge cases (missing result, single-GP season).
  - Detect rollover client-side (fetched season > last seen season for the league) with a localStorage once-per-season guard, and show the season-recap modal: season number, champion with livery, podium, full standings with player highlighted.
  - Add the palmares block to ChampionshipView: one line per completed season (season, champion, GP count) from the same helper; clicking a line reopens the recap modal for that season.
  - Reuse the existing modal-overlay pattern; route all copy through EN/FR catalogs.
- Out:
  - Server-side season archive, API changes, or scoring changes.
  - Cross-league or lifetime records.
  - Rewards or economy effects at season end.

# Acceptance criteria
- AC1: For a league with two completed seasons, the palmares lists both champions and each recap modal shows the correct final table, matching hand-computed sums from history.
- AC2: The champion modal fires once when the rollover is first seen and not on subsequent reloads, but stays reachable from the palmares.
- AC3: The helper is unit-tested including a defaulted/missing result entry; EN/FR key sets are identical.
- AC4: All gates pass.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: For a league with two completed seasons, the palmares lists both champions and each recap modal shows the correct final table, matching hand-computed sums from history.
- request-AC4 -> This backlog slice. Proof: AC2: The champion modal fires once when the rollover is first seen and not on subsequent reloads, but stays reachable from the palmares.
- request-AC5 -> This backlog slice. Proof: AC3: The helper is unit-tested including a defaulted/missing result entry; EN/FR key sets are identical.
- request-AC7 -> This backlog slice. Proof: AC4: All gates pass.
- request-AC8 -> This backlog slice. Proof: AC4: All gates pass.
- request-AC9 -> This backlog slice. Proof: AC4: All gates pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_008_race_ceremony_and_season_narrative_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_037_starting_grid_modal_and_season_narrative`
- Primary task(s): `task_038_orchestrate_starting_grid_and_season_narrative`

# AI Context
- Summary: Derive season standings and celebrate the champion
- Keywords: scaffolded-backlog, derive season standings and celebrate the champion, implementation-ready
- Use when: Implementing the scaffolded slice for Derive season standings and celebrate the champion.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
