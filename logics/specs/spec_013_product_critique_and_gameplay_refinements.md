## spec_013_product_critique_and_gameplay_refinements - Product Critique and Gameplay Refinements
> From version: 1.0.0
> Schema version: 1.0
> Status: Settled
> Understanding: 90%
> Confidence: 92
> Related request: `req_005_capture_cr_league_product_critique_and_gameplay_refinements`
> Related backlog: `item_011_capture_cr_league_product_critique_and_gameplay_refinements`
> Related task: `task_006_capture_cr_league_product_critique_and_gameplay_refinements`
> Related product: `prod_001_cr_league_product_brief`

# Purpose
Capture a critical product pass before implementation begins.

The current product direction is coherent. The remaining risk is not architecture or scope. The remaining risk is whether a player feels they actually played, understood, and cared.

Core critique:

> CR League must not feel like "choose three options, then the game rolls dice." It must feel like "I made a race bet, targeted someone, played a special move, and the race showed me exactly how that story unfolded."

# Main Fun Risks
## Passive Simulation Risk
The player may feel the simulation decides everything after they click a few abstract options.

Refinement:

- every decision needs a visible promise before the race;
- every result needs a visible consequence after the race;
- the report should explicitly link "you chose X" to "Y happened".

## Weak Emotional Stake Risk
Championship position alone may not be enough, especially for players outside the title fight.

Refinement:

- introduce visible rival objectives from V1;
- make the suggested rival part of the race story;
- let players care about beating one target even if they finish mid-pack.

## Numeric Card Risk
Cards can become invisible modifiers instead of memorable special moves.

Refinement:

- cards should be written as dramatic promises first and balance objects second;
- each card should produce a report mention or replay event;
- card copy should avoid raw-stat language in the player-facing UI.

## Replay Pacing Risk
A 30-60 second replay may be too slow for solo iteration.

Refinement:

- use a short highlight replay by default, roughly 15-25 seconds for solo;
- allow a longer replay later if needed;
- focus on 3-5 key moments rather than full race coverage.

## Shop Friction Risk
A full card shop after every race may become a chore.

Refinement:

- start with a small post-race card offer or draft;
- show 3 cards, let the player buy or pick 1, or skip;
- avoid a full market UI until the card loop proves useful.

## Flat Bot Risk
Solo will feel empty if bots are only names in a table.

Refinement:

- bots need names, archetypes, and recurring behavioral identity from V1;
- reports should call out bot tendencies when relevant;
- a bot should be able to become a rival.

## Missing Season Ending Risk
The product talks about Grand Prix loops more than season closure.

Refinement:

- add a minimal end-of-season summary to V1 planning;
- include champion, podium, biggest comeback, best weather gamble, closest rivalry, and restart option.

## Comeback Fairness Risk
Trailing-player help can feel like leader punishment.

Refinement:

- frame comeback as opportunity, not compensation;
- use objectives, risky cards, and slightly better credit access;
- never secretly nerf leaders because they are leading.

## Weak Team Identity Risk
The chef d'ecurie fantasy needs more team identity even without upgrades.

Refinement:

- team name and colors are mandatory;
- store season history and memorable moments;
- give teams a small identity surface before adding mechanics.

# Updated Core Loop Framing
Shift the product framing from:

> prepare a race with three decisions

to:

> choose a race bet, pick who you want to beat, play a special move, then watch the race explain the consequences.

Recommended V1 decision surface:

1. Plan de course: Prudent, Balanced, Aggressive.
2. Pari technique: Speed, Reliability, Weather.
3. Coup special: one card or none.
4. Rival objective: suggested automatically, accepted by default or lightly adjustable.

The rival objective should not feel like a fourth heavy configuration step. It should be visible and emotionally useful.

# V1 Refinements To Carry Forward
## Rivalry Visible From V1
V1 should include a suggested rival in briefing and report.

Minimum:

- suggest nearest standings rival;
- show "finish ahead of rival" objective;
- award small credits or report recognition;
- include rival outcome in race report.

## Cards As Dramatic Promises
Player-facing card text should describe the story.

Examples:

- Rain Tires: "If the rain arrives, your team is ready. If it stays dry, you give up pace."
- Mechanic Express: "The first mechanical scare becomes a delay, not a disaster."
- Rocket Start: "Launch hard now. Pay the pressure later."
- Slipstream Trap: "Use your rival's tow to force a move."

## Short Highlight Replay
Default replay should be short and skippable.

Minimum:

- 3-5 key events;
- player and rival highlighted;
- card trigger shown clearly;
- report remains the primary explanation.

## Post-race Card Offer
Prefer a simple offer over a full shop.

Minimum:

- show 3 cards after race or before next GP;
- player may buy/pick 1 or skip;
- keep credits visible;
- defer complex shop filtering.

## Bots With Personality
Each bot needs:

- display name;
- archetype;
- default strategy tendency;
- report-friendly behavior.

Example report line:

> Mika Blitz went aggressive again and paid for it late.

## Minimal Season Ending
Add a simple season closure screen later in V1:

- champion;
- final podium;
- player's final rank;
- best comeback;
- best weather gamble;
- closest rivalry;
- start next season action.

## Team Identity Surface
V1 should store:

- team name;
- colors;
- memorable result tags;
- season summary.

Do not add upgrades yet.

# Session Shape
Ideal casual session:

1. Open app.
2. See next Grand Prix.
3. Read one-line race tension.
4. Confirm or change plan.
5. Play or skip one card.
6. See result and why it happened.
7. Get a small next-race hook.

If a session requires more than this for casual players, the product is drifting.

# Product Decisions
- Rival objective should move into V1, at least as a suggested/reporting feature.
- Replay should be a highlight replay, not a full simulated broadcast.
- Card acquisition should start as a small post-race offer/draft, not a full shop.
- Bot personalities are mandatory for solo to feel alive.
- End-of-season summary should be planned, even if it lands after the first solo vertical slice.
- Team identity should stay cosmetic/history-based in V1, not mechanical upgrades.

# Non-goals
- No fourth heavy pre-race configuration step.
- No full narrative engine.
- No large shop system.
- No complex season awards system before the core loop works.
- No hidden rubber-banding.
- No permanent team upgrades in this refinement pass.

# Resolved Questions
- Rival objectives remain implicit/derived for now; explicit player-selected rival targeting is deferred.
- Cards are bought with credits in a simple shop rather than granted as post-race rewards.
- Season-ending presentation starts from standings/history rather than a separate award engine.
- Memorable moments are derived from race events/results for now.
