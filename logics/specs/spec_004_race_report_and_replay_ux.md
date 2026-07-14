## spec_004_race_report_and_replay_ux - Race Report and Replay UX
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`
> Related spec: `spec_001_grand_prix_core_loop_and_simulation_v1`

# Purpose
Define how race outcomes are presented so players understand and remember them.

The replay and report are not decoration. They are the explanation layer for an automated simulation.

# Current Status
Keep this spec in Draft. The app now has animated road-routed GP replay, qualifying replay, report tabs, historical replay, and localized event summaries, but replay/report comprehension still needs current multi-person playtest evidence before this becomes settled.

# UX Goal
After a Grand Prix, the player should know:

- where they finished;
- why they gained or lost positions;
- whether their strategy mattered;
- whether their card mattered;
- what happened with their rival;
- what they earned;
- what to think about before the next race.

# Replay V1
Target:

- 30 to 60 seconds.
- Top-down 2D.
- Event-driven, not physics-driven.
- Focus on player, top positions, and key events.
- Can be skipped.

Required visual elements:

- circuit shape;
- cars or markers with team colors;
- current segment or lap;
- weather state;
- position list;
- event callouts;
- card trigger markers.

Event priority:

1. player card trigger;
2. player position gain/loss;
3. rival battle;
4. weather change;
5. reliability event;
6. podium/lead change;
7. bot flavor event.

# Report Structure
## Header
- Grand Prix name.
- Player finishing position.
- Position change.
- short verdict.

Example:

> Silver Ridge GP: P2, up 3 places. Your rain gamble worked.

## Key Moments
3 to 5 events from the timeline.

Each moment should include:

- segment/lap;
- event title;
- affected team;
- impact;
- player-facing explanation.

## Strategy Impact
Explain the selected approach and preparation:

- what helped;
- what hurt;
- what risk was taken.

## Card Impact
If a card was played:

- whether it triggered;
- what it changed;
- whether it was consumed;
- if it failed, why.

## Rival Outcome
If rival target exists:

- beat rival or lost to rival;
- points gap change;
- relevant event.

## Rewards
- championship points;
- credits;
- cards consumed or earned;
- standings movement.

## Next Hook
One sentence pointing to next decision.

Example:

> Next up: a technical street circuit where aggressive starts are riskier.

# Tone
Use confident sports-report language. Avoid insulting the player.

Good:

- "The aggressive start bought track position but created late reliability pressure."
- "Your setup was safe, but it lacked peak pace once the track dried."

Avoid:

- "You got unlucky."
- "Bad choice."
- "The algorithm decided."

# Non-goals
- No long generated prose essays.
- No full commentary transcript.
- No real-time spectator mode.
- No complex camera work in V1.

# Open Questions
- Should reports be written in second person or team-name voice?
- Should replay play before report, after report, or side-by-side?
- How many events are too many for casual players?
