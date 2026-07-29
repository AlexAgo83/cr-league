import type { RaceEvent, RaceEventType } from "./race.js";

/**
 * Reaction emotes shown above a car during the replay.
 *
 * Only the events that happen *to the car* earn a reaction. Narration and bookkeeping return
 * nothing: the race director banner, the key moments list and the report already tell those, and
 * a measured 8-lap race emits 27 events across 5 cars — enough to make the map unreadable if
 * every one of them popped.
 */
export type EmoteId =
  | "scare"
  | "relief"
  | "fire"
  | "angry"
  | "eyeing"
  | "pressure"
  | "dizzy"
  | "strong"
  | "empty-battery"
  | "warning";

/** Every declared emote, so callers can assert an asset exists for each. */
export const EMOTE_IDS: readonly EmoteId[] = [
  "scare",
  "relief",
  "fire",
  "angry",
  "eyeing",
  "pressure",
  "dizzy",
  "strong",
  "empty-battery",
  "warning"
];

/**
 * null means "this event never emotes". Listing every event type explicitly rather than falling
 * back to a default is what makes the parametrized test able to catch a new event type that
 * nobody classified.
 */
const EMOTE_BY_EVENT: Record<RaceEventType, EmoteId | null> = {
  mechanical_scare: "scare",
  mechanic_save: "relief",
  best_sector: "fire",
  personal_record: "fire",
  pace_gain: "fire",
  late_push_gain: "fire",
  rival_overtake: "angry",
  overtake_setup: "eyeing",
  under_pressure: "pressure",
  dense_traffic: "pressure",
  minor_error: "dizzy",
  wrong_weather_bet: "dizzy",
  defense_success: "strong",
  held_position: "strong",
  weather_gamble_paid: "strong",
  battery_critical: "empty-battery",
  penalty_risk: "warning",
  card_triggered: "fire",
  favorable_weather: null,
  weather_change: null,
  sponsor_payout: null,
  pit_stop: null,
  pit_imminent: null,
  pit_exit: null,
  race_note: null,
  finish: null
};

export function emoteForEvent(event: Pick<RaceEvent, "type">): EmoteId | null {
  return EMOTE_BY_EVENT[event.type] ?? null;
}

export type EmoteCandidate = {
  teamId: string;
  emote: EmoteId;
  /** Position along the replay trace, so the pop lands where the incident happened. */
  progress: number;
  severity: RaceEvent["severity"];
};

export const EMOTE_COOLDOWN = 0.08;

type EmoteSourceEvent = Pick<RaceEvent, "type" | "teamId" | "severity" | "order"> & {
  traceProgress?: number;
  trackProgress?: number;
};

/**
 * Reactions for one race, already thinned.
 *
 * The cooldown is expressed in trace progress rather than seconds so it holds whatever speed the
 * replay is played at. Within one window a car reacts once; a major event displaces a minor one,
 * which is what collapses the consecutive pit_imminent / pit_stop / pit_exit burst of a single
 * pit stop down to nothing and keeps the real incident that follows it.
 */
export function emoteCandidates(events: readonly EmoteSourceEvent[], cooldown = EMOTE_COOLDOWN): EmoteCandidate[] {
  const ordered = [...events].sort((left, right) => left.order - right.order);
  const kept: EmoteCandidate[] = [];
  const lastByTeam = new Map<string, number>();

  for (const event of ordered) {
    const emote = emoteForEvent(event);
    if (!emote) continue;
    const progress = event.traceProgress ?? event.trackProgress;
    if (progress === undefined || !Number.isFinite(progress)) continue;

    const previousIndex = lastByTeam.get(event.teamId);
    if (previousIndex !== undefined) {
      const previous = kept[previousIndex]!;
      if (Math.abs(progress - previous.progress) < cooldown) {
        // Same window: a major reaction replaces a minor one, otherwise the first one stands.
        if (event.severity === "major" && previous.severity !== "major") {
          kept[previousIndex] = { teamId: event.teamId, emote, progress, severity: event.severity };
        }
        continue;
      }
    }

    lastByTeam.set(event.teamId, kept.length);
    kept.push({ teamId: event.teamId, emote, progress, severity: event.severity });
  }

  return kept;
}
