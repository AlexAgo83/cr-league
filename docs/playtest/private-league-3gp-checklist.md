# Private League 3 GP Playtest Checklist

## Setup
- Run the API and web app.
- Prepare the database with migrations and seed data.
- Run `npm run playtest:seed`.
- Share league code `PLAY01` with testers.
- Ask each tester to create a profile with an email and keep the recovery code, or recover an existing profile before joining.
- Use one browser profile per tester, or clear the saved profile between testers.
- Ask testers to join `PLAY01` with human team names, for example `Volt Union` and `Late Apex`.
- For a custom league, keep defaults unless testing setup friction: 8 players, bot fill on, 3 qualifying attempts, 6 GP per season.

## Scenario
1. Player A creates or recovers a profile, then joins code `PLAY01` as `Volt Union`.
2. Player B creates or recovers a profile, then joins code `PLAY01` as `Late Apex`.
3. Set cadence to `Fast`.
4. Each player reviews the current GP, runs at least one qualifying attempt, replays the latest chrono, then submits a directive.
5. Resolve GP 1 and read the race recap, report, replay, chrono table, and classification.
6. Review the championship screen, click GP history to reopen a replay, then return to the race flow.
7. Review the garage, switch between inventory/shop, open a card purchase modal, buy a recommended card if enough credits are available, then start GP 2.
8. Start GP 3 and repeat with a different directive/card choice.
9. If testing season flow, continue until the configured season limit and confirm the next season starts at 0 points while GP history remains consultable.
10. Use `Restart session` once and confirm the league returns to season 1 / round 1 while teams remain joined.

## Observe
- Can testers tell which team is theirs?
- Is the next expected action obvious?
- Does the race desk state (`Prepare`, `Ready`, `Race resolved`) match the action testers think they should take?
- Do ready/missing states match what players did?
- Does the result feel connected to the submitted directive?
- Does qualifying feel like it influences the grid without deciding the whole race?
- Does replay speed feel consistent between qualifying and GP replay?
- Does the race recap explain what made the difference?
- Does the visual replay make the race easier to understand than the timeline alone?
- Do visual event callouts match the written recap and key moments?
- Does the history make the championship feel persistent?
- Does clicking a historical GP replay feel discoverable and useful?
- Does the championship screen make current season, leader, standings, GP history, and league controls easy to scan?
- Does restarting the session feel clear enough for repeating a playtest?
- Does buying or saving a card after a GP give a reason to continue?
- Does the card purchase modal explain why a card matters before asking for confirmation?
- Do card badges, stats, and recommendations help the card choice?
- Are credits tight enough to make buying a choice?
- Does the pit-wall/race-desk presentation feel more like a race weekend than an admin form?
- Do the compact profile and pit-wall entry screens make the first action obvious?

## Questions
- What did you expect to happen before launching the GP?
- Did you understand when to run a chrono and when it was too late?
- Which choice felt most meaningful?
- What was confusing or hidden?
- Would you come back for the next GP later?
- Did being behind still feel playable?
- What did the recap teach you for the next GP?
- Which card felt too strong, too weak, or unclear?

## Known Limits
- Profile recovery is lightweight only: email plus recovery code, not full password/OAuth authentication.
- No automatic deadline resolution yet.
- Card inventory exists as a fixed-price garage/shop with recommendations and purchase confirmation; no selling, rarity, draft offers, or deep catch-up economy yet.
- Restart session is a playtest operator tool, not a full admin/season management system.
- Replay is deterministic playback from stored generated race/qualifying data; it is not a live physics simulation.

## Balance Evidence
After a meaningful card/economy change, attach a fresh balance run to the playtest notes:

```bash
npm run balance:sim -- --runs 300 --limit 10 --json reports/balance/latest.json
```
