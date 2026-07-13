## req_012_align_scaffold_with_cr_league_engineering_adrs - Align scaffold with CR League engineering ADRs
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Implementation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Align the existing Wave 1 scaffold with the engineering ADRs before feature implementation starts.
- Introduce the intended code organization shape for web and API without adding gameplay.
- Split the current web styling into token/base/layout files.
- Move the API health endpoint into a feature module so `app.ts` does not become a route dumping ground.
- Keep future work visible: simulation, full i18n, database model, and gameplay UI remain later waves.

# Context
- `adr_003_code_organization` defines feature-oriented organization and discourages god files.
- `adr_005_theme_design_system` defines CSS token/base/layout direction.
- `adr_007_i18n` defines a future i18n structure, but full i18n implementation is not part of this task.
- `spec_016_implementation_roadmap` says the next major wave is pure simulation.

# Acceptance criteria
- AC1: API health route is isolated under a feature module.
- AC2: Web app shell is moved under `apps/web/src/app`.
- AC3: Web CSS is split into `styles/tokens.css`, `styles/base.css`, and `styles/layout.css`.
- AC4: Placeholder directories or files make the intended web/API organization visible without adding unused abstractions.
- AC5: Future waves remain documented as out of scope.
- AC6: Validation passes.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `adr_003_code_organization`
- `adr_005_theme_design_system`
- `adr_007_i18n`
- `spec_016_implementation_roadmap`

# AI Context
- Summary: Draft a bounded request for align scaffold with cr league engineering adrs.
- Keywords: scaffold, code-organization, css-tokens, health-route, wave-1-1
- Use when: Reviewing the scaffold organization before simulation work.
- Skip when: Implementing gameplay, DB persistence, or simulation.

# Backlog
- `item_018_align_scaffold_with_cr_league_engineering_adrs`
