## item_326_close_the_beta_accessibility_gate_without_redesigning_the_app - Close the beta accessibility gate without redesigning the app
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
