## req_007_define_cr_league_device_targets_and_responsive_ux - Define CR League device targets and responsive UX
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: UX strategy
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Define CR League's device targets before UI scaffolding begins.
- Clarify how mobile and desktop should differ in UX while remaining one PWA product.
- Ensure the first vertical slice treats mobile as the casual primary surface and desktop as an enhanced management/analysis surface.
- Capture responsive constraints for replay, report, briefing, preparation, standings, inventory, and league creation.

# Context
- The architecture decision selects a Vite React PWA, but device targets were only implicit.
- The game needs fast casual sessions, likely on mobile, and richer league/replay views, likely on desktop.
- The user expects both desktop and mobile, potentially with different UI layouts if that improves player experience.

# Acceptance criteria
- AC1: A device targets and responsive UX spec exists.
- AC2: The spec defines mobile and desktop roles.
- AC3: The spec defines responsive behavior for key screens in the vertical slice.
- AC4: The spec defines V1 non-goals, including no separate native apps and no separate codebases.
- AC5: Logics validation passes.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `prod_001_cr_league_product_brief`
- `spec_003_mvp_vertical_slice`
- `spec_004_race_report_and_replay_ux`
- `spec_012_frontend_vertical_slice_flow`
- `adr_001_cr_league_v1_static_pwa_api_architecture`

# AI Context
- Summary: Draft a bounded request for define cr league device targets and responsive ux.
- Keywords: responsive-ux, mobile, desktop, pwa, device-targets, frontend-flow
- Use when: Designing or implementing CR League UI screens and replay/report layouts.
- Skip when: Working on backend-only behavior with no UI surface.

# Backlog
- `item_013_define_cr_league_device_targets_and_responsive_ux`
