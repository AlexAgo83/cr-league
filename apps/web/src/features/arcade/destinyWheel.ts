import { CITY_CIRCUIT_IDENTITIES, raceInputFromCircuit, simulateRace, type BotArchetype, type RaceResult, type TeamLivery } from "@cr-league/shared";
import { CITY_CIRCUITS, withRoute, type CityCircuit } from "../../app/circuits.js";
import { DEFAULT_CAR_ASSET, CAR_ASSETS } from "../carAssets.js";
import type { WheelParticipant } from "./arcadeStorage.js";

/**
 * A draw is a race between the people entered, and nothing else: no cards, no plan, no points.
 * `simulateRace` is pure and takes participants directly, so this needs no LeagueState and no
 * league engine — see the request diagnostics in req_134.
 */
export type WheelDraw = {
  circuit: CityCircuit;
  result: RaceResult;
  liveries: Record<string, TeamLivery>;
};

/** Enough to fill a grid without repeating a colour, and distinguishable on the map. */
const WHEEL_PALETTE = [
  ["#ff6a1f", "#ffd166"],
  ["#16c784", "#38bdf8"],
  ["#8b5cf6", "#22d3ee"],
  ["#ef4444", "#facc15"],
  ["#0ea5e9", "#f8fafc"],
  ["#84cc16", "#1e293b"],
  ["#f472b6", "#fde68a"],
  ["#f97316", "#111827"],
  ["#14b8a6", "#e2e8f0"],
  ["#a3e635", "#0f172a"],
  ["#60a5fa", "#1e3a8a"],
  ["#fb7185", "#4c0519"],
  ["#facc15", "#78350f"],
  ["#2dd4bf", "#134e4a"],
  ["#c084fc", "#3b0764"],
  ["#94a3b8", "#0f172a"]
] as const;

const ARCHETYPES: BotArchetype[] = ["prudent", "gambler", "rain_specialist", "mechanic", "sprinter", "opportunist"];

export function wheelLivery(index: number): TeamLivery {
  const [primary, secondary] = WHEEL_PALETTE[index % WHEEL_PALETTE.length] ?? WHEEL_PALETTE[0];
  // Cars vary alongside colours so two neighbours on the grid never look the same.
  const car = CAR_ASSETS[index % CAR_ASSETS.length] ?? DEFAULT_CAR_ASSET;
  return { primary, secondary, carAssetId: car.id };
}

/**
 * Runs the draw. The seed varies per launch, so the same participants entered twice give two
 * different orders — a draw that always answered the same would not be one.
 */
export function drawDestinyWheel(participants: WheelParticipant[], seed: string): WheelDraw {
  if (participants.length < 2) {
    throw new Error("A draw needs at least two participants.");
  }

  // CITY_CIRCUITS is built by mapping over the identities, so the two stay index-aligned. The
  // identity is what `raceInputFromCircuit` types against; the circuit is what the map draws.
  const index = hash(seed) % CITY_CIRCUIT_IDENTITIES.length;
  const circuit = withRoute(CITY_CIRCUITS[index] ?? CITY_CIRCUITS[0]);
  const identity = CITY_CIRCUIT_IDENTITIES[index] ?? CITY_CIRCUIT_IDENTITIES[0];
  const liveries: Record<string, TeamLivery> = {};
  participants.forEach((participant, index) => {
    liveries[participant.id] = wheelLivery(index);
  });

  const result = simulateRace({
    seed,
    grandPrixName: circuit.city,
    traits: circuit.traits,
    laps: circuit.laps,
    trackZones: circuit.trackZones,
    speedProfile: circuit.speedProfile,
    pitLaneProgress: circuit.pitLaneProgress,
    ...raceInputFromCircuit(identity),
    participants: participants.map((participant, index) => ({
      teamId: participant.id,
      teamName: participant.name,
      kind: "bot" as const,
      // Everyone starts level: a draw with a favourite is a rigged draw.
      standingsRank: index + 1,
      botArchetype: ARCHETYPES[hash(`${seed}:${participant.id}`) % ARCHETYPES.length]!,
      decision: { approach: "balanced" as const, preparation: "speed" as const }
    }))
  });

  return { circuit, result, liveries };
}

function hash(value: string) {
  let hashed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hashed ^= value.charCodeAt(index);
    hashed = Math.imul(hashed, 16777619);
  }
  return Math.abs(hashed);
}
