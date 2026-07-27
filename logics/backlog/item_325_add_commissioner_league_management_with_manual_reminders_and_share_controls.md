## item_325_add_commissioner_league_management_with_manual_reminders_and_share_controls - Add commissioner league management with manual reminders and share controls
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: League management
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A private beta league needs one clear owner surface for running the league.
- The league creator needs to see who is blocking the next Grand Prix and manually remind only those players.
- Invite sharing belongs with league management rather than hidden in support docs.

# Scope
- In:
  - Add or extend the creator-only league management screen.
  - Show player readiness, plan submitted/pending state, current GP status, invite code/link, and share-copy affordance.
  - Add a manual admin-triggered reminder action for players who have not submitted their plan.
  - Keep reminder sending auditable and neutral: no automatic scheduler, no repeated background sends, and clear result feedback to the commissioner.
- Out:
  - Automatic reminder schedules.
  - Bulk marketing emails.
  - Changing the profile recovery email flow beyond reuse of the existing mailer boundary.
  - Full auth or role-management redesign.

# Acceptance criteria
- AC1: Only the league creator can access the commissioner controls.
- AC2: The screen names every pending player and submitted player for the current GP.
- AC3: The reminder action sends only to pending players with usable profile email data and reports skipped recipients.
- AC4: Invite/share copy works without requiring email delivery.
- AC5: API authorization and web tests cover creator-only access and manual reminder behavior.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Only the league creator can access the commissioner controls.
- request-AC3 -> This backlog slice. Proof: AC2: The screen names every pending player and submitted player for the current GP.
- request-AC13 -> This backlog slice. Proof: AC3: The reminder action sends only to pending players with usable profile email data and reports skipped recipients.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Add commissioner league management with manual reminders and share controls
- Keywords: scaffolded-backlog, add commissioner league management with manual reminders and share controls, implementation-ready
- Use when: Implementing the scaffolded slice for Add commissioner league management with manual reminders and share controls.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
