import { CITY_CIRCUIT_IDENTITIES, raceInputFromCircuit, simulateRace, type BotArchetype, type RaceResult, type TeamLivery } from "@cr-league/shared";
import { CITY_CIRCUITS, circuitsInRegion, regionsWithCircuits, withRoute, type CircuitRegion, type CityCircuit } from "../../app/circuits.js";
import { DEFAULT_CAR_ASSET, CAR_ASSETS } from "../carAssets.js";
import type { WheelParticipant } from "./arcadeStorage.js";

/**
 * A draw is a race between the people entered, and nothing else: no cards, no plan, no points.
 * `simulateRace` is pure and takes participants directly, so this needs no LeagueState and no
 * league engine — see the request diagnostics in req_134.
 */
export type WheelRegion = "all" | CircuitRegion;

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

/** `chosen` wins where it is set: the palette is the default, not the rule. */
export function wheelLivery(index: number, chosen?: Pick<WheelParticipant, "primary" | "secondary">): TeamLivery {
  const [primary, secondary] = WHEEL_PALETTE[index % WHEEL_PALETTE.length] ?? WHEEL_PALETTE[0];
  // Cars vary alongside colours so two neighbours on the grid never look the same.
  const car = CAR_ASSETS[index % CAR_ASSETS.length] ?? DEFAULT_CAR_ASSET;
  return { primary: chosen?.primary ?? primary, secondary: chosen?.secondary ?? secondary, carAssetId: car.id };
}

/**
 * The circuit a seed draws inside a region. Its own function so the pick can be checked over many
 * seeds without simulating a race for each one — under coverage that is the difference between a
 * millisecond and a timeout. An empty region would be a dead wheel, so it falls back to the whole
 * catalogue rather than throwing at the player.
 */
export function wheelCircuit(seed: string, region: WheelRegion = "all"): CityCircuit {
  const pool = circuitsInRegion(region);
  const catalogue = pool.length ? pool : CITY_CIRCUITS;
  return catalogue[hash(seed) % catalogue.length] ?? CITY_CIRCUITS[0];
}

/**
 * Runs the draw. The seed varies per launch, so the same participants entered twice give two
 * different orders — a draw that always answered the same would not be one.
 */
export function drawDestinyWheel(participants: WheelParticipant[], seed: string, region: WheelRegion = "all"): WheelDraw {
  if (participants.length < 2) {
    throw new Error("A draw needs at least two participants.");
  }

  const drawn = wheelCircuit(seed, region);
  const circuit = withRoute(drawn);
  // CITY_CIRCUITS is built by mapping over the identities, so the two stay index-aligned. The
  // identity is what `raceInputFromCircuit` types against; the circuit is what the map draws.
  const identity = CITY_CIRCUIT_IDENTITIES[CITY_CIRCUITS.indexOf(drawn)] ?? CITY_CIRCUIT_IDENTITIES[0];
  const liveries: Record<string, TeamLivery> = {};
  participants.forEach((participant, index) => {
    liveries[participant.id] = wheelLivery(index, participant);
  });
  const grid = [...participants].sort((left, right) => hash(`${seed}:grid:${left.id}`) - hash(`${seed}:grid:${right.id}`) || left.id.localeCompare(right.id));

  const result = simulateRace({
    seed,
    grandPrixName: circuit.city,
    traits: circuit.traits,
    laps: circuit.laps,
    trackZones: circuit.trackZones,
    speedProfile: circuit.speedProfile,
    pitLaneProgress: circuit.pitLaneProgress,
    ...raceInputFromCircuit(identity),
    participants: grid.map((participant, index) => ({
      teamId: participant.id,
      teamName: participant.name,
      kind: "bot" as const,
      // Everyone starts level, but the seed draws a new grid on every launch.
      standingsRank: index + 1,
      botArchetype: ARCHETYPES[hash(`${seed}:${participant.id}`) % ARCHETYPES.length]!,
      decision: { approach: "balanced" as const, preparation: "speed" as const }
    }))
  });

  return { circuit, result, liveries };
}

/**
 * The draw as a link. Everyone entered plus the circuit pool, so a group can set the list up on one
 * screen and everyone else opens the same grid — the point of the wheel is that the people in it are
 * in the room, and they are rarely at the same keyboard.
 *
 * Names and pool only: colours are not carried, since a shared list is re-coloured at the far end
 * anyway and hex in a query makes the link unreadable at a glance.
 */
export function wheelShareSearch(participants: WheelParticipant[], region: WheelRegion): string {
  const search = new URLSearchParams();
  for (const participant of participants) search.append("name", participant.name);
  if (region !== "all") search.set("region", region);
  return `?${search.toString()}`;
}

export function wheelShareLink(participants: WheelParticipant[], region: WheelRegion, origin: string): string {
  return `${origin.replace(/\/$/, "")}/arcade/wheel${wheelShareSearch(participants, region)}`;
}

/** What a shared link asks for, or null when the URL carries no list. */
export function wheelShareFromSearch(search: string, max = 16): { names: string[]; region: WheelRegion } | null {
  const params = new URLSearchParams(search);
  const names = params
    .getAll("name")
    .map((name) => name.trim().slice(0, 24))
    .filter(Boolean)
    .slice(0, max);
  if (!names.length) return null;
  const region = params.get("region");
  const pools: WheelRegion[] = ["all", ...regionsWithCircuits()];
  return { names, region: pools.includes(region as WheelRegion) ? (region as WheelRegion) : "all" };
}

function hash(value: string) {
  let hashed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hashed ^= value.charCodeAt(index);
    hashed = Math.imul(hashed, 16777619);
  }
  return Math.abs(hashed);
}
