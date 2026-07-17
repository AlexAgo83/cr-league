## item_087_chalk_paper_pass_standings_race_report_garage_sheets - Chalk-paper pass: standings, race report, garage sheets
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Visual identity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Championship standings, race reports, and the garage all render on the same dark surface as live screens, so the 'team paperwork' fantasy has no material of its own.
- Tables and sheets lack the print-like treatment (ink on chalk, condensed tabular numerals, position plates) defined in the pitch.

# Scope
- In:
  - Restyle ChampionshipView standings and Grand Prix history as chalk-paper sheets: `--color-paper` ground, `--color-ink` text, condensed table headers, tabular numerals, signal-tint row highlight for the player, team-color position plates.
  - Restyle ReportView race reports on the paper material with the same table language.
  - Restyle GarageView as a garage sheet: paper ground for the team/inventory panels while shop actions keep the signal accent.
  - Ensure paper surfaces embed cleanly in the dark shell (chamfered sheet edges, spacing against asphalt).
  - Verify AA contrast for ink-on-paper and highlight rows.
- Out:
  - Any change to standings, report, or garage data and logic.
  - Modals and live overlays already covered by the asphalt pass.
  - New document types.

# Acceptance criteria
- AC1: Standings, race report, and garage sheets render on the chalk-paper material with ink text inside the dark shell.
- AC2: The player's row in standings uses the signal-tint highlight and position plates use team colors, never the signal accent.
- AC3: Points, credits, and lap times in tables render with tabular numerals in the condensed face.
- AC4: Ink-on-paper text meets WCAG AA; focus states are visible on paper surfaces.
- AC5: `npm run typecheck`, `npm test`, `npm run build`, and the Playwright suite pass.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Standings, race report, and garage sheets render on the chalk-paper material with ink text inside the dark shell.
- request-AC7 -> This backlog slice. Proof: AC2: The player's row in standings uses the signal-tint highlight and position plates use team colors, never the signal accent.
- request-AC8 -> This backlog slice. Proof: AC3: Points, credits, and lap times in tables render with tabular numerals in the condensed face.
- request-AC9 -> This backlog slice. Proof: AC4: Ink-on-paper text meets WCAG AA; focus states are visible on paper surfaces.
- request-AC10 -> This backlog slice. Proof: AC5: `npm run typecheck`, `npm test`, `npm run build`, and the Playwright suite pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_013_pit_wall_visual_identity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`
- Primary task(s): `task_043_orchestrate_the_pit_wall_visual_identity_rollout`

# AI Context
- Summary: Chalk-paper pass: standings, race report, garage sheets
- Keywords: scaffolded-backlog, chalk-paper pass: standings, race report, garage sheets, implementation-ready
- Use when: Implementing the scaffolded slice for Chalk-paper pass: standings, race report, garage sheets.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
