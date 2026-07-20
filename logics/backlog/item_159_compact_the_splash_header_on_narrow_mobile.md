## item_159_compact_the_splash_header_on_narrow_mobile - Compact the splash header on narrow mobile
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Post-splash first-contact polish
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Manual mobile playtest shows the splash works at 390px, but the top header is crowded because the brand, Language label, and two locale buttons all compete in one row.
- Product desktop review shows the splash background is enlarged too much by full-viewport cover; it should keep the artwork fit to height and blend any side fill with the page background.
- The header should stay Profile-style, but the splash can apply scoped responsive rules so the first viewport feels intentional on phone screens.

# Scope
- In:
  - Add splash-scoped responsive CSS for the SetupTopbar/LanguageSwitcher at narrow widths.
  - Adjust the desktop splash background framing so the image fits by viewport height instead of over-zooming, with side/background fill blended into the image.
  - Prefer hiding or compacting nonessential label text before changing component structure.
  - Keep desktop header appearance consistent with the existing Profile/setup header.
  - Add or extend e2e assertions for 360px/390px no overflow, visible language controls, and desktop background framing.
- Out:
  - Changing ProfileMenu or game topbar behavior.
  - Adding a new header component or duplicating SetupTopbar markup.
  - Changing splash artwork, title placement, or PRESS START behavior unless needed to avoid overlap.
  - Regenerating home-background.jpg or adding a second desktop asset.

# Acceptance criteria
- AC1: At 360px and 390px, the splash header controls remain visible, unclipped, and free of horizontal scroll.
- AC2: Desktop still matches the setup/profile header language-switching pattern.
- AC3: On desktop, the background artwork is fit by height without excessive zoom, and any side fill blends with the image rather than reading as blank letterbox.
- AC6: The splash e2e path still validates root display, mobile fit, language controls, desktop background framing, and PRESS START entry.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: At 360px and 390px, the splash header controls remain visible, unclipped, and free of horizontal scroll.
- request-AC2 -> This backlog slice. Proof: AC2: Desktop still matches the setup/profile header language-switching pattern.
- request-AC3 -> This backlog slice. Proof: AC3: On desktop, the background artwork is fit by height without excessive zoom, and any side fill blends with the image rather than reading as blank letterbox.
- request-AC6 -> This backlog slice. Proof: AC6: The splash e2e path still validates root display, mobile fit, language controls, desktop background framing, and PRESS START entry.
- request-AC7 -> This backlog slice. Proof: AC6: The splash e2e path still validates root display, mobile fit, language controls, desktop background framing, and PRESS START entry.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_030_post_splash_playtest_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_066_post_splash_playtest_polish_mobile_header_and_root_shell_cleanup`
- Primary task(s): `task_067_orchestrate_post_splash_playtest_polish`

# AI Context
- Summary: Compact the splash header on narrow mobile
- Keywords: scaffolded-backlog, compact the splash header on narrow mobile, implementation-ready
- Use when: Implementing the scaffolded slice for Compact the splash header on narrow mobile.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
