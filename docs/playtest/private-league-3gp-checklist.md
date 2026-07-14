# Private League 3 GP Playtest Checklist

## Setup
- Run the API and web app.
- Prepare the database with migrations and seed data.
- Run `npm run playtest:seed`.
- Share league code `PLAY01` with testers.
- Use one browser profile per tester, or clear the saved team claim between testers.
- Ask testers to join `PLAY01` with human team names, for example `Circle One` and `Late Apex`.

## Scenario
1. Player A joins code `PLAY01` as `Circle One`.
2. Player B joins code `PLAY01` as `Late Apex`.
3. Set cadence to `Fast`.
4. Each player submits a directive for GP 1.
5. Resolve GP 1 and read the report/replay.
6. Review the garage, buy one card if enough credits are available, then start GP 2.
7. Start GP 3 and repeat.
8. Stop after GP 3 and review standings/history.

## Observe
- Can testers tell which team is theirs?
- Is the next expected action obvious?
- Do ready/missing states match what players did?
- Does the result feel connected to the submitted directive?
- Does the replay timeline make the race easier to understand?
- Does the history make the championship feel persistent?
- Does buying or saving a card after a GP give a reason to continue?

## Questions
- What did you expect to happen before launching the GP?
- Which choice felt most meaningful?
- What was confusing or hidden?
- Would you come back for the next GP later?
- Did being behind still feel playable?

## Known Limits
- No real account system yet.
- No automatic deadline resolution yet.
- Card inventory exists only as a thin fixed-price garage; no selling, rarity, draft offers, or catch-up economy yet.
- Replay is an event timeline, not a visual track simulation.
