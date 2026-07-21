## req_071_modularize_the_large_web_layout_stylesheet - Modularize the large web layout stylesheet
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Medium
> Theme: Frontend maintainability and CSS payload
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the web stylesheet easier to maintain by extracting large feature sections into focused files.
- Avoid risky visual churn: this is a mechanical organization pass, not a redesign.
- Keep global tokens, resets, shell layout, and shared component primitives in a predictable base stylesheet.
- Enable future view-level CSS loading once view code-splitting is in place, without forcing that work into this task.

# Context
- The current CSS is plain CSS imported by the Vite web app.
- Many UI changes have accumulated in layout.css, making unrelated panels and views easy to disturb.
- The first pass should prioritize maintainability and low-risk extraction; runtime CSS payload gains may require follow-up dynamic CSS loading.
- No CSS-in-JS or component styling dependency should be introduced.

# Acceptance criteria
- AC1: layout.css is reduced by moving at least three clearly bounded feature sections into dedicated CSS files.
- AC2: Shared variables, reset/base rules, shell layout, buttons, panels, and modal primitives remain available to all views.
- AC3: The extracted CSS preserves visual behavior for map, garage, championship, report, replay, setup, and modals.
- AC4: The build CSS output remains equivalent or smaller, with no duplicate imports of the same feature file.
- AC5: Typecheck, lint, unit tests, build, and representative e2e screenshots or flows pass.

# AC Traceability
- AC1 -> `item_169_extract_feature_css_from_layout_css`. Proof: `layout.css` moved from 8214 to 4277 lines with bounded extracts for championship, garage, report/replay, responsive, pit-wall, paper material, directive telemetry, and plan steps.
- AC2 -> `item_169_extract_feature_css_from_layout_css`. Proof: shared variables, reset/base rules, shell layout, buttons, panels, and modal primitives remain in `tokens.css`, `base.css`, and `layout.css`.
- AC3 -> `item_169_extract_feature_css_from_layout_css`. Proof: CSS reconstruction matches the previous monolithic stylesheet with whitespace normalized, and Playwright flows covering map, garage, championship, report, replay, setup, and modals passed.
- AC4 -> `item_169_extract_feature_css_from_layout_css`. Proof: extracted CSS files are imported once in `main.tsx`; production CSS remained `141.35 kB` / `25.10 kB gzip`.
- AC5 -> `item_169_extract_feature_css_from_layout_css`. Proof: typecheck, lint, unit tests, build, and e2e passed after extraction.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_035_web_stylesheet_modularization_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/styles/layout.css
- apps/web/src/app/App.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/ChampionshipView.tsx
- apps/web/src/features/ReportView.tsx
- apps/web/src/features/ReplayView.tsx
- Current diagnostic: apps/web/src/styles/layout.css is about 8,092 lines and the production CSS bundle is about 140 kB uncompressed / 25 kB gzip.
- Current diagnostic: layout.css contains global shell, map, garage, championship, report, setup, modal, and replay styling in one file.

# AI Context
- Summary: Modularize the large web layout stylesheet
- Keywords: request-chain-scaffold, modularize the large web layout stylesheet, development-ready
- Use when: You need to implement or review the scaffolded workflow for Modularize the large web layout stylesheet.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_169_extract_feature_css_from_layout_css`
