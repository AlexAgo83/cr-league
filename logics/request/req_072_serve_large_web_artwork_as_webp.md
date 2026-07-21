## req_072_serve_large_web_artwork_as_webp - Serve large web artwork as WebP
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Medium
> Theme: Asset delivery performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Reduce transferred image bytes further by serving WebP versions of the largest remaining PNG artwork.
- Keep visual quality acceptable for hero panels, onboarding panels, report panels, and modal imagery.
- Avoid broad image pipeline work unless it is needed for this small set of assets.
- Keep PNG fallbacks only where the implementation path makes them useful and cheap.

# Context
- Most CRL artwork is served from apps/web/public/assets/crl and referenced directly from CSS background-image rules or React image props.
- Modern target browsers support WebP, and the current Vite public asset flow can serve static .webp files without a new bundler plugin.
- CSS background users can be switched directly to WebP if the project accepts modern browser support.
- React image users can use the existing AssetImage component, potentially extended to support WebP fallback with picture.

# Acceptance criteria
- AC1: WebP variants are generated for the selected largest artwork assets and are smaller than their PNG source at comparable visual quality.
- AC2: CSS and React references load WebP for targeted assets without broken images in production build output.
- AC3: PNG source files remain available only if they are required as fallbacks or source masters; otherwise the choice to remove or keep them is documented.
- AC4: The public/dist asset size decreases compared with the post-PNG-optimization baseline.
- AC5: Build, typecheck, lint, unit tests, and representative visual/e2e checks pass.

# AC Traceability
- AC1 -> `item_170_convert_largest_artwork_assets_to_webp`. Proof: seven selected assets were converted to WebP at `1672x941`, with 74.3%-81.3% smaller files.
- AC2 -> `item_170_convert_largest_artwork_assets_to_webp`. Proof: targeted CSS and React references now point to `.webp`, and the production build includes those WebP files.
- AC3 -> `item_170_convert_largest_artwork_assets_to_webp`. Proof: replaced PNGs were removed from `public`; fallback was not kept because the target browsers support WebP.
- AC4 -> `item_170_convert_largest_artwork_assets_to_webp`. Proof: `apps/web/dist` decreased from 22720 KB to 19264 KB and `apps/web/public/assets/crl` from 19220 KB to 14832 KB.
- AC5 -> `item_170_convert_largest_artwork_assets_to_webp`. Proof: build, typecheck, lint, unit tests, e2e, dimension check, and Logics validation passed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_036_webp_artwork_delivery_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/public/assets/crl
- apps/web/src/features/AssetImage.tsx
- apps/web/src/features/ModalHero.tsx
- apps/web/src/styles/layout.css
- Current diagnostic: web assets were optimized from about 61 MB to about 19 MB, with no source asset above 1 MB remaining.
- Current diagnostic: the largest remaining PNG assets are report-victory.png (~820 KB), onboarding-chrono.png (~708 KB), onboarding-setup.png (~620 KB), onboarding-pit-wall.png (~604 KB), plan-header.png (~600 KB), onboarding-season.png (~536 KB), and garage-empty.png (~500 KB).

# AI Context
- Summary: Serve large web artwork as WebP
- Keywords: request-chain-scaffold, serve large web artwork as webp, development-ready
- Use when: You need to implement or review the scaffolded workflow for Serve large web artwork as WebP.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_170_convert_largest_artwork_assets_to_webp`
