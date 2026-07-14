## task_033_orchestrate_race_cockpit_redesign_v0 - Orchestrate race cockpit redesign V0
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 96
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read the current app layout, CSS, i18n catalogs, roadmap, product brief, and existing playtest notes before editing UI.
- [x] 2. Define the cockpit information architecture and visual direction before changing components.
- [x] 3. Refactor only the surfaces needed for the redesign, keeping state and API behavior stable.
- [x] 4. Implement the cockpit, championship, garage, result, and replay presentation changes with EN/FR catalog coverage.
- [x] 5. Run unit, typecheck, lint, build, e2e, i18n, Logics validation, and desktop/mobile visual QA.
- [x] 6. Update playtest docs and close the Logics chain with concrete proof.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Execution direction
- Start with `item_040` and `item_041`: lock the screen model and CSS vocabulary before changing JSX structure.
- Use the V2 mockup direction as the visual baseline; do not implement the earlier coarse/blocky mockup as-is.
- Treat real European city circuits as the intended map direction. Keep V0 cheap with stored/static route geometry rendered as a stylized SVG route over a dark basemap (Carto `dark_nolabels` raster tiles with "© OpenStreetMap · © CARTO" attribution). Light osm.org tiles are explicitly out — they clash with the cockpit theme and violate the OSM tile usage policy. Defer live Leaflet/OSRM runtime integration unless a static route catalog is proven insufficient.
- Seed the first catalog with six circuits only: Paris Docklands Sprint/Left Bank Loop, Amsterdam Canal Loop/Harbor Sprint, and Berlin Ring Sector/Mitte Dash.
- Treat animated race playback as deterministic replay, not live simulation: generate or derive a timeline from the resolved result, then animate cars over the city circuit route.
- Then implement the primary loop through `item_042`, because Course and the dominant action define whether the redesign works.
- Implement `item_043` and `item_044` as support/payoff surfaces after the race desk is coherent.
- Keep `item_045` active throughout the UI work; every new visible label must land in EN and FR catalogs in the same wave as the component change.
- Use `item_046` to reduce `App.tsx` only where extraction helps the redesign. Do not create a generic design system.
- Finish with `item_047` visual QA and playtest prompts before closeout. A passing build without screenshots is not enough for this request.

# Backlog
- `item_040_define_the_cockpit_information_architecture`
- `item_041_establish_visual_direction_and_css_foundations`
- `item_042_rebuild_the_race_desk_around_one_clear_action`
- `item_043_redesign_championship_and_garage_as_supporting_panels`
- `item_044_make_result_and_replay_presentation_unambiguous`
- `item_045_audit_and_harden_i18n_for_redesigned_surfaces`
- `item_046_split_the_web_cockpit_into_practical_components`
- `item_047_validate_the_redesigned_cockpit_with_screenshots_and_playtest_prompts`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: the app is organized into conditional React views (Race with map + directive panel, Championship, Garage, Replay, Report) instead of one undifferentiated stack; see `apps/web/src/features/` and wave 2/3 reports.
- request-AC2 -> This task. Proof: single dark cockpit visual direction implemented and documented — role-named CSS variables in `apps/web/src/styles/tokens.css`, panel/chip/state vocabulary in `layout.css` (~700 lines, no design-system dependency), racing motifs via the stylized circuit map over a dark basemap.
- request-AC3 -> This task. Proof: a persistent command bar exposes exactly one primary action per state (prepare/ready/resolved) with a labeled state chip, on desktop and mobile; the briefing modal keeps GP status and next action reachable from the same bar.
- request-AC4 -> This task. Proof: Report view separates final classification, race recap, and written report; Replay view separates the animated circuit replay, weather phases, and key moments; each surface has its own labeled panel.
- request-AC5 -> This task. Proof: all redesigned surfaces read from the EN/FR catalogs; `fr.json` was rewritten with correct diacritics; `logics-manager i18n validate` passes and the unit suite asserts localized copy in both languages.
- request-AC6 -> This task. Proof: `App.tsx` was split into domain components (`CircuitMap`, `DirectivePanel`, `ChampionshipView`, `GarageView`, `ReplayView`, `ReportView`) plus `app/helpers.ts`, `app/circuits.ts`, `app/types.ts` — no new dependencies.
- request-AC7 -> This task. Proof: desktop (1440px) and mobile (390px) screenshots captured for setup and every view before/after GP resolution during wave 2/3 visual QA; no overlapping or clipped content observed (previous overlap bugs eliminated structurally by conditional views).
- request-AC8 -> This task. Proof: the 3-GP e2e loop (`tests/e2e/private-league.spec.ts`) passes after the redesign, alongside typecheck, unit tests (21), lint, build, and i18n validation.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- npm run typecheck passed; npm test passed (21 tests); npm run lint passed; npm run build passed; npm run test:e2e passed (3-GP loop); logics-manager i18n validate passed; npm run logics:validate passed; desktop 1440px and mobile 390px screenshots captured for all views before/after GP resolution with no overlap on 2026-07-14.
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- 2026-07-14 wave 3 (operator UX feedback):
  - Merged the Course and Directive views: the race view now shows the circuit map with the directive panel beside it (stacked on mobile), since the directive decision needs the track/weather context. League controls (cadence, deadline, forget team) moved to the Championship view next to restart. Nav is 5 tabs.
  - The next-action briefing moved into a modal opened from an info button placed before the primary command in the command bar; the race view is map-first.
