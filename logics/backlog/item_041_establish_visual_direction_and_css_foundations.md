## item_041_establish_visual_direction_and_css_foundations - Establish visual direction and CSS foundations
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Visual direction
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current colors and panels feel generic and do not communicate racing, pit wall, strategy, or championship drama.
- The UI lacks a deliberate hierarchy between command surfaces, data cards, warnings, results, and supporting text.
- Ad hoc color use will keep drifting unless the redesign defines a small reusable vocabulary.

# Scope
- In:
  - Define a V0 palette with a dark command surface, neutral content surfaces, and race-state accents for prepare, ready, resolved, risk, and success.
  - Define typography scale and density rules for cockpit panels, compact cards, headings, status badges, and body text.
  - Define panel rhythm: when a surface is a command area, a repeated card, a data row, or an unframed section.
  - Update CSS variables and layout classes in `apps/web/src/styles/layout.css` without adding a styling dependency.
  - Preserve accessibility basics: contrast, focus states, readable text sizes, and non-color-only state communication.
- Out:
  - Final brand identity.
  - Custom illustration set.
  - SVG decorative backgrounds.
  - New icon package or component library.
  - Animation system.

# Acceptance criteria
- AC1: The CSS exposes a small set of named colors or variables for cockpit, surface, text, muted text, accent, warning, and success.
- AC2: The first viewport reads as a racing command cockpit rather than a neutral SaaS dashboard.
- AC3: Race states are visually distinct and labeled in text.
- AC4: Desktop and mobile screenshots show no obvious text overlap or unreadable contrast.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The CSS exposes a small set of named colors or variables for cockpit, surface, text, muted text, accent, warning, and success.
- request-AC3 -> This backlog slice. Proof: AC2: The first viewport reads as a racing command cockpit rather than a neutral SaaS dashboard.
- request-AC7 -> This backlog slice. Proof: AC3: Race states are visually distinct and labeled in text.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Establish visual direction and CSS foundations
- Keywords: scaffolded-backlog, establish visual direction and css foundations, implementation-ready
- Use when: Implementing the scaffolded slice for Establish visual direction and CSS foundations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
