## spec_012_frontend_vertical_slice_flow - Frontend Vertical Slice Flow
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 85%
> Confidence: 80%
> Related request: `req_004_define_cr_league_implementation_contracts_v0`
> Related backlog: `item_010_define_cr_league_implementation_contracts_v0`
> Related task: `task_005_define_cr_league_implementation_contracts_v0`
> Related spec: `spec_003_mvp_vertical_slice`

# Purpose
Define the first frontend flow to build in the Vite React PWA.

The first slice should prove the solo Grand Prix loop before private multiplayer.

# Screen Order
## 1. Team Setup
Fields:

- player display name;
- team name;
- primary color;
- secondary color.

Action:

- create solo championship.

Success:

- navigate to solo dashboard.

## 2. Solo Dashboard
Shows:

- team summary;
- next Grand Prix;
- standings;
- credits;
- available cards count;
- button to open briefing.

## 3. Grand Prix Briefing
Shows:

- GP name;
- circuit traits;
- weather forecast;
- suggested rival;
- current standings context;
- available cards.

Action:

- continue to preparation.

## 4. Preparation Form
Controls:

- race approach segmented control: Prudent, Balanced, Aggressive;
- technical preparation segmented control: Speed, Reliability, Weather;
- card selector: none or one available card;
- rival selector optional for V0.

Action:

- submit decision.
- resolve race.

V0 can combine submit and resolve in one flow for solo.

## 5. Race Resolving State
Shows:

- short loading state;
- selected plan summary.

No fake long wait required.

## 6. Race Report
Primary result screen.

Shows:

- finishing position;
- position change;
- verdict;
- key moments;
- strategy impact;
- card impact;
- rewards;
- standings movement.

Action:

- view standings;
- continue to next GP;
- view replay if replay exists.

## 7. Standings
Shows:

- current championship table;
- points;
- previous position movement if available;
- player row highlighted.

## 8. Inventory
Shows:

- credits;
- available cards;
- consumed card result from last race if relevant.

V0 can make inventory read-only if no shop exists yet.

## 9. Minimal Replay
Replay can come after report in first implementation.

V0 acceptable version:

- timeline list with segment markers, then simple track visualization.

Do not block the vertical slice on polished replay.

# Navigation
Keep route count simple:

```txt
/
/solo/:leagueId
/races/:grandPrixId/briefing
/races/:grandPrixId/prepare
/races/:grandPrixId/result
```

Inventory and standings can be panels inside dashboard/result at first.

# State Strategy
- Fetch server state from API.
- Keep form state local until submit.
- Do not add global state library in V0.
- Use route loaders or simple hooks.
- Cache only when needed.

# UX Priorities
- The player always knows the next action.
- The result explains itself before showing secondary detail.
- Text must fit on mobile.
- Use icons for choices/cards where available, but do not block on custom art.
- Make the player row and selected card visually clear.

# Implementation Order
1. Static mocked screens.
2. Hook team setup to API.
3. Hook dashboard/briefing to API.
4. Hook preparation to API.
5. Hook result/report to API.
6. Add standings/inventory panels.
7. Add minimal replay.

# Non-goals
- No private multiplayer UI in first slice.
- No shop UI unless backend is ready.
- No polished onboarding.
- No settings page.
- No notifications.
- No full responsive polish before core flow works.

# Open Questions
- Should report and replay be separate routes or one result route?
- Should the first UI use real API only or allow mocked fallback?
- Should color selection use fixed swatches first instead of a color picker?
