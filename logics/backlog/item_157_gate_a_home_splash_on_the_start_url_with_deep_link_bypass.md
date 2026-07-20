## item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass - Gate a home splash on the start URL with deep-link bypass
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
- The app opens straight into the game; there is no branded front door, and one must exist only when entering at the root URL without intercepting shared deep links.
- The root render path is being concurrently decomposed by Codex, so the gate must be additive and thin.

# Scope
- In:
  - Add an in-memory 'entered' gate around the app root render that shows the splash only when the initial location.pathname is the root, and bypasses it for any inner route, deriving the decision from a single source aligned with parseAppRoute.
  - PRESS START flips the flag and lands on the same default screen '/' renders today; no persistence.
  - A render/interaction test covering show-at-root, bypass-at-deep-link, and dismiss-on-PRESS-START.
- Out:
  - Persisting a seen-splash flag or adding a routing library.
  - Restructuring App.tsx beyond a thin additive wrapper.

# Acceptance criteria
- AC1: Splash shows at the root URL; AC3: PRESS START lands on today's default screen unchanged.
- AC4: Any inner initial route bypasses the splash.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Splash shows at the root URL; AC3: PRESS START lands on today's default screen unchanged.
- request-AC3 -> This backlog slice. Proof: AC4: Any inner initial route bypasses the splash.
- request-AC4 -> This backlog slice. Proof: AC4: Any inner initial route bypasses the splash.
- request-AC6 -> This backlog slice. Proof: AC4: Any inner initial route bypasses the splash.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_029_home_splash_landing_screen_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_065_home_splash_landing_screen_with_floating_title_and_press_start`
- Primary task(s): `task_066_orchestrate_the_home_splash_landing_screen`

# AI Context
- Summary: Gate a home splash on the start URL with deep-link bypass
- Keywords: scaffolded-backlog, gate a home splash on the start url with deep-link bypass, implementation-ready
- Use when: Implementing the scaffolded slice for Gate a home splash on the start URL with deep-link bypass.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
