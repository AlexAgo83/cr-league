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

/**
 * Everyone used to drive the same balanced race, which made a draw a procession: whoever led early
 * led to the flag four times in five. Giving each entry its own way of driving is the one lever the
 * wheel has — measured over 300 six-car draws, the circuit's overtaking trait and the tyre choice
 * both changed nothing, because the finishing time comes from the chrono engine's pace rather than
 * from on-track traits.
 *
 *                        led start to flag   leader changes   last-at-the-start on the podium
 *   one way of driving          22%               0.88                    42%
 *   three                       17%               1.01                    46%
 */
const WHEEL_APPROACHES = ["aggressive", "balanced", "prudent"] as const;

/** How one entry drives this draw. Exported because it is the whole of the change worth pinning. */
export function wheelApproach(seed: string, participantId: string): (typeof WHEEL_APPROACHES)[number] {
  return WHEEL_APPROACHES[hash(`${seed}:drive:${participantId}`) % WHEEL_APPROACHES.length]!;
}

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
export function wheelLivery(index: number, chosen?: Pick<WheelParticipant, "primary" | "secondary" | "carAssetId">): TeamLivery {
  const [primary, secondary] = WHEEL_PALETTE[index % WHEEL_PALETTE.length] ?? WHEEL_PALETTE[0];
  // Cars vary alongside colours so two neighbours on the grid never look the same.
  const car = CAR_ASSETS[index % CAR_ASSETS.length] ?? DEFAULT_CAR_ASSET;
  return { primary: chosen?.primary ?? primary, secondary: chosen?.secondary ?? secondary, carAssetId: chosen?.carAssetId ?? car.id };
}

/**
 * A fresh car and colours for everyone. The palette and the car list are walked from a random
 * offset rather than picked per entry, so nobody ends up with a neighbour's livery — the whole
 * point of the grid is telling six little cars apart at a glance.
 */
export function shuffleWheelLiveries(participants: WheelParticipant[]): WheelParticipant[] {
  // Never the offset the list is already on. A free offset meant a one-in-sixteen chance of pressing
  // Shuffle and watching nothing happen, which reads as a broken button rather than a fair draw.
  const first = participants[0];
  const currentCar = first?.carAssetId ? Math.max(0, CAR_ASSETS.findIndex((asset) => asset.id === first.carAssetId)) : 0;
  const currentColour = first?.primary ? Math.max(0, WHEEL_PALETTE.findIndex(([primary]) => primary === first.primary)) : 0;
  const colourOffset = nextOffset(currentColour, WHEEL_PALETTE.length);
  const carOffset = nextOffset(currentCar, CAR_ASSETS.length);
  const flipped = Math.random() < 0.5;
  return participants.map((participant, index) => {
    const [primary, secondary] = WHEEL_PALETTE[(colourOffset + index) % WHEEL_PALETTE.length] ?? WHEEL_PALETTE[0];
    return {
      ...participant,
      primary: flipped ? secondary : primary,
      secondary: flipped ? primary : secondary,
      carAssetId: (CAR_ASSETS[(carOffset + index) % CAR_ASSETS.length] ?? DEFAULT_CAR_ASSET).id
    };
  });
}

/** A random offset that is never the one already in use, so the shuffle always shows. */
function nextOffset(current: number, length: number): number {
  return length < 2 ? current : (current + 1 + Math.floor(Math.random() * (length - 1))) % length;
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
      decision: {
        approach: wheelApproach(seed, participant.id),
        preparation: "speed" as const
      }
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
  for (const participant of participants) {
    search.append("name", participant.name);
    // One `look` per name, in the same order: colours without their hash, then the car's index.
    // A link written before liveries travelled simply has no `look` params, and still opens.
    search.append("look", lookOf(participant));
  }
  if (region !== "all") search.set("region", region);
  return `?${search.toString()}`;
}

export function wheelShareLink(participants: WheelParticipant[], region: WheelRegion, origin: string): string {
  return `${origin.replace(/\/$/, "")}/arcade/wheel${wheelShareSearch(participants, region)}`;
}

export type SharedWheelEntry = { name: string; primary?: string; secondary?: string; carAssetId?: string };

/** What a shared link asks for, or null when the URL carries no list. */
export function wheelShareFromSearch(search: string, max = 16): { entries: SharedWheelEntry[]; region: WheelRegion } | null {
  const params = new URLSearchParams(search);
  const names = params.getAll("name").map((name) => name.trim().slice(0, 24));
  const looks = params.getAll("look");
  const entries = names
    .map((name, index) => ({ name, ...parseLook(looks[index]) }))
    .filter((entry) => Boolean(entry.name))
    .slice(0, max);
  if (!entries.length) return null;
  const region = params.get("region");
  const pools: WheelRegion[] = ["all", ...regionsWithCircuits()];
  return { entries, region: pools.includes(region as WheelRegion) ? (region as WheelRegion) : "all" };
}

function lookOf(participant: WheelParticipant): string {
  const index = participant.carAssetId ? CAR_ASSETS.findIndex((asset) => asset.id === participant.carAssetId) : -1;
  return [participant.primary ?? "", participant.secondary ?? ""].map((hex) => hex.replace("#", "")).concat(index >= 0 ? String(index) : "").join("-");
}

/** Anything malformed simply drops that field: a bad link should still open on the names it has. */
function parseLook(look: string | undefined): Omit<SharedWheelEntry, "name"> {
  if (!look) return {};
  const [primary, secondary, car] = look.split("-");
  const hex = (value: string | undefined) => (value && /^[0-9a-f]{6}$/i.test(value) ? `#${value.toLowerCase()}` : undefined);
  const asset = car !== undefined && car !== "" ? CAR_ASSETS[Number(car)] : undefined;
  return {
    ...(hex(primary) ? { primary: hex(primary)! } : {}),
    ...(hex(secondary) ? { secondary: hex(secondary)! } : {}),
    ...(asset ? { carAssetId: asset.id } : {})
  };
}

function hash(value: string) {
  let hashed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hashed ^= value.charCodeAt(index);
    hashed = Math.imul(hashed, 16777619);
  }
  return Math.abs(hashed);
}
