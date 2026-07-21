## item_192_limiter_pruning_profileid_index_and_bot_card_write_hygiene - Limiter pruning, profileId index, and bot-card write hygiene
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Hardening
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The recovery limiter (routes.ts:344-362) never prunes expired buckets (unbounded Map, one entry per email + IP) and take(email) && take(ip) consumes the email attempt even when the IP branch rejects.
- Team.profileId has no index though profile-session and ownership lookups query by it.
- buyBotCards (store.ts:1049-1064) writes each bot's cards from a pre-loop freshState snapshot rather than re-reading, the same JSON-staleness class as the human buy path.

# Scope
- In:
  - Sweep expired limiter buckets on access (or above a size threshold) and evaluate both take() results before combining so a rejected IP does not burn the email attempt; keep it in-process.
  - Add @@index([profileId]) to the Team model with a migration.
  - Re-read each bot row inside its update (or DB-append) in buyBotCards, aligning with the req_085 locking approach for the human path.
- Out:
  - Distributed/Redis rate limiting or new dependencies.
  - Broader schema indexing beyond profileId.
  - Locking the human buy/decision/join paths (owned by req_085).

# Acceptance criteria
- AC1: The limiter does not grow unbounded and does not consume the email attempt on an IP-only rejection.
- AC2: Team.profileId is indexed via a migration.
- AC3: buyBotCards no longer writes bot cards from a stale snapshot.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: The limiter does not grow unbounded and does not consume the email attempt on an IP-only rejection.
- request-AC6 -> This backlog slice. Proof: AC2: Team.profileId is indexed via a migration.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_050_gameplay_and_economy_integrity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
- Primary task(s): `task_087_orchestrate_gameplay_and_economy_integrity_fixes`

# AI Context
- Summary: Limiter pruning, profileId index, and bot-card write hygiene
- Keywords: scaffolded-backlog, limiter pruning, profileid index, and bot-card write hygiene, implementation-ready
- Use when: Implementing the scaffolded slice for Limiter pruning, profileId index, and bot-card write hygiene.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
