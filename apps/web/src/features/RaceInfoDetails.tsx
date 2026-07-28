import { useState } from "react";
import { useT } from "../i18n/index.js";
import { RACE_SEGMENTS, type RaceResult, type RaceSegment, type Weather } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { VisualIcon } from "./VisualIcon.js";

type InfoSubscreen = "weather" | "stats" | "legend";

export function RaceInfoDetails({
  title,
  body,
  segments,
  weatherForSegment
}: {
  title: string;
  body: string;
  segments: readonly RaceSegment[];
  weatherForSegment: (segment: RaceSegment) => Weather;
}) {
  const tt = useT();
  const [subscreen, setSubscreen] = useState<InfoSubscreen>("weather");
  const tabs: Array<{ item: InfoSubscreen; label: string }> = [
    { item: "weather", label: title },
    { item: "stats", label: tt("race_stats_title") },
    { item: "legend", label: tt("legend_title") }
  ];

  return (
    <section className="race-weather-legend" aria-label={tt("race_info_subscreen_label")}>
      <div className="race-info-switch" role="tablist" aria-label={tt("race_info_subscreen_label")}>
        {tabs.map(({ item, label }) => (
          <button key={item} type="button" role="tab" aria-selected={subscreen === item} className={subscreen === item ? "active" : undefined} onClick={() => setSubscreen(item)}>
            {label}
          </button>
        ))}
      </div>
      {subscreen === "weather" && <RaceWeatherSection body={body} segments={segments} weatherForSegment={weatherForSegment} />}
      {subscreen === "stats" && <RaceStatsExplainer />}
      {subscreen === "legend" && <RaceLegend />}
    </section>
  );
}

export function RaceInfoDetailsForResolvedWeather({ resolvedWeather }: { resolvedWeather: RaceResult["resolvedWeather"] }) {
  const tt = useT();
  return (
    <RaceInfoDetails
      title={tt("race_weather_info_title")}
      body={tt("race_weather_info_body")}
      segments={RACE_SEGMENTS}
      weatherForSegment={(segment) => resolvedWeather[segment]}
    />
  );
}

function RaceWeatherSection({
  body,
  segments,
  weatherForSegment
}: {
  body: string;
  segments: readonly RaceSegment[];
  weatherForSegment: (segment: RaceSegment) => Weather;
}) {
  const tt = useT();
  return (
    <div className="race-weather-section" role="tabpanel">
      <p>{body}</p>
      <ol className="race-weather-phase-list">
        {segments.map((segment) => (
          <li key={segment}>
            <span>
              <VisualIcon name={weatherForSegment(segment)} />
              {tt(`segment_${segment}` as TranslationKey)}
            </span>
            <strong>{tt(`weather_${weatherForSegment(segment)}` as TranslationKey)}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RaceLegend() {
  const tt = useT();
  return (
    <div className="race-info-subpanel" role="tabpanel">
      <p>
        <span><span className="replay-legend-dot replay-legend-marker" aria-hidden="true" /> {tt("replay_pace_marker_legend")}</span>
        <span><span className="replay-legend-marker player" aria-hidden="true" /> {tt("replay_player_marker_legend")}</span>
        <span><span className="replay-legend-marker director" aria-hidden="true" /> {tt("replay_director_marker_legend")}</span>
        <span><span className="replay-legend-marker pit-stop" aria-hidden="true" /> {tt("replay_pit_marker_legend")}</span>
        <span><VisualIcon name="light_rain" /> {tt("replay_weather_phase_legend")}</span>
        <span><span className="replay-legend-finish-line" aria-hidden="true" /> {tt("replay_finish_line_legend")}</span>
      </p>
    </div>
  );
}

function RaceStatsExplainer() {
  const tt = useT();
  const rows: Array<{ key: TranslationKey; hint: TranslationKey }> = [
    { key: "engine_stat_pace", hint: "engine_stat_pace_hint" },
    { key: "engine_stat_control", hint: "engine_stat_control_hint" },
    { key: "engine_stat_reliability", hint: "engine_stat_reliability_hint" },
    { key: "engine_stat_weather", hint: "engine_stat_weather_hint" },
    { key: "engine_stat_aggression", hint: "engine_stat_aggression_hint" }
  ];

  return (
    <div className="race-info-subpanel race-stats-explainer" role="tabpanel">
      <p>
        {rows.map((row) => (
          <span key={row.key}>
            <b>{tt(row.key)}</b>
            {tt(row.hint)}
          </span>
        ))}
      </p>
    </div>
  );
}
