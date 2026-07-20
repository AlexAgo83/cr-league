## req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count - Lap-scale coherence: displayed lap numbers must match the circuit's lap count
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Race simulation realism and replay coherence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Every lap number a player sees — key moments, recap sentences, replay callouts, seek-marker labels, finish events — must be consistent with the lap count the circuit announces and the replay header counts; no displayed lap may exceed the circuit's lap total.
- Decide and document the single mapping between the simulation's internal lap scale and the circuit's displayed laps, so future event-producing features cannot reintroduce the mismatch.

# Context
- Observed on v0.3.11: Brussels declares laps 3 (CityCircuit.laps in apps/web/src/app/circuits.ts) and the replay header respects it (Lap 2/3), but RaceEvent.lap values reach 10 and flow untranslated into ReportView key moments, recap copy in helpers.ts (eventReportText and the difference recap interpolate event.lap), ReplayView seek-marker aria-labels, and race-director callouts. Montreal (12 laps) masked the bug because the scales nearly coincide.
- Locate the authoritative lap scale first: determine whether simulateRace derives its lap loop from an input laps parameter that callers do not wire to the circuit, or runs a fixed canonical count. The chosen fix depends on this diagnosis, and the diagnosis belongs in the task's first step.
- Preferred fix shape: keep the simulation's internal scale and deterministic traces untouched, and rescale at the boundary where events become player-facing — a single pure lapLabel(simLap, simTotal, circuitLaps) mapping used by every consumer (report, recap, replay callouts, markers). Rebalancing the simulation to actually run 3-lap races would change race outcomes and balance and is explicitly the fallback only if boundary rescaling proves incoherent (e.g. phase boundaries no longer align with the replay clock).
- The replay header already displays circuit-scaled laps, so the replay clock contains a working time-to-circuit-lap mapping; the same mapping must drive event lap labels so a key moment's stated lap matches where its marker sits on the scrubber and where the replay clock stands when it pops.
- Segment/phase structure (5 RACE_SEGMENTS) is orthogonal: phases are already circuit-independent and the report renders them as Phase 1..5; only lap numerals are wrong.
- req_046 (Done) owns the simulation/replay coherence theme; this is a follow-up defect in the same theme, not a reopening of that chain. req_062's payoff gating touches ReplayView at the same time; sequence this chain relative to it in whichever order lands first, the surfaces barely overlap (labels versus visibility).
- Tests to leave behind: a shared or web invariant test that for every event in a resolved race, the displayed lap is between 1 and the circuit's lap count, and that the finish event maps to the final lap; plus a fixture on a short circuit (3 laps) since the existing tests all use long-circuit fixtures that mask the bug.

# Acceptance criteria
- AC1: On a short circuit (3 laps), every player-visible lap number — key moments, recap sentences, replay callouts, seek-marker labels, finish line — is between 1 and 3, and the finish event reads as the final lap.
- AC2: A single shared mapping translates simulation laps to displayed laps and every event-consuming surface uses it; no consumer formats raw RaceEvent.lap directly.
- AC3: The lap stated in a key moment matches the replay position where its seek marker sits and where the replay clock stands when the callout pops.
- AC4: Existing long-circuit replay and report tests pass unchanged, and a new short-circuit fixture test locks the invariant.
- AC5: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_027_lap_scale_coherence_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_046_make_race_simulation_and_replay_feel_coherent_across_circuits.md
- logics/request/req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest.md
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/domain/race.ts
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/ReportView.tsx
- apps/web/src/app/helpers.ts
- apps/web/src/app/circuits.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- AI playtest of 2026-07-20 on v0.3.11, second session, Brussels Grand Place Clash: the circuit is defined and displayed as 3 laps and the replay header counted Lap 2/3, but the race report's key moments cite laps 5, 8, and 10, the finish event fires at lap 10, and the recap says the weather moved to heavy rain on lap 5 — lap numbers from a race the UI says lasted 3 laps. The simulation appears to run on its own canonical lap scale (roughly 10) while circuits declare their own lap counts (3 to 12 in the catalog), and raw simulation lap numbers leak into every event-derived surface: key moments, recap sentences, seek-marker aria-labels, and race-director callouts. The first GP (Montreal, 12 laps) masked the bug because the two scales roughly coincide.

# AI Context
- Summary: Lap-scale coherence: displayed lap numbers must match the circuit's lap count
- Keywords: request-chain-scaffold, lap-scale coherence: displayed lap numbers must match the circuit's lap count, development-ready
- Use when: You need to implement or review the scaffolded workflow for Lap-scale coherence: displayed lap numbers must match the circuit's lap count.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_152_map_simulation_laps_to_circuit_laps_at_the_display_boundary`