- 2026-07-14 wave 2 (corrective — screen model and visual direction realignment):
  - Root cause of the reported overlapping/broken screens: the previous wave kept every panel mounted in one DOM tree and simulated the six cockpit views with ~500 lines of absolute-positioned, `data-game-view`-scoped CSS. Panels collided at intermediate viewports; on mobile the replay and report views were fully covered by sibling panels.
  - Replaced the CSS view-toggle model with real conditional React views (`item_040`, `item_046`): `App.tsx` now owns state/API/shell only, and `features/` holds `DriveView`, `DirectiveView`, `ChampionshipView`, `GarageView`, `ReplayView`, `ReportView` plus a shared `CircuitMap`. One view mounted at a time; overlap is structurally impossible.
  - Rewrote `layout.css` from scratch (1627 → ~700 lines): the stacked light theme + "Cockpit 0.3 visual pass" duplication is gone; a single dark cockpit theme remains, with one accent (success green) and telemetry cyan (`item_041`).
  - Replaced light osm.org raster tiles with a dark city basemap (Carto `dark_nolabels`, attribution "© OpenStreetMap · © CARTO" shown on the map) under the stylized SVG route — the on-theme version of the "city extraction" `item_041` mandated ("not a raw Leaflet/OSM map"). The six-circuit static catalog moved to `app/circuits.ts`.
  - Kept one-state-one-command via a persistent bottom command bar (`item_042`); replay cars are evenly spaced along the route and only animate in the replay view (`item_044`).
  - Localized event lines are now built from `RaceEvent.teamId` + the result classification instead of parsing `replayText` strings — fixes duplicated sentences like "hits a late mechanical scare hits a mechanical scare" (`item_044`).
  - i18n (`item_045`): rewrote `fr.json` with proper accents/diacritics across all 205 keys, added `team_player` for non-local human teams (standings previously labeled every human "you"), fixed `language_fr` to "Français".
  - Validation: `npm run typecheck`, `npm test` (21 passed), `npm run lint`, `npm run build`, `npm run test:e2e` (1 passed), `logics-manager i18n validate` all green. Desktop (1440px) and mobile (390px) screenshots captured for setup + all six views, before and after GP resolution (`item_047`); no overlap or clipped content observed.
  - Unit and e2e tests were adapted to the navigation model (views are visited via the nav instead of asserting all panels at once); API behavior and state flow are unchanged.
- 2026-07-14 wave:
  - Implemented the Pit Wall Compact shell in the web app using the existing React/CSS/i18n setup.
  - Added one-state-one-command behavior for the race desk: prepare submits, ready launches, resolved advances.
  - Kept championship and garage as supporting panels while the race desk owns the first viewport.
  - Expanded the replay/result surface with a larger city route map, moving cars, replay controls, localized callouts, and localized report blocks.
  - Added EN/FR catalog coverage for shell navigation, command hints, GP statuses, report headings, and event summaries.
  - Captured desktop and mobile screenshots in `~/Desktop/CRL/crl-cockpit-*-briefing.png` and `~/Desktop/CRL/crl-cockpit-*-replay.png`.
- Remaining before closeout:
  - Run the full validation suite after the Logics docs are refreshed.
  - Decide whether the current animated replay is enough for 0.3, or whether the next slice should add a real sampled replay timeline/scrubber.
  - Keep full external playtest feedback for a later wave; this pass only performed local browser visual QA.
- Finished on 2026-07-14.
- Linked backlog item(s): `item_040_define_the_cockpit_information_architecture`, `item_041_establish_visual_direction_and_css_foundations`, `item_042_rebuild_the_race_desk_around_one_clear_action`, `item_043_redesign_championship_and_garage_as_supporting_panels`, `item_044_make_result_and_replay_presentation_unambiguous`, `item_045_audit_and_harden_i18n_for_redesigned_surfaces`, `item_046_split_the_web_cockpit_into_practical_components`, `item_047_validate_the_redesigned_cockpit_with_screenshots_and_playtest_prompts`
- Related request(s): `req_032_redesign_the_cr_league_race_cockpit_v0`

# AI Context
- Summary: Orchestrate race cockpit redesign V0
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
