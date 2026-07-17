## item_085_pit_wall_foundation_tokens_self_hosted_type_chamfer_utility - Pit Wall foundation: tokens, self-hosted type, chamfer utility
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Visual identity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The theme is defined by generic dashboard tokens (blue-slate surfaces, emerald accent, cyan telemetry, 10px radius) in tokens.css.
- The Inter-first font stack is never loaded, so the app renders in system fonts with no typographic identity.
- There is no display/label/numeral type role system, so every text renders in the same voice.

# Scope
- In:
  - Rework `tokens.css` to the Pit Wall palette: `--color-page` asphalt #121014, `--color-surface` carbon #1B181D, `--color-text` chalk #F1EDE4, `--color-accent` signal #FF4D00, new `--color-paper` #ECE7DA and `--color-ink` #17151A, semantic `--color-valid` #3ECF6E and `--color-wet` #5AA7FF, muted and border tones biased warm.
  - Add Barlow (400/600) and Barlow Condensed (500/700 + italic 600/800) as self-hosted woff2 (e.g. fontsource packages in the web workspace), wired through `--font-sans` and a new `--font-display`.
  - Define reusable type-role rules in base.css or layout.css: display (condensed italic caps), label (condensed spaced caps), chrono (condensed tabular-nums), body.
  - Add a chamfer utility (clip-path) and set `--radius` strategy for the new shape language.
  - Update `apps/web/index.html` theme-color to the asphalt ground.
  - Map old token references in layout.css to the new token names where a straight rename suffices.
- Out:
  - Per-screen restyling passes (handled by the following items).
  - Any TSX structural change.
  - New i18n keys.

# Acceptance criteria
- AC1: tokens.css contains the full Pit Wall token set and no longer defines #16c784 or #38bdf8.
- AC2: The app loads Barlow and Barlow Condensed from self-hosted files; the network panel shows no font CDN request.
- AC3: A visible heading renders in Barlow Condensed italic caps and body text in Barlow, confirmed on the setup screen.
- AC4: A chamfer utility class exists and is applied to at least the hero/setup panel as proof.
- AC5: `npm run typecheck`, `npm test`, and `npm run build` pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: tokens.css contains the full Pit Wall token set and no longer defines #16c784 or #38bdf8.
- request-AC2 -> This backlog slice. Proof: AC2: The app loads Barlow and Barlow Condensed from self-hosted files; the network panel shows no font CDN request.
- request-AC3 -> This backlog slice. Proof: AC3: A visible heading renders in Barlow Condensed italic caps and body text in Barlow, confirmed on the setup screen.
- request-AC8 -> This backlog slice. Proof: AC4: A chamfer utility class exists and is applied to at least the hero/setup panel as proof.
- request-AC9 -> This backlog slice. Proof: AC5: `npm run typecheck`, `npm test`, and `npm run build` pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_013_pit_wall_visual_identity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`
- Primary task(s): `task_043_orchestrate_the_pit_wall_visual_identity_rollout`

# AI Context
- Summary: Pit Wall foundation: tokens, self-hosted type, chamfer utility
- Keywords: scaffolded-backlog, pit wall foundation: tokens, self-hosted type, chamfer utility, implementation-ready
- Use when: Implementing the scaffolded slice for Pit Wall foundation: tokens, self-hosted type, chamfer utility.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
