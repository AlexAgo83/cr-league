## item_112_lead_onboarding_with_the_league_promise_before_profile_mechanics - Lead onboarding with the league promise before profile mechanics
> From version: 0.3.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 25%
> Complexity: Medium
> Theme: Onboarding
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The first screen is visually clean but asks users to create or recover a profile before they have seen the racing-league promise.
- The current headline is about saving access, which is necessary but not the most compelling first product message.
- The first-session path should feel like starting a league, with profile creation framed as access recovery and continuity.

# Scope
- In:
  - Update the unauthenticated onboarding layout in `App.tsx` so the primary action is starting a league or creating a league profile, with recovery still available as a secondary path.
  - Reframe copy so profile creation is explained as saving the user's racing league and recovery code, not as the main product goal.
  - Keep profile creation and recovery behavior unchanged under the hood.
  - Make the primary CTA visually stronger than the secondary recover action using existing button/card styles.
  - Keep saved/recovered profile and saved-league flows intact after onboarding.
  - Update English and French localization and tests for the new first-screen copy.
- Out:
  - Allowing anonymous leagues without profile/session data.
  - Adding marketing pages, screenshots, or external assets.
  - Changing backend profile APIs.
  - Removing recovery code display.

# Acceptance criteria
- AC1: The first screen headline/value proposition describes starting or running a racing league before discussing profile mechanics.
- AC2: The primary CTA leads into the existing create-profile path and recovery remains clearly available.
- AC3: Recovery code display remains visible after profile creation and is not lost during league creation.
- AC4: Existing tests for language switching, profile creation, recovery, and saved league claims are updated and pass.
- AC5: Desktop and mobile onboarding screenshots show CTA hierarchy clearly.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: The first screen headline/value proposition describes starting or running a racing league before discussing profile mechanics.
- request-AC7 -> This backlog slice. Proof: AC2: The primary CTA leads into the existing create-profile path and recovery remains clearly available.
- request-AC8 -> This backlog slice. Proof: AC3: Recovery code display remains visible after profile creation and is not lost during league creation.
- request-AC9 -> This backlog slice. Proof: AC4: Existing tests for language switching, profile creation, recovery, and saved league claims are updated and pass.
- request-AC10 -> This backlog slice. Proof: AC5: Desktop and mobile onboarding screenshots show CTA hierarchy clearly.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_018_first_session_ux_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_047_polish_first_session_ux_after_playtest_findings`
- Primary task(s): `task_048_orchestrate_first_session_ux_polish_from_playtest_findings`

# AI Context
- Summary: Lead onboarding with the league promise before profile mechanics
- Keywords: scaffolded-backlog, lead onboarding with the league promise before profile mechanics, implementation-ready
- Use when: Implementing the scaffolded slice for Lead onboarding with the league promise before profile mechanics.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
