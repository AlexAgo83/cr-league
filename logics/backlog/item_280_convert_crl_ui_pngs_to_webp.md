## item_280_convert_crl_ui_pngs_to_webp - Convert crl UI PNGs to WebP
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Low
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- public/assets/crl totals ~14 MB of 250-500 KB PNGs (card/hero art) served via AssetImage.
- Individual Garage/Plan/Championship panels pull 300-500 KB PNGs where WebP would be ~50-80 KB.
- The repo already ships webp for some art, so the encoding path is proven.

# Scope
- In:
  - Convert the crl PNG set to WebP and update the AssetImage references/extensions.
  - Keep AssetImage's existing lazy/async decoding behavior.
  - Spot-check the Garage shop, plan header, and championship screens for visual parity.
- Out:
  - Redesigning any art or layout.
  - Changing AssetImage's loading strategy beyond the file extension.
  - Touching the car sprite assets (separate slice).

# Acceptance criteria
- AC1: The crl art is served as WebP with no visual regression.
- AC2: AssetImage lazy/async behavior is unchanged.
- AC3: Typecheck, lint, and the unit suite stay green.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The crl art is served as WebP with no visual regression.
- request-AC9 -> This backlog slice. Proof: AC2: AssetImage lazy/async behavior is unchanged.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Convert crl UI PNGs to WebP
- Keywords: scaffolded-backlog, convert crl ui pngs to webp, implementation-ready
- Use when: Implementing the scaffolded slice for Convert crl UI PNGs to WebP.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
