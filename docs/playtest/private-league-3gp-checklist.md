# Private League 3 GP Playtest Checklist

Target build: `0.3.8` race-learning polish.

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
4. Each player reviews the current GP, checks the first-time highlighted commands, edits the plan once, runs at least one qualifying attempt, opens the chrono report, replays the latest chrono, then submits a directive.
5. Resolve GP 1, launch the replay from the race flow, use the replay toolbar report shortcut, then use the report replay shortcut to return to the replay.
6. Read the race recap, report, rewards, chrono table, and classification.
7. Review the championship screen, click GP history, and confirm it opens in the normal replay screen instead of a modal.
8. Review the garage, switch between inventory/shop, open a card purchase modal, buy a recommended card if enough credits are available, then start GP 2.
9. Start GP 3 and repeat with a different directive/card choice.
10. If testing season flow, continue until the configured season limit and confirm the next season starts at 0 points while GP history remains consultable.
11. Use `Restart session` once and confirm the league returns to season 1 / round 1 while teams remain joined.
12. Use `Reset UI preferences` once and confirm the one-shot highlighted commands are visible again on a fresh pass.

## First-Time Highlight Pass
- Before clicking them, confirm `Edit plan`, `New chrono`, `Chrono report`, `Send plan`, `Launch GP`, `Report`, `Next GP`, and `Launch next GP` have an animated highlight.
- After clicking each command once, confirm its highlight is gone and does not come back during normal navigation.
- After resetting UI preferences, confirm the same one-shot highlights come back.
- Confirm highlighted buttons remain readable and do not look like static yellow buttons without motion.

## Screen Checks
- Chrono report: background image stops before `Session history`; grey panels do not clash with the rest of the cockpit; session setup is formatted, not raw text.
- Chrono report history: `Review chrono` opens the replay at the matching lap/timeline moment.
- Replay: race notifications stay in the top notification area; no duplicate centered league label appears over the car.
- Replay toolbar: the report shortcut sits before the red quit button and uses the blue report treatment.
- Report toolbar: the replay shortcut sits before the red quit button; the quit button keeps the same red treatment as the map.
- Report rewards: points and credits are readable, include a recognizable visual token/icon, and avoid the old grey-panel look.
- Garage inventory: duplicate count is pinned to the top-right of the card.
- Empty states: no decorative image appears next to `No cards in inventory` or `No saved league`.
- Shop: buying a card does not auto-select it for the player unless the player explicitly chooses it.
- Championship standings: points are legible on the light background.
- Championship trophies/history carousel: if the honors list is empty, the empty entry is not shown in the slider.

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
- Do the animated highlights help without feeling noisy after the first click?
- Does the chrono report teach what to change for the next plan?
- Can testers move naturally between replay, report, chrono report, and championship history?
- Do points and credits feel like distinct rewards at a glance?

## Questions
- What did you expect to happen before launching the GP?
- Did you understand when to run a chrono and when it was too late?
- Did you understand why a chrono report existed before submitting the plan?
- Which choice felt most meaningful?
- What was confusing or hidden?
- Where did you hesitate before the next click?
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
