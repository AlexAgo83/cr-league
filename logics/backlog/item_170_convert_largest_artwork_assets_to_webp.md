## item_170_convert_largest_artwork_assets_to_webp - Convert largest artwork assets to WebP
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Asset delivery performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The remaining largest images are compressed PNGs, but hero artwork often compresses better as WebP.
- Several targeted images appear in visually important panels, so aggressive resolution loss is not the right next step.
- Without measuring before/after sizes, conversion could add duplicate assets without improving delivery.

# Scope
- In:
  - Generate WebP variants for the seven largest remaining PNG artwork assets.
  - Compare PNG and WebP sizes and keep only conversions with meaningful savings.
  - Update CSS background-image URLs and React image references for selected assets.
  - If React fallback is needed, extend AssetImage or ModalHero minimally rather than repeating picture markup at call sites.
  - Run a production build and compare apps/web/dist size before and after.
- Out:
  - Adding AVIF unless WebP savings are insufficient and browser support decisions are revisited.
  - Building an automated image optimizer pipeline.
  - Converting every PNG in the repository.

# Acceptance criteria
- AC1: Every converted asset has a recorded PNG-to-WebP size comparison.
- AC2: The application references WebP assets for the chosen targets.
- AC3: No broken image requests occur in representative app flows.
- AC4: Build output is smaller than the current 24 MB dist baseline.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: seven converted assets have recorded PNG-to-WebP size comparisons and preserve `1672x941` dimensions.
- request-AC2 -> This backlog slice. Proof: targeted CSS and React references now use `.webp`.
- request-AC3 -> This backlog slice. Proof: Playwright representative flows passed after the reference update and production build includes the WebP files.
- request-AC4 -> This backlog slice. Proof: `apps/web/dist` decreased from 22720 KB to 19264 KB.
- request-AC5 -> This backlog slice. Proof: build, typecheck, lint, unit tests, and e2e passed.

# Notes
- Replaced PNGs were removed from `apps/web/public/assets/crl` because the modern browser target does not need duplicate fallbacks.
- Public CRL asset directory decreased from 19220 KB to 14832 KB.
- Task `task_073_orchestrate_webp_artwork_conversion` owns closeout validation.
- Task `task_073_orchestrate_webp_artwork_conversion` was finished via `logics-manager flow finish task` on 2026-07-21.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_036_webp_artwork_delivery_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_072_serve_large_web_artwork_as_webp`
- Primary task(s): `task_073_orchestrate_webp_artwork_conversion`

# AI Context
- Summary: Convert largest artwork assets to WebP
- Keywords: scaffolded-backlog, convert largest artwork assets to webp, implementation-ready
- Use when: Implementing the scaffolded slice for Convert largest artwork assets to WebP.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
