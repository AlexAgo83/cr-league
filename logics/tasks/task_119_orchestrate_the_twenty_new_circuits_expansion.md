## task_119_orchestrate_the_twenty_new_circuits_expansion - Orchestrate the twenty-new-circuits expansion
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 82
> Progress: 82%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex
> Non-semantic edit: 2026-07-26 board icon asset polish journal note; task scope and progress unchanged.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read the canonical-race-track-geometry and speed-profile scaffolds first; this request consumes that pipeline and must not reinvent generation, auditing, or the geometry heuristic.
- [ ] 2. For each of the 20 cities, run scripts/generate-circuit.mjs against OSM, iterating per-city flags until the loop passes auditPoints with zero failures and stays on real roads; write circuitRoutes/circuit_<key>.ts.
- [ ] 3. Add each identity row to CITY_CIRCUIT_IDENTITIES and regenerate canonical geometry and CIRCUIT_SPEED_PROFILES from the routes via generate-circuit-speed-profiles.mjs; choose laps/traits/likelyWeather with intent.
- [ ] 4. Add circuit_<key> display names to en.json and fr.json for all 20 keys.
- [ ] 5. Run audit:circuits, balance:gate, typecheck, test, build, lint, and logics:validate; record proof at closeout.
- [ ] 6. Reject any circuit that cannot be generated cleanly from OSM rather than hand-drawing it; note substitutions if a city yields no valid loop.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_289_generate_and_audit_the_20_real_street_route_files_via_the_osm_pipeline`
- `item_290_author_identity_rows_with_generated_geometry_speed_profiles_and_balanced_dials`
- `item_291_localize_the_new_circuits_and_pass_the_full_catalogue_gates`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- 2026-07-26: first five generated OSM expansion routes imported and validated: Budapest/Danube, Naples/Lungomare, Athens/Plaka, Helsinki/Esplanadi, Edinburgh/Royal Mile.
- Added `scripts/import-generated-circuits.mjs` plus `npm run import:circuits` to automate route-index registration, circuit identity metrics, i18n labels, and speed-profile regeneration for the next waves.
- 2026-07-26: second import wave validated: Valletta/Grand Harbour, Amsterdam/Jordaan, New York/Battery. Added missing MT/US flags and kept the flag-asset catalogue test active.
- 2026-07-26: third import wave validated: Miami/Ocean Drive and Chicago/Lakefront. Buenos Aires/Madero was attempted twice but not imported because Overpass timed out on the requested Puerto Madero bounds.
- 2026-07-26: fourth import wave validated: Mexico City/Reforma, Dubai/Marina, Sydney/Darling Harbour. Singapore/Marina, Hong Kong/Victoria, and Osaka/Dotonbori timed out on default dense OSM bounds; Dubai/Sydney succeeded with `--highways major`.
- 2026-07-26: added cached/bounded wave generation tooling (`generate:circuit-wave`) and validated Singapore/Marina, Hong Kong/Victoria, Osaka/Dotonbori through major-road fallbacks. Buenos Aires/Madero remains rejected after bounded attempts; no unvalidated route is included.
- 2026-07-26: adjacent UI polish while keeping the active wave commit-ready: sliced `logics/external/board_icones.png` plus the follow-up board 2/3/4 sheets into transparent CRL board assets, recropped/recentered the second-wave PNGs, documented the board-icon generation/crop workflow in `docs/board-icon-assets-runbook.md`, wired grip/overtaking/energy/weather/strategy through `VisualIcon`, surfaced larger/dedicated board icons in directive/chrono/GP/map/navigation/modal commands with centered text/icon alignment and icon-only mobile nav, added card-context board icons before Garage inventory/shop card names and tabs, moved Plan card info into a bottom-right `(i)` modal trigger while the cell shows the fit label, and moved Plan choice markers between the asset and label.
- 2026-07-26: imported and manually recropped board 5 into 16 additional transparent command/card assets, then wired missing dedicated icons for championship tabs (Circuits, Classement, Palmares, Historique GP), Garage save-name/save-colors/sell-card actions, Report/review-race buttons, rain-grip/fleet-sponsorship/launch-boost cards, and heavy/mini pit-pack choices.
- 2026-07-26: increased board-icon display sizes across navigation, plan choices, command/modal/map buttons, garage card names, and championship/garage tabs; centered the Chrono history "Review chrono" secondary button with its asset.
- 2026-07-26: tightened board-icon gaps around text/button pairings because the generated PNGs already include transparent padding; expanded circular map actions on desktop/mobile so their assets fill the control better.

# AI Context
- Summary: Orchestrate the twenty-new-circuits expansion
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_118_twenty_new_realistic_city_circuits_generated_through_the_established_osm_pipeline`
- Product brief(s): `prod_070_city_circuit_catalogue_expansion_product_brief`
- Architecture decision(s): (none yet)
