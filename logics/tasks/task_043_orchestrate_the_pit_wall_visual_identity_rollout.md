## task_043_orchestrate_the_pit_wall_visual_identity_rollout - Orchestrate the Pit Wall visual identity rollout
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Claude (Fable 5)

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read tokens.css, base.css, layout.css, index.html, CircuitMap.tsx, ChampionshipView.tsx, ReportView.tsx, GarageView.tsx, and the approved pitch reference before touching styles.
- [x] 2. Land the foundation first: Pit Wall tokens, self-hosted Barlow/Barlow Condensed, type roles, chamfer utility; verify the app still builds and renders before any screen pass.
- [x] 3. Run the asphalt pass on live surfaces (topbar, cockpit, plan editor, telemetry, buttons, circuit route recolor) as one reviewable CSS change set.
- [x] 4. Run the chalk-paper pass on document surfaces (standings, report, garage) as a second change set.
- [x] 5. Sweep for leftovers: old hex values, stray border-radius on themed panels, green/blue outside semantic use.
- [x] 6. Capture before/after screenshots of the setup screen, race cockpit, plan editor, championship, and garage as closeout evidence.
- [x] 7. Run typecheck, unit tests, build, and the Playwright e2e suite; record results in the task closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_085_pit_wall_foundation_tokens_self_hosted_type_chamfer_utility`
- `item_086_asphalt_pass_live_surfaces_cockpit_buttons_circuit_route`
- `item_087_chalk_paper_pass_standings_race_report_garage_sheets`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: apps/web/src/styles/tokens.css defines the full Pit Wall token set; grep shows #16c784/#38bdf8 absent from src except player livery data defaults (GarageView.tsx, ReplayView.tsx, App.tsx bot palette).
- request-AC2 -> This task. Proof: @fontsource/barlow + @fontsource/barlow-condensed (OFL) imported in main.tsx, wired via --font-sans/--font-display; build output bundles woff2 locally (dist/assets/barlow-*.woff2), no CDN request.
- request-AC3 -> This task. Proof: base.css type roles (display italic caps on h1-h4, .type-label, .type-chrono); nav tabs, kickers and race numerals use var(--font-display) with tabular-nums; screenshots after-race.png / after-championship.png.
- request-AC4 -> This task. Proof: --chamfer/--chamfer-sm clip-paths applied to hero, panels (paper scope), primary buttons; buttons use signal accent with condensed italic treatment; after-plan.png.
- request-AC5 -> This task. Proof: circuit-route-accent dashed signal orange (stroke var(--color-accent), dasharray 30 44) over dark basemap in briefing, replay and ambient variants; after-race.png.
- request-AC6 -> This task. Proof: chalk-paper scope on .championship-view/.garage-grid/.report-view remaps surface/text tokens to paper+ink; after-championship.png, after-garage.png.
- request-AC7 -> This task. Proof: emerald/cyan tints swept to signal or neutral; green remains only in --color-valid, blue only in --color-wet; trait tones grip=signal, overtaking=chalk, energy=amber.
- request-AC8 -> This task. Proof: zero TSX structural changes (only main.tsx font imports, index.html theme-color, favicon.svg recolor); i18n catalogs untouched.
- request-AC9 -> This task. Proof: npm run typecheck PASS, vitest 65/65 PASS, npm run build PASS, Playwright e2e 2/2 PASS (2026-07-17).
- request-AC10 -> This task. Proof: ink #17151A on paper #ECE7DA ~13.9:1 and chalk #F1EDE4 on asphalt #121014 ~15:1 (AA); focus-visible outlines added on paper surfaces; muted/label contrast checked in screenshots.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- typecheck PASS; vitest 65/65 PASS; build PASS (fonts bundled locally, no CDN); Playwright e2e 2/2 PASS; before/after screenshots in reports/pit-wall-visual-identity/
- Finish workflow executed on 2026-07-17.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-17.
- Linked backlog item(s): `item_085_pit_wall_foundation_tokens_self_hosted_type_chamfer_utility`, `item_086_asphalt_pass_live_surfaces_cockpit_buttons_circuit_route`, `item_087_chalk_paper_pass_standings_race_report_garage_sheets`
- Related request(s): `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`

# AI Context
- Summary: Orchestrate the Pit Wall visual identity rollout
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`
- Product brief(s): `prod_013_pit_wall_visual_identity_product_brief`
- Architecture decision(s): (none yet)
