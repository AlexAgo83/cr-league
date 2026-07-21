import { RACE_SEGMENTS, type RaceResult } from "@cr-league/shared";
import type { RefObject } from "react";
import type { TranslationKey } from "../../i18n/index.js";
import type { Translator } from "../../app/helpers.js";
import { VisualIcon } from "../VisualIcon.js";

export type ReplayTimelineMarker = {
  id: string;
  className: string;
  left: string;
  title: string;
  time: number;
};

export function ReplayProgress({
  progressRef,
  rangeRef,
  scrubbingRef,
  seekValueText,
  replayEnd,
  laps,
  resolvedWeather,
  replayPercentAtRaceProgress,
  seek,
  markers,
  directorMarkers,
  tt
}: {
  progressRef: RefObject<HTMLDivElement | null>;
  rangeRef: RefObject<HTMLInputElement | null>;
  scrubbingRef: { current: boolean };
  seekValueText: string;
  replayEnd: number;
  laps: number;
  resolvedWeather: RaceResult["resolvedWeather"];
  replayPercentAtRaceProgress: (progress: number) => number;
  seek: (time: number) => void;
  markers: ReplayTimelineMarker[];
  directorMarkers: ReplayTimelineMarker[];
  tt: Translator;
}) {
  const phaseSummary = RACE_SEGMENTS.map((segment) => `${tt(`segment_${segment}` as TranslationKey)}: ${tt(`weather_${resolvedWeather[segment]}` as TranslationKey)}`).join(" · ");

  return (
    <>
      <div className="replay-progress">
        <div ref={progressRef} className="replay-progress-fill" />
        <input
          ref={rangeRef}
          type="range"
          className="replay-progress-input"
          aria-label={tt("replay_seek")}
          aria-valuetext={seekValueText}
          min={0}
          max={replayEnd}
          step={replayEnd / 100}
          defaultValue={0}
          onPointerDown={() => {
            scrubbingRef.current = true;
          }}
          onPointerUp={(event) => {
            scrubbingRef.current = false;
            seek(Number(event.currentTarget.value));
          }}
          onPointerCancel={() => {
            scrubbingRef.current = false;
          }}
          onChange={(event) => seek(Number(event.target.value))}
        />
        {Array.from({ length: laps }, (_, index) => (
          <span key={index + 1} className="replay-tick" style={{ left: `${replayPercentAtRaceProgress((index + 1) / laps)}%` }} />
        ))}
        {RACE_SEGMENTS.map((segment, index) => (
          <span
            key={segment}
            className="replay-weather"
            style={{ left: `${replayPercentAtRaceProgress((index + 0.5) / RACE_SEGMENTS.length)}%` }}
            title={`${tt("replay_weather_actual_label")}: ${tt(`segment_${segment}` as TranslationKey)} - ${tt(`weather_${resolvedWeather[segment]}` as TranslationKey)}`}
          >
            <VisualIcon name={resolvedWeather[segment]} />
          </span>
        ))}
        {markers.map((marker) => (
          <button
            key={marker.id}
            type="button"
            className={marker.className}
            style={{ left: marker.left }}
            title={marker.title}
            aria-label={marker.title}
            onClick={() => seek(marker.time)}
          />
        ))}
        {directorMarkers.map((marker) => (
          <button
            key={marker.id}
            type="button"
            className={marker.className}
            style={{ left: marker.left }}
            title={marker.title}
            aria-label={marker.title}
            onClick={() => seek(marker.time)}
          />
        ))}
      </div>
      <div className="replay-progress-legend" aria-label={tt("replay_timeline_legend_label")}>
        <span>
          <b>{tt("replay_weather_actual_label")}</b> {phaseSummary}
        </span>
        <span>
          <i className="replay-legend-dot" aria-hidden="true" /> {tt("replay_pace_marker_legend")}
        </span>
        <span>
          <VisualIcon name="light_rain" /> {tt("replay_weather_phase_legend")}
        </span>
      </div>
    </>
  );
}
