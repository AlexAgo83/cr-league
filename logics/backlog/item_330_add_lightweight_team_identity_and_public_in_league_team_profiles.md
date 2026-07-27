## item_330_add_lightweight_team_identity_and_public_in_league_team_profiles - Add lightweight team identity and public in-league team profiles
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 95
> Progress: 0%
> Complexity: Medium
> Theme: Team identity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Team attachment can improve beta retention without changing the race engine.
- The league needs a public team profile surface that makes each stable recognizable.
- Cosmetic depth should start from existing profile/team data before adding a large customization system.
- Owner decision: this is an in-league team profile, not a public internet profile page; first editable fields are limited to safe existing team name and livery/color support.

# Scope
- In:
  - Add an in-league public team profile view or panel.
  - Open the team profile from standings rows and player/team cards.
  - Show team name, livery/car identity, championship position, current season stats, palmares, recent form, current rival, and preferred/derived style when derivable.
  - Allow only lightweight customization that fits existing data boundaries: team name and livery/color if already supported cleanly.
  - Keep unsafe user content sanitized.
- Out:
  - Large cosmetic inventory.
  - Public internet profile pages outside a league.
  - Image uploads.
  - Free-form long bios.
  - Paid cosmetics.

# Acceptance criteria
- AC1: Every team in a league has an inspectable profile using existing or minimally extended team data.
- AC2: Human-owned team customization remains sanitized and scoped to the league.
- AC3: The profile page exposes season stats and palmares without extra manual entry.
- AC4: The first profile version is visible only inside the league and does not create public internet profile URLs.
- AC5: The first editable profile fields are limited to existing safe team name and livery/color support.
- AC6: The profile is reachable from standings and player/team cards without creating public internet profile URLs.
- AC7: Tests cover profile rendering and unsafe customization input.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: Every team in a league has an inspectable profile using existing or minimally extended team data.
- request-AC13 -> This backlog slice. Proof: AC7: Tests cover profile rendering and unsafe customization input.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Add lightweight team identity and public in-league team profiles
- Keywords: scaffolded-backlog, add lightweight team identity and public in-league team profiles, implementation-ready
- Use when: Implementing the scaffolded slice for Add lightweight team identity and public in-league team profiles.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
