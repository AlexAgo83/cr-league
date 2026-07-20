import type { TranslationKey } from "../../i18n/index.js";
import { eventReplayText, type RaceEvent, type Translator } from "../../app/helpers.js";
import type { VisualIconName } from "../VisualIcon.js";

export function momentCard(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  const team = names.get(event.teamId) ?? "";
  const isMiniInfo = event.tags.includes("mini_info") || event.type === "race_note";
  const qualifyingTag = event.tags.find((tag) => tag === "qualifying_start" || tag === "qualifying_pace" || tag === "qualifying_final");
  const context = qualifyingTag
    ? tt(`event_${qualifyingTag}` as TranslationKey)
    : event.cardId
      ? tt(`card_${event.cardId}` as TranslationKey)
      : event.type === "weather_change"
        ? tt("event_weather_change")
        : event.type === "pit_stop"
          ? tt("event_pit_stop")
          : isMiniInfo
            ? tt(`event_${event.type}` as TranslationKey)
            : team;
  const impact = event.positionDelta
    ? `${event.positionDelta > 0 ? "+" : ""}${event.positionDelta} ${event.cardId ? tt("replay_moment_boost") : tt("replay_moment_position")}`
    : event.type === "pit_stop"
      ? tt("replay_director_pit_stop")
      : qualifyingTag
        ? tt("event_qualifying_split")
        : event.severity === "major"
          ? tt("event_major")
          : tt("event_ambience");
  const icon: VisualIconName = event.tags.includes("weather") || event.type === "weather_change" ? "light_rain" : event.type === "pit_stop" ? "energy" : event.cardId ? "card" : event.positionDelta > 0 ? "position" : "dot";
  return {
    icon,
    context,
    team: isMiniInfo && !qualifyingTag ? "" : team,
    text: eventReplayText(event, names, tt),
    impact
  };
}
