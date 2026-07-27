## item_325_add_commissioner_league_management_with_manual_reminders_and_share_controls - Add commissioner league management with manual reminders and share controls
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 96
> Progress: 0%
> Complexity: Medium
> Theme: League management
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A private beta league needs one clear owner surface for running the league.
- The league creator needs to see who is blocking the next Grand Prix and manually remind only those players.
- Invite sharing belongs with league management rather than hidden in support docs.
- To avoid spam and keep the beta behavior predictable, the first reminder implementation should allow at most one reminder send per season.
- Commissioner authority is owner-only for the first pass: the commissioner is the league creator; no transfer, co-admin role, or UI-only authorization.
- Owner UX guardrail: this screen must be polished and game-native, not a generic SaaS admin table. The first UI name is `Direction de course`.

# Scope
- In:
  - Add or extend the creator-only league management screen as `Direction de course`, reachable inside the existing league context via a creator-only tab or button.
  - Present the screen as a CR League control room: current GP state first, readiness lanes or grouped player states next, and compact commissioner actions close to the blocked state they affect.
  - Show player readiness, plan submitted/pending state, current GP status, invite code/link, and share-copy affordance.
  - Show whether resolve is available because all plans are ready, or whether resolve-with-defaults would use visible default plans for absent players.
  - Add a manual admin-triggered reminder action labeled `Relancer les retardataires` for players who have not submitted their plan.
  - Enforce a one-reminder-send-per-season cap server-side for the first implementation: if at least one reminder email is sent, mark the season as reminded; if no email is sent, do not consume the cap.
  - Keep reminder sending auditable and neutral: no automatic scheduler, no repeated background sends, clear result feedback to the commissioner, and minimal audit fields `reminderSentAt`, `reminderSentBy`, `reminderSeasonNumber`, `sentCount`, and `skippedCount`.
- Out:
  - Automatic reminder schedules.
  - Bulk marketing emails.
  - Changing the profile recovery email flow beyond reuse of the existing mailer boundary.
  - Full auth or role-management redesign.
  - A standalone hidden admin route unless the existing navigation pattern requires it.

# Acceptance criteria
- AC1: Only the league creator can access the commissioner controls.
- AC2: `Direction de course` names every pending player and submitted player for the current GP in a polished, game-native management layout rather than a generic table-first admin view.
- AC3: The management screen separates normal resolve, resolve-with-defaults, and unavailable resolve states.
- AC4: The reminder action sends only to pending human players with usable profile email data and reports skipped recipients.
- AC5: A reminder send that delivers at least one email consumes the season cap; a reminder attempt with zero sent emails does not consume it.
- AC6: A second reminder attempt after the cap is consumed sends no email and returns a clear already-sent response.
- AC7: The reminder button uses `Relancer les retardataires`, and the locked state after cap consumption uses `Rappel déjà envoyé cette saison`.
- AC8: Reminder sends persist the minimal audit fields needed to explain who sent the reminder, for which season, and how many recipients were sent or skipped.
- AC9: Invite/share copy works without requiring email delivery.
- AC10: Browser evidence covers the commissioner screen at desktop and mobile widths and confirms the layout remains polished, readable, stacked appropriately on mobile, and consistent with CR League visual language.
- AC11: API authorization and web tests cover creator-only access, pending-player targeting, skipped-recipient behavior, audit fields, and the one-send-per-season reminder cap.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Only the league creator can access the commissioner controls.
- request-AC3 -> This backlog slice. Proof: AC2: The screen names every pending player and submitted player for the current GP.
- request-AC13 -> This backlog slice. Proof: AC10 and AC11 cover browser UX evidence plus API authorization, pending-player targeting, skipped-recipient behavior, audit fields, and the one-send-per-season reminder cap.

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
