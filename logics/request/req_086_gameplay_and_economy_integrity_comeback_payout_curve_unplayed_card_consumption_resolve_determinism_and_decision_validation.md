## req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation - Gameplay and economy integrity: comeback payout curve, unplayed-card consumption, resolve determinism, and decision validation
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Gameplay and economy integrity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the finishing-position credit payout monotonic: a worse finish must never pay more credits than a better one, while keeping an intentional comeback cushion for the tail of the field.
- Stop consuming a card a player never chose: a human who does not submit a decision before a default/deadline resolve must not have an inventory card auto-played and removed.
- Keep race resolution deterministic from stored circuit identity: resolveCurrentGrandPrix must derive traits and track parameters from the circuit, not from the caller's HTTP body.
- Reject self-targeted rival decisions so rival-card effects cannot apply to the submitting team.
- Tidy the rate limiter and an index gap: prune expired limiter buckets without short-circuit miscounting, and add the missing Team.profileId index; fold the bot-card write into the same locking approach as the human path.

# Context
- The comeback bonus is intentional rubber-banding (COMEBACK_CREDIT_BONUS_* constants exist), but its magnitude overshoots the base table so the curve is non-monotonic for a full field. The fix should preserve a tail cushion while guaranteeing monotonicity, e.g. clamp baseCredits+comebackBonus below the credits of the next-better scoring position, or reshape the base table plus a smaller bonus. Leagues do reach 10+ teams (a 20-player simulation report is committed), so P7-P10 are real, not hypothetical. Validate the new curve with npm run balance:sim.
- buildParticipants assigns non-submitting humans a full demo decision including a defaulted card via defaultCardForTeam = team.cards[0]; combined with the consumedCards inventory removal in resolveCurrentGrandPrix, the player silently loses a card. The minimal fix is to leave cardId undefined for auto-defaulted humans (play no card) so nothing is consumed; bots keep their default-card behavior. Confirm result.consumedCards only ever contains explicitly chosen cards afterward.
- resolveCurrentGrandPrix currently trusts input.traits/laps/trackLengthMeters/pitLaneProgress. traits especially override the circuit's canonical stats via normalizeRaceTraits, breaking seed-determinism and letting the owner tilt outcomes. Derive all of these from the stored circuit (as qualifying does) and ignore or drop the client-supplied render params; if the admin replay view needs render hints, keep them display-only and out of the scored simulation input.
- validateDecisionValues validates rivalTeamId membership but not that it is not the submitting team's own id; add rivalTeamId === input.teamId rejection with a 400 so urban_draft/calculated_attack cannot self-target.
- The recovery limiter Map grows unbounded and its combined take(email) && take(ip) consumes the email budget even when the IP branch rejects; sweep expired buckets on access (or on a size threshold) and evaluate both take() results before combining so a rejected IP does not burn a legit email attempt. Keep it in-process per the existing ponytail note; no Redis. Add @@index([profileId]) to Team. buyBotCards should re-read each bot row (or DB-append) instead of writing from the stale freshState snapshot, aligning with the req_085 locking work for the human buy path.
- Out of scope: retuning individual card magnitudes or approach deltas (that is a balance pass, not integrity); the JSON-column locking of the human buyCard/submitDecision/join paths is already owned by req_085 and is only referenced here for the bot-card sibling.

# Acceptance criteria
- AC1: The finishing-position credit payout is monotonic non-increasing (a lower finish never pays more than a higher finish) while the tail of the field still receives a comeback cushion, verified by a unit test over the full position range and a balance:sim check.
- AC2: A human who does not submit a decision before a default/deadline resolve has no card consumed, and result.consumedCards contains only explicitly chosen cards, covered by a test.
- AC3: resolveCurrentGrandPrix produces identical results for a given seed and circuit regardless of any traits/laps/track values in the request body, covered by a test that varies the body and asserts unchanged output.
- AC4: A decision with rivalTeamId equal to the submitting team is rejected with 400, covered by a test.
- AC5: The recovery limiter prunes expired buckets and does not consume the email attempt when the IP branch rejects; Team.profileId is indexed; buyBotCards no longer writes bot cards from a stale snapshot.
- AC6: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_050_gameplay_and_economy_integrity_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- packages/shared/src/economy/constants.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/leagues/routes.ts
- prisma/schema.prisma
- Second audit sweep on 2026-07-22 (v0.3.26+), covering areas the pass-6 structural review did not: economy payout curve, default-resolve card handling, resolve input trust, decision validation, and rate-limit/index hygiene. Findings: (1) The comeback credit bonus is non-monotonic. classify (simulateRace.ts:924-925) awards baseCredits from RACE_CREDITS_BY_POSITION=[150,130,115,105,100,100] plus comebackBonus = min(40, max(0, position-6)*10), so P7=110, P8=120, P9=130, P10+=140 credits while P3=115, P4=105, P5=P6=100 — finishing 8th-10th earns MORE than finishing 3rd-6th, inverting the incentive to place well. (2) On a default/deadline resolve, buildParticipants (store.ts:966-988) assigns a human who never submitted the decision { ...demo.decision, cardId: defaultCardForTeam(team, ...) }, and defaultCardForTeam (store.ts:1067-1069) returns team.cards[0]; that card then appears in result.consumedCards and is removed from the player's inventory (store.ts:733-742) even though the player never chose to play it. (3) resolveCurrentGrandPrix (store.ts:708-711) feeds input.traits/laps/trackLengthMeters/pitLaneProgress from the resolve HTTP body straight into simulateRace, and normalizeRaceTraits(input.traits) overrides the circuit's canonical traits, so whoever holds the owner claim can nudge the result away from the seed-deterministic circuit configuration; qualifying already derives these from stored circuit identity. (4) validateDecisionValues (store.ts:992-1010) checks that rivalTeamId is some team in the league but not that it differs from the submitting team, so urban_draft/calculated_attack (simulateRace.ts:736-807) can apply their rival buff/penalty to the team's own state. (5) The recovery limiter (routes.ts:344-362) never prunes expired buckets (unbounded Map growth, one entry per email + IP) and its take(email) && take(ip) short-circuits so a legit user's email attempt is still consumed when only the IP bucket rejects. (6) Team.profileId (schema.prisma) has no index though profile-session and ownership lookups query by it. (7) buyBotCards (store.ts:1049-1064) read-modify-writes each bot's cards from a pre-loop freshState snapshot rather than re-reading, the same JSON-column staleness class as the human buyCard path already scheduled for locking in req_085.

# AI Context
- Summary: Gameplay and economy integrity: comeback payout curve, unplayed-card consumption, resolve determinism, and decision validation
- Keywords: request-chain-scaffold, gameplay and economy integrity: comeback payout curve, unplayed-card consumption, resolve determinism, and decision validation, development-ready
- Use when: You need to implement or review the scaffolded workflow for Gameplay and economy integrity: comeback payout curve, unplayed-card consumption, resolve determinism, and decision validation.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_190_monotonic_payout_and_no_unplayed_card_consumption`
- `item_191_deterministic_resolution_and_self_rival_rejection`
- `item_192_limiter_pruning_profileid_index_and_bot_card_write_hygiene`
