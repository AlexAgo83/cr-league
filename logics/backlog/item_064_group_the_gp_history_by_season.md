## item_064_group_the_gp_history_by_season - Group the GP history by season
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: History legibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- grandPrixHistory renders as one flat list: with multiple seasons, finding a past season's races or telling seasons apart requires reading round numbers.

# Scope
- In:
  - Group history entries by season in the Championship view: collapsible sections, most recent season expanded, older collapsed.
  - Season header shows the summary line (season number, champion when the season is complete, GP count) via the seasonStandings helper from the sibling item.
  - Keep each GP entry's current content and interactions intact, including opening the history replay.
  - Route new labels through EN/FR catalogs; use a native details/summary or the existing panel pattern — no new dependency.
- Out:
  - Pagination, search, filters, or virtualization.
  - Changing what a GP history entry displays.

# Acceptance criteria
- AC1: With two seasons of history, two season groups render, the current one expanded; collapsing/expanding works with keyboard and pointer.
- AC2: History replay still opens from an entry inside a collapsed-then-expanded older season.
- AC3: EN/FR keys complete; all gates pass.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: With two seasons of history, two season groups render, the current one expanded; collapsing/expanding works with keyboard and pointer.
- request-AC7 -> This backlog slice. Proof: AC2: History replay still opens from an entry inside a collapsed-then-expanded older season.
- request-AC8 -> This backlog slice. Proof: AC3: EN/FR keys complete; all gates pass.
- request-AC9 -> This backlog slice. Proof: AC3: EN/FR keys complete; all gates pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_008_race_ceremony_and_season_narrative_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_037_starting_grid_modal_and_season_narrative`
- Primary task(s): `task_038_orchestrate_starting_grid_and_season_narrative`

# AI Context
- Summary: Group the GP history by season
- Keywords: scaffolded-backlog, group the gp history by season, implementation-ready
- Use when: Implementing the scaffolded slice for Group the GP history by season.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
