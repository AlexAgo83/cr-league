## req_066_post_splash_playtest_polish_mobile_header_and_root_shell_cleanup - Post-splash playtest polish: mobile header and root shell cleanup
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 92
> Confidence: 88
> Complexity: Medium
> Theme: Post-splash first-contact polish and root shell hygiene
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the splash header breathe on narrow mobile widths without changing the Profile/setup header contract used elsewhere.
- On desktop, stop forcing the splash background image to cover the full viewport when that over-zooms it; keep the image fit to viewport height and blend the side/background fill into the artwork.
- Keep the newly added root splash wrapper thin, but remove avoidable locale initialization duplication between the splash gate and the game app body.
- Resolve the existing App.tsx React Hooks exhaustive-deps warning in the same root-shell cleanup pass, without changing onboarding behavior.
- Preserve the current passing splash behavior: root URL shows splash, deep links bypass it, language carries through, and PRESS START enters the unchanged default flow.

# Context
- The completed home splash implementation lives in App.tsx and layout.css. It reuses SetupTopbar and LanguageSwitcher, which creates a faithful header but looks crowded on mobile because brand, Language label, and two locale buttons share one row.
- A manual post-splash playtest on 2026-07-20 measured no horizontal scroll on desktop or 390px mobile, confirmed visible PRESS START, confirmed independent title animation names, and confirmed /garage bypasses the splash. This request is polish, not a bugfix for broken flow.
- Product follow-up 2026-07-20: on desktop, the home-background image should not be enlarged to full-screen cover because it scales the artwork too much. Prefer fitting the image by height and using a page background/side blend that visually merges with the image.
- The current App export owns a splash locale state and GameApp owns a second locale state initialized from the same localStorage/browser-locale logic. This duplication is acceptable as a delivery shortcut but is now the obvious next root-shell cleanup.
- ESLint still reports the historical warning in App.tsx for a useEffect missing onboardingStorageKey and openOnboardingHelp dependencies. Fix it only if the behavior remains equivalent and existing onboarding tests keep passing.
- Keep the solution small: no routing library, no persisted splash-seen flag, no broad App.tsx decomposition, no new design system, no animation or layout dependency.

# Acceptance criteria
- AC1: At 360px and 390px widths, the splash header has no horizontal scroll, no clipped controls, and better visual breathing than the current one-row brand + Language label + two language buttons layout.
- AC2: Desktop splash header remains visually consistent with the Profile/setup header and the language switcher still works from the splash.
- AC3: On desktop, the splash background image is fit by height without over-zooming; any exposed side area uses a page background/blend that feels continuous with the image rather than blank letterboxing.
- AC4: Locale initialization is centralized or otherwise de-duplicated so the splash and entered app cannot drift on browser/localStorage locale defaults.
- AC5: The existing React Hooks exhaustive-deps warning in App.tsx is gone, with onboarding behavior preserved by tests.
- AC6: Root splash, deep-link bypass, PRESS START entry, language carry-through, and the existing private-league e2e flow still pass.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_030_post_splash_playtest_polish_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_065_home_splash_landing_screen_with_floating_title_and_press_start.md
- logics/tasks/task_066_orchestrate_the_home_splash_landing_screen.md
- apps/web/src/app/App.tsx
- apps/web/src/app/AppChrome.tsx
- apps/web/src/app/routes.ts
- apps/web/src/styles/layout.css
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- tests/e2e/private-league.spec.ts
- Manual playtest 2026-07-20: splash desktop and mobile are functional with no horizontal scroll, visible PRESS START, active CR/League float animations, and deep-link bypass. Follow-up risks remain: the 390px splash header is visually crowded, the desktop background is over-enlarged by full-viewport cover, and App.tsx now carries both the historical onboarding React Hooks warning and duplicated locale initialization between the splash wrapper and the game body.

# AI Context
- Summary: Post-splash playtest polish: mobile header and root shell cleanup
- Keywords: request-chain-scaffold, post-splash playtest polish: mobile header and root shell cleanup, development-ready
- Use when: You need to implement or review the scaffolded workflow for Post-splash playtest polish: mobile header and root shell cleanup.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_159_compact_the_splash_header_on_narrow_mobile`
- `item_160_clean_up_app_root_locale_ownership_and_hooks_warning`
