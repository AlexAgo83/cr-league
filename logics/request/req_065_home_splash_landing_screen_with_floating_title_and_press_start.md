## req_065_home_splash_landing_screen_with_floating_title_and_press_start - Home splash landing screen with floating title and PRESS START
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Home splash and brand first-contact
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Show a home/landing splash screen when the app is opened at its start URL (root '/'); deep links to any inner route must bypass the splash and render the target screen directly.
- The splash header matches the Profile screen: brand/home control on the left, language switcher on the right, reusing the existing AppChrome components.
- A centered background image covers the viewport cleanly on both desktop (landscape) and mobile (portrait) without distortion or letterboxing.
- Two title assets 'CR' and 'League' are overlaid on the background and animate with a subtle continuous floating motion, respecting prefers-reduced-motion.
- A themed PRESS START button dismisses the splash and enters the app at its default screen, after which the session behaves exactly as if there had been no splash.

# Context
- Assets are already prepared and committed at apps/web/public/assets/crl/: home-background.jpg (162KB, the base scene), home-title-cr.png and home-title-league.png (transparent, background removed, glow preserved). Do NOT regenerate or re-detour these; wire them in as-is. Use AssetImage or plain img as fits the layout.
- Header reuse: AppChrome.tsx already exports SetupTopbar (brand left + actions slot) and LanguageSwitcher (brand-orange language toggle with CountryBadge). The splash header should compose these so it matches the Profile/setup header exactly, with the language switcher on the right.
- Start-URL detection: parseAppRoute (apps/web/src/app/routes.ts) maps '/' to the default 'drive' view and maps '/garage', '/plan/*', '/championship/*', '/admin', '/changelog', '/replay/:id' to inner views. The splash gates on the INITIAL location.pathname being the root ('/' or empty); any deeper initial path bypasses the splash. Decide the exact gate in the task's first step and keep it a single source of truth so it cannot drift from the router.
- Dismissal: PRESS START flips an in-memory 'entered' flag (not persisted) so the splash reappears on the next fresh load of the start URL but never blocks a same-session navigation. Entering must land on the same default screen the app shows today at '/', so downstream behavior (onboarding, SetupGate, profile session) is unchanged.
- Background fit: the source is portrait; use object-fit:cover (or background-size:cover) centered so the car/HUD focal point stays framed on wide desktop and tall mobile alike, with no horizontal page scroll on either.
- Motion: give 'CR' and 'League' independent, gentle float keyframes (small translateY, eased, offset phases so they do not move in lockstep). Wrap in @media (prefers-reduced-motion: reduce) to disable animation. Keep it lightweight CSS, no animation library.
- PRESS START styling should follow the existing orange pit-wall theme tokens (tokens.css) and button conventions already in layout.css, not a new one-off style system.
- Coordination: another agent (Codex) is concurrently decomposing App/UI shell files (App.tsx, AppShell, AppChrome). The splash gate touches the app root render path — introduce it as a thin, additive wrapper around the existing root render rather than restructuring App.tsx, so it rebases cleanly.
- New i18n keys are needed for the PRESS START label (and any splash aria labels); add them to both en.json and fr.json. Brand name/app name already exist (APP_NAME).
- Tests to leave behind: a render/interaction test that the splash shows at initial path '/', that a deep initial path (e.g. '/garage') bypasses it, and that PRESS START dismisses it and reveals the app; prefers-reduced-motion is a CSS concern and does not need a unit test.

# Acceptance criteria
- AC1: Opening the app at the root URL shows the splash with a Profile-style header (brand/home left, language switcher right), a centered background covering the viewport on both desktop and mobile without distortion or horizontal page scroll, and the 'CR' and 'League' titles overlaid.
- AC2: The 'CR' and 'League' titles animate with a subtle, independent floating motion that is disabled under prefers-reduced-motion.
- AC3: A themed PRESS START button (orange pit-wall theme) dismisses the splash and lands on the same default screen the app renders today at '/', with all downstream onboarding/session behavior unchanged.
- AC4: Opening the app directly at any inner route (/garage, /plan/*, /championship/*, /admin, /changelog, /replay/:id) bypasses the splash and renders the target screen immediately.
- AC5: Switching language from the splash header changes the splash copy and carries the choice into the app.
- AC6: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_029_home_splash_landing_screen_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/specs/spec_014_theme_and_brand_inspiration.md
- logics/request/req_042_adopt_the_pit_wall_visual_identity_across_the_web_app.md
- apps/web/src/app/App.tsx
- apps/web/src/app/AppChrome.tsx
- apps/web/src/app/SetupGate.tsx
- apps/web/src/app/routes.ts
- apps/web/src/features/AssetImage.tsx
- apps/web/src/styles/layout.css
- apps/web/src/styles/tokens.css
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/public/assets/crl/home-background.jpg
- apps/web/public/assets/crl/home-title-cr.png
- apps/web/public/assets/crl/home-title-league.png
- New product ask 2026-07-20: add a home/landing splash screen shown when the app is opened at its start URL. It reuses the Profile-style header (brand on the left, language switch on the right), shows a centered background image that fits both desktop and mobile, overlays two title assets 'CR' and 'League' that float with a subtle motion, and offers a themed PRESS START button that enters the game exactly as if the splash did not exist. Reference composite provided by the client: cr_base_fond_exemple_base+titre_03.

# AI Context
- Summary: Home splash landing screen with floating title and PRESS START
- Keywords: request-chain-scaffold, home splash landing screen with floating title and press start, development-ready
- Use when: You need to implement or review the scaffolded workflow for Home splash landing screen with floating title and PRESS START.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass`
- `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`
