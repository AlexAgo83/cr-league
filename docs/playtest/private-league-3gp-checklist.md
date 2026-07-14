# Private League 3 GP Playtest Checklist

## Setup
- Run the API and web app.
- Prepare the database with migrations and seed data.
- Run `npm run playtest:seed`.
- Share league code `PLAY01` with testers.
- Ask each tester to create a profile with an email and keep the recovery code, or recover an existing profile before joining.
- Use one browser profile per tester, or clear the saved profile between testers.
- Ask testers to join `PLAY01` with human team names, for example `Volt Union` and `Late Apex`.

## Scenario
1. Player A creates or recovers a profile, then joins code `PLAY01` as `Volt Union`.
2. Player B creates or recovers a profile, then joins code `PLAY01` as `Late Apex`.
3. Set cadence to `Fast`.
4. Each player submits a directive for GP 1.
5. Resolve GP 1 and read the race recap, report, and replay.
6. Review the garage summary, check the consumed-card line, buy one recommended card if enough credits are available, then start GP 2.
7. Start GP 3 and repeat.
8. Stop after GP 3 and review standings/history.
9. Use `Restart session` once and confirm the league returns to round 1 while teams remain joined.

## Observe
- Can testers tell which team is theirs?
- Is the next expected action obvious?
- Does the race desk state (`Prepare`, `Ready`, `Race resolved`) match the action testers think they should take?
- Do ready/missing states match what players did?
- Does the result feel connected to the submitted directive?
- Does the race recap explain what made the difference?
- Does the visual replay make the race easier to understand than the timeline alone?
- Do visual event callouts match the written recap and key moments?
- Does the history make the championship feel persistent?
- Does the dashboard make invite code, current GP, readiness, leader, standings, garage, and history easy to scan?
- Does restarting the session feel clear enough for repeating a playtest?
- Does buying or saving a card after a GP give a reason to continue?
- Do the `Recommended`, `Risky`, and `Low fit` labels help the card choice?
- Does the pit-wall/race-desk presentation feel more like a race weekend than an admin form?

## Questions
- What did you expect to happen before launching the GP?
- Which choice felt most meaningful?
- What was confusing or hidden?
- Would you come back for the next GP later?
- Did being behind still feel playable?
- What did the recap teach you for the next GP?

## Known Limits
- Profile recovery is lightweight only: email plus recovery code, not full password/OAuth authentication.
- No automatic deadline resolution yet.
- Card inventory exists only as a thin fixed-price garage with a small recommended offer set; no selling, rarity, draft offers, or catch-up economy yet.
- Restart session is a playtest operator tool, not a full admin/season management system.
- Replay V0 is a static visual summary from stored classification and event data, not a full race simulation.
