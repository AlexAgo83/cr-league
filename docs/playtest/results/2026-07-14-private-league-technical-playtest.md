# Private League Technical Playtest - 2026-07-14

## Context
- Playtest type: solo/operator technical playtest of the private league prototype.
- Fixture: `PLAY01` seeded private league.
- Scope tested:
  - join private league;
  - submit directive;
  - resolve Grand Prix;
  - read classification, key moments, and race report;
  - start next Grand Prix.

## Summary
- The technical loop works: a tester can join, submit, resolve, read results, and continue to the next GP.
- The current prototype is acceptable for a technical playtest, but it is not yet a convincing game experience.
- The biggest issue is not visual polish alone. It is the full UX: guidance, decision context, race readability, immersion, and between-GP motivation.

## Flow Comprehension
- The tester did not get fully lost, but often had to infer what to do.
- The least intuitive moment is the decision step:
  - the directive button exists;
  - the player is not clearly guided toward the action;
  - the UI does not explain why the chosen directive matters.
- Overall, the flow needs stronger guidance.

## Interface And UX
- The current interface is not yet good enough as a product experience.
- It is acceptable as a technical playtest interface.
- The main weakness is UX more than pure aesthetics.
- The player cannot yet project into the fantasy of being a racing team principal.
- Future versions need a more immersive and theme-coherent interface.

## Gameplay Feedback
- Choices appear to have an impact.
- The player lacks enough context to choose intelligently.
- Needed before decisions:
  - clearer forecast/context;
  - better explanation of approach/preparation/card tradeoffs;
  - hints about likely consequences;
  - enough information to form a small strategy.
- The report explains results reasonably well.
- Consequences become repetitive because the event set is too small.

## Report And Replay
- The player expected more detail about how the race unfolded.
- Current race events are too few.
- Events recur in similar patterns, especially weather events around the same laps.
- The replay needs more variety.
- Low-impact flavor events would help make the race feel alive even if they do not alter the result.

## Rhythm And Retention
- Chaining GP with `Next GP` feels fluid and natural.
- The loop is missing a progression layer between races.
- Current reasons to continue are mostly:
  - standings;
  - points;
  - credits.
- This is not enough yet to create a compelling return loop.

## Fun Factor
- The main blocker is lack of immersion.
- The current UI and visuals do not yet communicate a racing universe.
- The game feels mechanical because:
  - event variety is low;
  - decision guidance is weak;
  - presentation does not yet sell the fantasy.

## Priority
- Highest priority: rework the player experience as a whole.
- Two areas should move together:
  - a more immersive, theme-coherent interface;
  - stronger player guidance explaining what to do and why.
- Presentation and guidance are both mandatory:
  - without presentation, the player does not project into the game;
  - without guidance, the player does not naturally understand how to play.

## Product Interpretation
- The prototype has crossed the first technical bar.
- The next risk is not backend capability. It is whether the user understands and feels the core fantasy.
- The game needs to shift from "functional race form" to "race weekend cockpit".
- The next product slice should not start with economy depth alone. Economy/cards will help retention, but they will not solve the current lack of guidance and immersion by themselves.

## Recommended Next Slice
- Build a guided race desk experience:
  - make the current required action obvious;
  - show a pre-GP briefing with weather forecast, track traits, and team state;
  - explain directive choices with concise tradeoffs;
  - surface why a card is relevant before selection;
  - make the result screen read like a race recap rather than raw panels.
- Expand race event generation:
  - add more non-critical flavor events;
  - vary event laps and wording;
  - create more cause-effect lines tied to decisions;
  - keep events deterministic from seed.
- Improve visual direction enough to support immersion:
  - add a race-themed dashboard structure;
  - use stronger hierarchy for briefing, directive, race, and report states;
  - avoid generic admin-form presentation.

## Follow-up Implemented
- Added English/French UI switching so local testers can play in French.
- Added a guided GP briefing with current action, track profile, likely weather, and directive hints.
- Added deterministic minor race notes to make the replay less repetitive without changing race balance.
- Added the first thin between-GP progression hook: persisted card inventory, fixed-price buying with credits, owned-card directive validation, and card consumption after GP resolution.
- Improved the garage presentation with post-GP rewards, consumed-card summary, separated inventory/offers, and simple card fit labels.
- Remaining limits are intentional: no card selling, rarity, draft offers, catch-up economy tuning, full visual track replay, or scheduler.

## Backlog Candidates
- Add guided pre-GP briefing and decision helper.
- Expand race event variety and replay flavor.
- Rework result screen into a race recap.
- Add a first immersion pass for the race desk UI.
- Tune and expand between-GP progression only after the thin garage loop has playtest feedback.

## Open Questions
- Should the next slice prioritize guidance first, visual immersion first, or a combined thin slice?
- How much race event noise is enough before it feels random or fake?
- Should the next between-GP progression layer deepen card acquisition, team morale, sponsor objectives, or car condition?
