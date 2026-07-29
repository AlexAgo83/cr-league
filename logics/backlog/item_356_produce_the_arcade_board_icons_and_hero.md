## item_356_produce_the_arcade_board_icons_and_hero - Produce the arcade board icons and hero
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Low
> Theme: Solo modes
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-29 closeout stamps only; status/progress unchanged.

# Problem
- None of the 122 existing board icons reads as arcade, campaign or wheel, so the two new choice cards and the catalogue entry have nothing to show.
- Every choice screen has its own hero backdrop; the arcade catalogue would otherwise borrow the entry screen's and read as the same place.

# Scope
- In:
  - Generate the three icons from the prompt below as one transparent sheet, then follow docs/board-icon-assets-runbook.md: extract cells, convert to 128px WebP, commit only the WebP.
  - Generate the arcade hero from the prompt below and commit it as WebP alongside the other hero panels.
  - Declare the icons in BoardIconName so the existing icon existence test covers them.
  - Reuse standings-board, podium-result and empty-card-slot rather than generating more.
- Out:
  - No new icon for the result screen or the participant list.
  - No per-participant avatar or portrait.
  - Do not commit the raw generated sheets; they belong in logics/external/.

# Acceptance criteria
- AC1: solo-campaign, arcade and destiny-wheel exist as 128px WebP under apps/web/public/assets/crl/icons and are declared in BoardIconName.
- AC2: The arcade hero exists as WebP and keeps its left half quiet enough for the composited title to stay readable.
- AC3: The icon existence test passes for the new names, and no raw sheet is committed.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: solo-campaign, arcade and destiny-wheel exist as 128px WebP under apps/web/public/assets/crl/icons and are declared in BoardIconName.
- request-AC2 -> This backlog slice. Evidence needed: Arcade opens a catalogue of mini games listing only games that exist, built so another can be added without reshaping the screen.
- request-AC3 -> This backlog slice. Evidence needed: The Destiny Wheel asks for participants by name, and the list persists locally when it is validated.
- request-AC4 -> This backlog slice. Evidence needed: Launching runs a generated Grand Prix through the existing race simulation, without cards, plan, qualifying, points or credits.
- request-AC5 -> This backlog slice. Evidence needed: The race plays on the existing circuit map and its replay, with the plan and stats surfaces absent rather than disabled.
- request-AC6 -> This backlog slice. Evidence needed: The finishing order is shown as the result of the draw, and the draw can be run again with the same participants.
- request-AC7 -> This backlog slice. Evidence needed: Arcade never reads or writes a campaign save slot.
- request-AC9 -> This backlog slice. Evidence needed: Lint, typecheck, build, unit tests and the e2e suite pass.

# Generated Prompts

Paste as-is into the image generator, then follow `docs/board-icon-assets-runbook.md`. The last
two CRL sheets came back with an opaque gradient background despite the instruction, so plan for
the `rembg` pass rather than treating it as optional.

## Board icons (one sheet, 3 of 4 cells used)

Generated with:

```bash
logics-manager design prompt --kind icon-sheet --cell-size 256x256 \
  --cells "solo-campaign: ...|arcade: ...|destiny-wheel: ..." \
  --out logics/design/arcade-destiny-wheel-icons
```

```text
Create 3 icon sheet asset(s) for: CRL board icons for the new Solo sub-modes and the first arcade mini game.
Generator target: general AI image generator.
Canvas: 2x2 grid, 512x512 total with 256x256 cells; transparent background PNG; one asset per cell, centered, with generous padding and no bleed between cells. Fill left-to-right, then top-to-bottom.
Assets, in fill order:
1. solo-campaign: a road stretching to a horizon with a season banner arch over it, suggesting a long championship
2. arcade: a chunky retro arcade cabinet with a racing wheel controller, screen glowing
3. destiny-wheel: a spinning fortune wheel whose segments are racing pennants, one segment highlighted
Clean silhouettes, consistent lighting and perspective, readable at 24px, 32px and 48px.
Exclude: text, letters, numbers, labels, grid lines, watermarks, background decoration, any opaque or gradient background, drop shadows cast onto the transparent background, cropped or clipped assets.
```

Extract in fill order: `solo-campaign`, `arcade`, `destiny-wheel`. The fourth cell is empty and
is expected to be; do not ask for a filler icon to use it up.

## Arcade catalogue hero

Generated with:

```bash
logics-manager design prompt --kind hero-image --cell-size 1600x600 \
  --safe-area "the left half" --palette "near-black #100e12, orange #ff6a1f and teal #248276" \
  --style "cinematic 3D render, night city racing, same look as the existing CRL hero panels" \
  --out logics/design/arcade-destiny-wheel-hero
```

```text
Create 1 hero image asset(s) for: Arcade catalogue hero panel for CR League: a neon-lit arcade corner of a race paddock at night, a row of cabinet screens showing race maps, karts parked in the shadows.
Generator target: general AI image generator.
Canvas: one full-bleed image, 1600x600; opaque background. No cells, no panels, no padding between elements.
Reserved zone: keep the left half low in detail and free of subject matter; text is composited there.
Palette: near-black #100e12, orange #ff6a1f and teal #248276. Do not introduce colours outside it.
Style: cinematic 3D render, night city racing, same look as the existing CRL hero panels.
Cinematic composition and lighting.
Exclude: text, letters, numbers, logos, watermarks, UI chrome, sponsor decals.
```

Commit as `apps/web/public/assets/crl/arcade-catalogue.webp` beside the other hero panels. The
left half stays quiet because `.setup-entry-hero-panel` composites the title over it behind a
left-dark gradient.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Primary task(s): `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`

# AI Context
- Summary: Produce the arcade board icons and hero
- Keywords: scaffolded-backlog, produce the arcade board icons and hero, implementation-ready
- Use when: Implementing the scaffolded slice for Produce the arcade board icons and hero.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`

# Notes
- Task `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel` was finished via `logics-manager flow finish task` on 2026-07-29.
