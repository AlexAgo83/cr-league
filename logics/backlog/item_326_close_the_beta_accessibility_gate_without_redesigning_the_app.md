## item_326_close_the_beta_accessibility_gate_without_redesigning_the_app - Close the beta accessibility gate without redesigning the app
> From version: 0.5.2
> Schema version: 1.0
> Status: In Progress
> Understanding: 90%
> Confidence: 85%
> Progress: 85%
> Complexity: Medium
> Theme: Accessibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The alpha UX playthrough passed core flows but still found serious accessibility issues.
- The user wants accessibility fixes without changing the visual language, except contrast where necessary.
- The beta should not ship known unnamed buttons or avoidable mobile tap-target traps.

# Scope
- In:
  - Fix unnamed icon buttons, invalid/prohibited ARIA, missing page heading structure, contrast failures, and small mobile tap targets reported by the UX harness.
  - Preserve layout, art direction, component shapes, and copy hierarchy except where contrast or tap target size requires a local adjustment.
  - Regenerate browser UX evidence after fixes.
- Out:
  - Visual redesign.
  - New theme system.
  - Reworking replay controls or compact replay ideas that the user rejected for now.

# Acceptance criteria
- AC1: UX harness no longer reports critical button-name issues on the beta-critical flow.
- AC2: Contrast fixes pass the automated gate without changing the visual identity broadly.
- AC3: Tap target fixes do not create mobile overflow.
- AC4: Browser UX and cold-start reports are regenerated and linked from the task closeout.

# Implementation Notes
- 2026-07-27: Fixed the browser playtest harness for the new 3/6 GP preset select and made seeded profile emails collision-proof for rapid reruns.
- 2026-07-27: Added axe target details to the UX report so accessibility failures are actionable.
- 2026-07-27: Added accessible names to brand/home buttons and removed prohibited ARIA from decorative country badges.
- 2026-07-27: Added a hidden app-level H1 in the connected game shell.
- 2026-07-27: Fixed contrast issues on plan directive tabs, primary plan actions, race-risk summary, championship pagination/count labels, and report/replay moment text.
- Evidence: `rtk npm run playtest:ux` -> PASS; `reports/ux/browser-playthrough.md` reports `Total axe violation groups: 0`.
- Evidence: `rtk npm run playtest:ux:cold-start` -> PASS; `reports/ux/cold-start-funnel.md` reaches `make first purchase`.

# Remaining Work
- Review mobile small tap-target counts after the next UI pass; current harness reports no body overflow and no critical axe issues, but some compact replay controls remain under 44px.
- Keep the regenerated browser screenshots under `reports/ux/browser-playthrough/` as the visual evidence for this pass.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: UX harness no longer reports critical button-name issues on the beta-critical flow.
- request-AC13 -> This backlog slice. Proof: AC2: Contrast fixes pass the automated gate without changing the visual identity broadly.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Close the beta accessibility gate without redesigning the app
- Keywords: scaffolded-backlog, close the beta accessibility gate without redesigning the app, implementation-ready
- Use when: Implementing the scaffolded slice for Close the beta accessibility gate without redesigning the app.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
