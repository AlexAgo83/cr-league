## req_042_adopt_the_pit_wall_visual_identity_across_the_web_app - Adopt the Pit Wall visual identity across the web app
> From version: 0.3.5
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Visual identity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Replace the current generic dashboard palette (blue-slate #0b0f14 ground, emerald #16c784 accent, cyan #38bdf8 telemetry) with the Pit Wall palette: warm asphalt ground, chalk text, one signal-orange accent, and semantic-only green (locked/valid) and blue (rain/weather).
- Introduce a real typographic identity: Barlow Condensed (italic caps) for display, headings, labels, and tabular race numerals; Barlow for running text; both self-hosted with an open license, no CDN request at runtime.
- Replace the rounded-card shape language with the Pit Wall shape language: chamfered corners on panels, team-color side spines, chevron cues on primary actions.
- Split the UI into two materials: dark asphalt for live surfaces (map, race cockpit, telemetry) and light chalk-paper for document surfaces (standings, race reports, garage sheets).
- Recolor the circuit route on the map from green to dashed signal orange while keeping the OSM dark basemap as the scene background.
- Keep the refactor CSS-first: tokens.css rework plus targeted layout.css retouches; component structure, i18n flow, and game logic stay untouched.

# Context
- `tokens.css` currently defines the whole theme: blue-slate surfaces, `--color-accent: #16c784`, `--color-telemetry: #38bdf8`, `--radius: 10px`, and an Inter-first font stack that is never actually loaded (system fallback renders today).
- `layout.css` (~60 KB) holds all component styling in plain CSS with ~77 `border-radius` usages; there is no CSS-in-JS and no utility framework, so the identity swap is mostly a token and selector pass.
- The circuit route is drawn by `CircuitMap.tsx` through CSS classes (`circuit-route-glow`, `circuit-route-asphalt`, `circuit-route-edge`, `circuit-route-accent`, `circuit-start-line`), so the route recolor is CSS-only.
- Team livery colors are player-chosen and rendered via CSS variables (`--livery-primary`/`--livery-secondary`); default fallbacks currently reuse the accent colors #16c784/#38bdf8.
- The approved pitch defines the token set: asphalt #121014 page, carbon #1B181D panels, chalk #F1EDE4 text, signal #FF4D00 accent, paper #ECE7DA document ground, ink #17151A document text, semantic green #3ECF6E and wet-blue #5AA7FF.
- The signal-orange accent must never be assignable to a team livery so the accent keeps meaning; livery pickers stay free otherwise.
- `apps/web/index.html` has `theme-color` #111827 which should follow the new asphalt ground.

# Acceptance criteria
- AC1: tokens.css exposes the Pit Wall palette (asphalt page, carbon surfaces, chalk text, signal #FF4D00 accent, paper + ink document tokens, semantic green and wet-blue) and no UI element still renders the old emerald #16c784 or cyan #38bdf8 as a theme color (livery data values excluded).
- AC2: Barlow and Barlow Condensed are self-hosted (npm package or local woff2, OFL license), applied via tokens (`--font-display`, `--font-sans`), and no runtime request goes to a font CDN.
- AC3: Headings, navigation tabs, section labels, and race numerals render in Barlow Condensed with the pitch treatment (italic caps display, spaced caps labels, tabular numerals for times and points); running text renders in Barlow.
- AC4: Panels use chamfered corners instead of rounded corners on the main surfaces (hero, cockpit panels, modals, buttons); primary action buttons use the signal accent with chevron affordance.
- AC5: The circuit route renders as a dashed signal-orange line over the dark basemap in briefing, replay, and ambient background variants; cars and liveries remain legible.
- AC6: Championship standings, race report, and garage sheet surfaces render on the chalk-paper material with ink text while live surfaces stay on asphalt.
- AC7: Green appears only for locked/valid states and blue only for weather/rain information.
- AC8: Component structure is unchanged: no TSX restructuring beyond className/style-value touch-ups, i18n catalogs untouched except if a label case change requires it.
- AC9: `npm run typecheck`, `npm test`, and `npm run build` pass; existing Playwright e2e still passes.
- AC10: Accessibility holds: text/background contrast on both materials meets WCAG AA for body text, and focus states remain visible on the new surfaces.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_013_pit_wall_visual_identity_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- apps/web/index.html
- apps/web/src/styles/tokens.css
- apps/web/src/styles/base.css
- apps/web/src/styles/layout.css
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/ChampionshipView.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/ReportView.tsx
- apps/web/src/app/App.tsx
- Approved art direction pitch (visual reference): https://claude.ai/code/artifact/a8e7df23-a69b-46ad-ad84-26fdab20a9f3
- User request: replace the generic dark-SaaS look (Inter stack, blue-slate surfaces, emerald/cyan accents, rounded cards) with the approved Pit Wall identity: warm asphalt ground, chalk-white text, single signal-orange accent #FF4D00, chalk-paper material for document screens, self-hosted Barlow / Barlow Condensed type, chamfered corners, orange dashed circuit route. CSS-first refactor: rework tokens.css and retouch layout.css without changing component structure.

# AI Context
- Summary: Adopt the Pit Wall visual identity across the web app
- Keywords: request-chain-scaffold, adopt the pit wall visual identity across the web app, development-ready
- Use when: You need to implement or review the scaffolded workflow for Adopt the Pit Wall visual identity across the web app.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_085_pit_wall_foundation_tokens_self_hosted_type_chamfer_utility`
- `item_086_asphalt_pass_live_surfaces_cockpit_buttons_circuit_route`
- `item_087_chalk_paper_pass_standings_race_report_garage_sheets`
