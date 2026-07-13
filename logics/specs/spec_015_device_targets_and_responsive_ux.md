## spec_015_device_targets_and_responsive_ux - Device Targets and Responsive UX
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Related request: `req_007_define_cr_league_device_targets_and_responsive_ux`
> Related backlog: `item_013_define_cr_league_device_targets_and_responsive_ux`
> Related task: `task_008_define_cr_league_device_targets_and_responsive_ux`
> Related product: `prod_001_cr_league_product_brief`
> Related architecture: `adr_001_cr_league_v1_static_pwa_api_architecture`

# Purpose
Define CR League's device target strategy.

The product should be one PWA, but mobile and desktop should not be treated as identical layouts.

# Decision
Build a single responsive PWA:

- mobile-first for the casual loop;
- desktop-enhanced for league overview, replay, comparison, and deeper review;
- no separate native app in V1;
- no separate mobile and desktop codebases.

# Device Roles
## Mobile
Mobile is the primary casual session surface.

Best for:

- joining a league from a code/link;
- creating a quick team;
- preparing the next Grand Prix;
- choosing one card;
- checking the result;
- reading key moments;
- reviewing standings briefly.

UX principles:

- one primary action per screen;
- short blocks;
- large touch targets;
- no dense tables as the first view;
- no hover dependency;
- short highlight replay;
- report first, details second.

## Desktop
Desktop is the enhanced management and review surface.

Best for:

- league overview;
- standings and history;
- inventory review;
- replay plus report side-by-side;
- comparing rivals;
- creating/configuring leagues;
- longer solo optimization sessions.

UX principles:

- dashboard layout;
- persistent side panels where useful;
- replay and report can be visible together;
- more data density, but still restrained;
- keyboard/mouse convenience is allowed but not required.

# Screen Guidance
## Team Setup
Mobile:

- single column;
- team name, colors, start action;
- use color swatches before custom picker if simpler.

Desktop:

- team form beside vehicle/team preview;
- more room for color comparison.

## Solo Dashboard
Mobile:

- next Grand Prix card first;
- standings preview below;
- inventory summary below;
- primary action: open briefing.

Desktop:

- next Grand Prix, standings, inventory, and recent result in panels;
- avoid nested cards.

## Grand Prix Briefing
Mobile:

- race tension summary first;
- weather/circuit/rival as stacked blocks;
- available cards collapsed or carousel-like;
- primary action: prepare race.

Desktop:

- circuit and weather side-by-side;
- standings/rival panel visible;
- card options visible in a compact grid.

## Preparation
Mobile:

- one decision group per section;
- segmented controls for plan and technical bet;
- card choice as swipe/stack/list;
- sticky confirm action if needed.

Desktop:

- plan, technical bet, card, and rival visible in one workspace;
- summary panel on the side.

## Race Result And Report
Mobile:

- verdict first;
- position and reward summary;
- 3-5 key moments;
- strategy/card/rival explanations;
- replay entry point after report or inline compact replay.

Desktop:

- replay left or top;
- report and standings movement right or below;
- player/rival highlights visible together.

## Replay
Mobile:

- 15-25 second highlight;
- large readable event callouts;
- skip button;
- no tiny labels.

Desktop:

- larger track;
- event timeline alongside replay;
- standings/rival panel can remain visible.

## Standings
Mobile:

- compact list;
- player and rival highlighted;
- avoid wide tables.

Desktop:

- full table;
- points, movement, recent form, and rival marker.

## Inventory And Card Offer
Mobile:

- cards as vertical list or horizontal cards;
- show one clear action per card;
- avoid dense shop grid.

Desktop:

- card grid;
- credits and recent card usage visible.

## League Creation
Mobile:

- minimal settings only;
- name, cadence, season length, bots;
- invite code after creation.

Desktop:

- same settings, but with preview and invite management.

# Responsive Layout Rules
- Design mobile first, then enhance desktop.
- Use one route model across devices.
- Components may change layout substantially by viewport.
- Do not hide required actions on one device.
- Do not require hover to understand controls.
- Keep text readable in buttons and cards.
- Replay and report must both work on small screens.
- Prefer progressive disclosure on mobile.

# Breakpoint Intent
Exact breakpoints can be chosen during implementation, but intent is:

- small: phone portrait, single-column action flow;
- medium: tablet/small laptop, two-column where helpful;
- large: desktop dashboard with side panels.

# PWA Expectations
V1 PWA should support:

- installable web app later, not necessarily first scaffold;
- responsive viewport metadata;
- touch-friendly controls;
- no native app dependency;
- backend sleep tolerance with clear loading states.

# Non-goals
- No separate native iOS or Android app in V1.
- No separate desktop app.
- No separate mobile codebase.
- No full tablet-specific design system.
- No hover-only interactions.
- No desktop-only feature required for core gameplay.

# Open Questions
- Should mobile show report before replay, while desktop shows replay and report together?
- Should league creation be desktop-recommended but still mobile-supported?
- Should card offer after race use a carousel on mobile or a simple list?
- Should the PWA install prompt appear only after a player finishes first GP?
