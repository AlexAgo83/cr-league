## item_169_extract_feature_css_from_layout_css - Extract feature CSS from layout.css
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: CSS maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- One 8,000-line stylesheet mixes unrelated features, increasing the chance that a small UI edit affects another screen.
- Future code-splitting will be cleaner if feature CSS boundaries already exist.
- A large mechanical extraction can be safe if selectors and import order are preserved carefully.

# Scope
- In:
  - Map layout.css sections by comments and selector groups before moving code.
  - Extract at least garage, championship/history, and report/replay styles into dedicated files.
  - Keep import order deterministic and document any dependency on base tokens or shared component styles.
  - Run visual or e2e checks on affected screens after extraction.
  - Leave a short index/import file if that matches the current app import style.
- Out:
  - Converting styles to CSS modules or scoped component styles.
  - Renaming all selectors.
  - Restyling panels, controls, maps, or typography.

# Acceptance criteria
- AC1: layout.css is materially shorter and feature CSS files are named after the views they style.
- AC2: No selector is unintentionally duplicated or dropped.
- AC3: Build output and representative UI flows remain green.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `layout.css` is materially shorter and view CSS was extracted into `championship.css`, `garage.css`, and `replay-report.css`.
- request-AC2 -> This backlog slice. Proof: shared tokens/base/shell/modal primitives remain in `tokens.css`, `base.css`, and `layout.css`; extracted files are imported after them.
- request-AC3 -> This backlog slice. Proof: CSS reconstruction matched the previous monolithic stylesheet with whitespace normalized, and representative e2e flows passed.
- request-AC4 -> This backlog slice. Proof: each extracted CSS file is imported once in `main.tsx`; production CSS stayed `141.35 kB` / `25.10 kB gzip`.
- request-AC5 -> This backlog slice. Proof: typecheck, lint, unit tests, build, and e2e passed.

# Notes
- Extracted files: `championship.css`, `garage.css`, `replay-report.css`, `responsive.css`, `pit-wall.css`, `paper-material.css`, `directive-telemetry.css`, `plan-steps.css`.
- `layout.css` line count: 8214 before this task, 4277 after extraction.
- Task `task_072_orchestrate_web_stylesheet_modularization` owns closeout validation.
- Task `task_072_orchestrate_web_stylesheet_modularization` was finished via `logics-manager flow finish task` on 2026-07-21.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_035_web_stylesheet_modularization_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_071_modularize_the_large_web_layout_stylesheet`
- Primary task(s): `task_072_orchestrate_web_stylesheet_modularization`

# AI Context
- Summary: Extract feature CSS from layout.css
- Keywords: scaffolded-backlog, extract feature css from layout.css, implementation-ready
- Use when: Implementing the scaffolded slice for Extract feature CSS from layout.css.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
