## req_037_starting_grid_modal_and_season_narrative - Starting grid modal and season narrative
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: Medium
> Theme: Race ceremony and season narrative
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Show a starting-grid recap before the race is launched: grid order, qualifying times, the player's team highlighted, and the GP conditions.
- Celebrate the end of a season: who is champion, the podium, and the final standings, shown when the season rolls over.
- Keep a persistent season record (palmares) so past champions remain visible after the rollover resets points.
- Make the GP history navigable by season instead of one flat list.

# Context
- The starting grid needs no API change: replicate the server's ranking rule client-side (best qualifying time per team ascending, missing times fall back to team order — the exact comparator of buildParticipants) and reuse the qualifying leaderboard data already computed in App.tsx.
- The race-launch flow already has a confirmation step; the grid recap enriches that existing confirmation rather than adding a new click.
- Season standings derive from grandPrixHistory: sum each team's classification points across the season's resolved GPs. This is retroactive (works for seasons already played) and needs no schema change. Documented limit: if scoring ever gains bonuses outside GP classifications, a server-side season snapshot at rollover becomes the right tool — that is the upgrade path, not the current need (owner-approved YAGNI).
- Season-end detection is client-side: the fetched state's currentGrandPrix.season being greater than the previously displayed season signals the rollover; localStorage remembers the last celebrated season per league so the champion modal shows once, not on every reload.
- grandPrixHistory entries carry season and round, and teams are stable across seasons (only points reset), so team names and liveries resolve from the current state.
- Sequencing with sibling chains: run AFTER req_033 (over-engineering cleanup) — both touch App.tsx modal code, ChampionshipView (item_053 extracts LiveryPlate there), and the i18n catalogs. req_033 explicitly rejected a generic Modal wrapper: reuse the existing modal-overlay pattern in place. Compatible with req_034 (it changes GP creation inputs server-side, not history shape); if req_034 ships first, GP names/traits vary per round, which this feature displays as-is.
- restartLeague deletes all GPs, so the palmares empties on restart — acceptable and consistent with the rest of the app.
- All new copy goes through the EN/FR catalogs; the repo convention is no hardcoded user-facing strings.

# Acceptance criteria
- AC1: When the GP is ready to resolve, the launch confirmation shows the starting grid: positions P1..Pn ordered by the server's qualifying rule, each row with team livery, name, and best qualifying time (or a no-qualifying label), the player's row highlighted, plus the GP's circuit name, traits, and forecast.
- AC2: The client grid order matches the server's buildParticipants ranking for the same inputs, proven by a unit test that mirrors the comparator including the no-time fallback.
- AC3: A shared helper computes a season's final standings from grandPrixHistory (points summed per team for that season's resolved GPs) and is unit-tested with a multi-season fixture, including a season with a defaulted/missing result entry.
- AC4: When the app detects a season rollover for a league, a season-recap modal shows the champion, the podium, the full final standings with the player's row highlighted, and the season number; it appears once per ended season per league (localStorage guard) and can be reopened from the palmares.
- AC5: The Championship view gains a palmares: one line per completed season (season number, champion name and livery, GP count), derived from the same helper, visible without opening any modal.
- AC6: The GP history is grouped by season with the most recent season expanded and older seasons collapsed; each season header shows the summary line and each entry keeps its current content and interactions (including history replay).
- AC7: All new labels exist in EN and FR with identical key sets; no hardcoded user-facing copy.
- AC8: Unit tests cover the grid helper, the season-standings helper, and the rollover detection; existing App tests still pass.
- AC9: Typecheck, lint, unit tests, build, and e2e all pass; the 3-GP e2e loop is extended or complemented to assert the grid recap appears before launch.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_008_race_ceremony_and_season_narrative_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- apps/web/src/app/App.tsx
- apps/web/src/app/types.ts
- apps/web/src/app/helpers.ts
- apps/web/src/features/ChampionshipView.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/api/src/features/leagues/store.ts
- Player feedback (2026-07-15): before launching the race there is no recap of the starting line; at the end of a season there is no recap of who won and the final standings; in the GP history the old GPs are visible but the season history is hard to see.
- Code facts verified 2026-07-15: the starting grid is client-computable — the server ranks participants by best qualifying time with team-order fallback (buildParticipants -> standingsRank in apps/api/src/features/leagues/store.ts:863-873) and the web already holds qualifyingRuns plus a sorted qualifying leaderboard in App.tsx. Season rollover RESETS team points to zero with no snapshot (store.ts:758-760), so the season champion is recorded nowhere; however grandPrixHistory keeps every GP result with per-GP points per team, so any season's final standings are recomputable by summing classification points for that season's GPs.

# AI Context
- Summary: Starting grid modal and season narrative
- Keywords: request-chain-scaffold, starting grid modal and season narrative, development-ready
- Use when: You need to implement or review the scaffolded workflow for Starting grid modal and season narrative.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_062_show_the_starting_grid_in_the_race_launch_confirmation`
- `item_063_derive_season_standings_and_celebrate_the_champion`
- `item_064_group_the_gp_history_by_season`
