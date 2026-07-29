// Deterministic solo save used by the screenshot generator.
// Built with the shared engine rather than a hand-written JSON blob, so the state stays
// schema-valid for free and the standings/history/palmares are real simulation output.
import { buyCard, resolveGrandPrix, runQualifying, startNextGrandPrix, submitDecision, type LeagueState } from "../packages/shared/src/index.js";
import { createInitialSoloLeagueState, SOLO_LEAGUE_ID, SOLO_TEAM_ID } from "../apps/web/src/app/soloLeague.js";

export { SOLO_LEAGUE_ID };

// ponytail: the storage keys are duplicated from appStorage.ts / soloStorage.ts, which pull in
// browser-only modules that cannot be imported from a Node script. A drift shows up immediately
// as screenshots of the splash screen, so it needs no test to catch it.
export const SOLO_SAVE_KEY = "cr-league-solo-slot-v1-0";
export const LANGUAGE_KEY = "cr-league-language";

const PLAYER = { teamId: SOLO_TEAM_ID };

// One entry per Grand Prix to play out before capturing. Varied approaches keep the
// standings from collapsing into a single runaway leader.
// The last entry is picked so the player wins the closing Grand Prix: the report and replay
// shots are the ones people look at, and they should not show a last place.
const SEASON = [
  { approach: "aggressive", preparation: "speed", cardId: "launch_boost" },
  { approach: "balanced", preparation: "reliability", cardId: "soft_tires" },
  { approach: "prudent", preparation: "weather", cardId: "rain_grip" },
  { approach: "balanced", preparation: "reliability", cardId: "rain_grip" }
] as const;

export function buildSoloFixture() {
  let state = createInitialSoloLeagueState();

  SEASON.forEach((round, index) => {
    // A card per round, bought out of the winnings: the garage looks lived-in by the end
    // instead of showing the single starter card.
    state = affordCard(state, round.cardId);
    state = runQualifying(state, { ...PLAYER, ...round, cardId: heldCard(state, round.cardId) }).state;
    state = submitDecision(state, { ...PLAYER, ...round, cardId: heldCard(state, round.cardId) });
    state = resolveGrandPrix(state, { allowDefaults: true });
    // Leave the last Grand Prix resolved so the report and replay screens have content.
    if (index < SEASON.length - 1) state = startNextGrandPrix(state);
  });

  // Races consume the cards they use, so restock afterwards: the garage inventory would
  // otherwise be captured empty. One card only, so the shop is not left greyed out with
  // everything unaffordable.
  state = affordCard(state, "rain_grip");

  return toSoloSave({ ...state, league: { ...state.league, name: "Riverside Invitational" } });
}

function affordCard(state: LeagueState, cardId: string): LeagueState {
  const team = state.teams.find((candidate) => candidate.id === SOLO_TEAM_ID);
  const offer = state.cardShop.find((candidate) => candidate.cardId === cardId);
  if (!team || !offer || team.cards.includes(cardId as never) || team.credits < offer.price) return state;
  return buyCard(state, { ...PLAYER, cardId });
}

function heldCard(state: LeagueState, cardId: string) {
  const team = state.teams.find((candidate) => candidate.id === SOLO_TEAM_ID);
  return team?.cards.includes(cardId as never) ? cardId : undefined;
}

function toSoloSave(state: LeagueState) {
  // Fixed timestamps: a moving date would rewrite the save on every run for no visible gain.
  const timestamp = "2026-01-01T12:00:00.000Z";
  return { schemaVersion: 1, createdAt: timestamp, updatedAt: timestamp, state };
}
