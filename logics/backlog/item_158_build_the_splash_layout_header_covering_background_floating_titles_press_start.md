## item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start - Build the splash layout: header, covering background, floating titles, PRESS START
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Home splash and brand first-contact
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The splash needs a Profile-style header, a background that fits desktop and mobile, floating title art, and a themed PRESS START, using existing components/tokens and the already-prepared assets.

# Scope
- In:
  - Compose the header from SetupTopbar + LanguageSwitcher (brand left, language right) so it matches Profile.
  - Render home-background.jpg centered with cover so it fits both orientations without distortion or horizontal page scroll.
  - Overlay home-title-cr.png and home-title-league.png with independent, gentle float keyframes disabled under prefers-reduced-motion.
  - Style PRESS START from the existing orange pit-wall theme tokens; add en/fr i18n keys for its label and any aria text.
- Out:
  - Regenerating or re-detouring the home-* assets.
  - A new button/design-token system or animation library.

# Acceptance criteria
- AC1: Header, covering background, and overlaid titles render correctly on desktop and mobile.
- AC2: Titles float subtly and stop under prefers-reduced-motion.
- AC5: Language switches from the splash and carries into the app.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Header, covering background, and overlaid titles render correctly on desktop and mobile.
- request-AC2 -> This backlog slice. Proof: AC2: Titles float subtly and stop under prefers-reduced-motion.
- request-AC3 -> This backlog slice. Proof: AC5: Language switches from the splash and carries into the app.
- request-AC5 -> This backlog slice. Proof: AC5: Language switches from the splash and carries into the app.
- request-AC6 -> This backlog slice. Proof: AC5: Language switches from the splash and carries into the app.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_029_home_splash_landing_screen_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_065_home_splash_landing_screen_with_floating_title_and_press_start`
- Primary task(s): `task_066_orchestrate_the_home_splash_landing_screen`

# AI Context
- Summary: Build the splash layout: header, covering background, floating titles, PRESS START
- Keywords: scaffolded-backlog, build the splash layout: header, covering background, floating titles, press start, implementation-ready
- Use when: Implementing the scaffolded slice for Build the splash layout: header, covering background, floating titles, PRESS START.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
