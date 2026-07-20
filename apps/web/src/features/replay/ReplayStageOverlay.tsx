import type { RaceDecision, RaceResult, TeamLivery, Weather } from "@cr-league/shared";
import { type ReactNode, useId, useState } from "react";
import type { CityCircuit } from "../../app/circuits.js";
import type { Translator } from "../../app/helpers.js";
import type { TranslationKey } from "../../i18n/index.js";
import { MapTraitsPanel, type MapTraitImpacts } from "../CircuitMap.js";
import { MapPlanPanel } from "../MapPlanPanel.js";
import { PositionBadge } from "../PositionBadge.js";
import { CountryBadge, VisualIcon, type VisualIconName } from "../VisualIcon.js";
import { ReplayProgress, type ReplayTimelineMarker } from "./ReplayProgress.js";
import { ReplayTower } from "./ReplayTower.js";
import type { ReplaySpeed } from "./useReplayClock.js";

const REPLAY_SPEEDS = [0.5, 1, 2, 4] as const;

type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string };

export function ReplayStageOverlay({
  circuit,
  liveLap,
  liveWeather,
  circuitDistance,
  planDecision,
  traitImpacts,
  resolvedWeather,
  activeMoment,
  activeDirector,
  playerFocus,
  overlayActions,
  playing,
  speed,
  driverFocus,
  replayEnd,
  clockSeconds,
  progressRef,
  rangeRef,
  scrubbingRef,
  towerReplacement,
  tower,
  playerTeamId,
  positionPops,
  teamLiveries,
  markers,
  directorMarkers,
  replayPercentAtRaceProgress,
  tt,
  setPlaying,
  setSpeed,
  setDriverFocus,
  restart,
  seek,
  onOpenReport,
  onClose,
  closeLabel
}: {
  circuit: CityCircuit;
  liveLap: number;
  liveWeather: Weather;
  circuitDistance: string;
  planDecision?: RaceDecision;
  traitImpacts: MapTraitImpacts;
  resolvedWeather: RaceResult["resolvedWeather"];
  activeMoment?: { player: boolean; lap: number; icon: VisualIconName; context: string; detail: string; impact: string };
  activeDirector?: { type: string; lap: number; title: string; detail: ReactNode };
  playerFocus?: { position: number; delta: number; gapItems: Array<{ label: string; value: string }>; latestDetail?: ReactNode };
  overlayActions?: ReactNode;
  playing: boolean;
  speed: ReplaySpeed;
  driverFocus: boolean;
  replayEnd: number;
  clockSeconds: number;
  progressRef: React.RefObject<HTMLDivElement | null>;
  rangeRef: React.RefObject<HTMLInputElement | null>;
  scrubbingRef: { current: boolean };
  towerReplacement?: ReactNode;
  tower: ReplayTowerEntry[];
  playerTeamId?: string;
  positionPops: Record<string, { delta: number; key: number }>;
  teamLiveries: Record<string, TeamLivery>;
  markers: ReplayTimelineMarker[];
  directorMarkers: ReplayTimelineMarker[];
  replayPercentAtRaceProgress: (progress: number) => number;
  tt: Translator;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: ReplaySpeed) => void;
  setDriverFocus: (focused: boolean) => void;
  restart: () => void;
  seek: (time: number) => void;
  onOpenReport?: () => void;
  onClose?: () => void;
  closeLabel?: string;
}) {
  const directorTitle = tt(activeDirector?.type === "qualifying_start" || activeDirector?.type === "qualifying_pace" || activeDirector?.type === "qualifying_final" ? "replay_director_chrono_title" : "replay_director_title");
  const seekValueText = `${tt("unit_lap")} ${liveLap}/${circuit.laps}, ${Math.round(clockSeconds)}s`;

  return (
    <>
      <div className="map-info-stack">
        <div className="map-status">
          <span className="circuit-city">
            <CountryBadge country={circuit.country} /> {circuit.city}
          </span>
          <strong>{tt(circuit.layoutKey)}</strong>
          <small>
            {tt("unit_lap")} {liveLap}/{circuit.laps}
          </small>
          <small className="map-weather-readout">
            <VisualIcon name={liveWeather} />
            <span>{tt(`weather_${liveWeather}` as TranslationKey)}</span>
          </small>
          <small>{circuitDistance}</small>
        </div>
        <MapPlanPanel decision={planDecision} tt={tt} />
        <MapTraitsPanel traits={liveTraits(circuit.traits, liveWeather, liveLap)} impacts={traitImpacts} tt={tt} />
      </div>
      {activeMoment ? (
        <div className={activeMoment.player ? "replay-moment-notification player" : "replay-moment-notification"} role="status" aria-live="polite">
          <span className="lap-marker">L{activeMoment.lap}</span>
          <span className="moment-main">
            <strong>
              <VisualIcon name={activeMoment.icon} /> {activeMoment.context}
            </strong>
            <small>{activeMoment.detail}</small>
          </span>
          <span className="moment-impact">{activeMoment.impact}</span>
        </div>
      ) : null}
      {!overlayActions ? (
        <div className="replay-info-stack">
          {activeDirector ? (
            <div className={`replay-director-panel ${activeDirector.type}`}>
              <span>{directorTitle} · L{activeDirector.lap}</span>
              <strong>{activeDirector.title}</strong>
              <small>{activeDirector.detail}</small>
            </div>
          ) : null}
          {playerFocus ? (
            <div className="replay-player-focus-panel">
              <span>{tt("replay_player_focus")}</span>
              <strong>
                <PositionBadge position={playerFocus.position} /> {playerFocus.delta ? `(${playerFocus.delta > 0 ? "+" : ""}${playerFocus.delta})` : ""}
              </strong>
              {playerFocus.gapItems.length ? (
                <small className="replay-player-gaps">
                  {playerFocus.gapItems.map((item) => (
                    <span key={item.label}>
                      {item.label} <b>{item.value}</b>
                    </span>
                  ))}
                </small>
              ) : null}
              {playerFocus.latestDetail ? <small>{playerFocus.latestDetail}</small> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="replay-map-controls">
        <button
          type="button"
          className={playing ? "replay-playback-button playing" : "replay-playback-button paused"}
          aria-label={playing ? tt("action_pause") : tt("action_play")}
          title={playing ? tt("action_pause") : tt("action_play")}
          onClick={() => (!playing && clockSeconds >= replayEnd ? restart() : setPlaying(!playing))}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <button type="button" aria-label={tt("action_replay_restart")} title={tt("action_replay_restart")} onClick={restart}>
          ↻
        </button>
        <button
          type="button"
          aria-label="Focus driver"
          title="Focus driver"
          className={driverFocus ? "replay-focus-button active" : "replay-focus-button"}
          onClick={() => setDriverFocus(!driverFocus)}
        >
          <svg className="replay-focus-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 4H6a2 2 0 0 0-2 2v2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
            <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
            <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <ReplaySpeedMenu speed={speed} setSpeed={setSpeed} tt={tt} />
        {onOpenReport ? (
          <button type="button" className="replay-report-button" aria-label={tt("result_tab_report")} title={tt("result_tab_report")} onClick={onOpenReport}>
            <svg className="replay-report-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 3h9l3 3v15H6z" />
              <path d="M14 3v4h4" />
              <path d="M9 12h6" />
              <path d="M9 16h4" />
            </svg>
          </button>
        ) : null}
        {onClose ? (
          <button type="button" className="replay-close-button" aria-label={closeLabel ?? tt("action_close")} title={closeLabel ?? tt("action_close")} onClick={onClose}>
            {closeLabel ?? tt("action_close")}
          </button>
        ) : null}
      </div>
      {overlayActions && activeDirector ? (
        <div className="replay-overlay-director-slot">
          <div className={`replay-director-panel ${activeDirector.type}`}>
            <span>{directorTitle} · L{activeDirector.lap}</span>
            <strong>{activeDirector.title}</strong>
            <small>{activeDirector.detail}</small>
          </div>
        </div>
      ) : null}
      {overlayActions ? <div className="replay-overlay-stack"><div className="replay-overlay-actions">{overlayActions}</div></div> : null}
      {towerReplacement ?? <ReplayTower entries={tower} playerTeamId={playerTeamId} positionPops={positionPops} teamLiveries={teamLiveries} />}
      <ReplayProgress
        progressRef={progressRef}
        rangeRef={rangeRef}
        scrubbingRef={scrubbingRef}
        seekValueText={seekValueText}
        replayEnd={replayEnd}
        laps={circuit.laps}
        resolvedWeather={resolvedWeather}
        replayPercentAtRaceProgress={replayPercentAtRaceProgress}
        seek={seek}
        markers={markers}
        directorMarkers={directorMarkers}
        tt={tt}
      />
    </>
  );
}

function ReplaySpeedMenu({ speed, setSpeed, tt }: { speed: ReplaySpeed; setSpeed: (speed: ReplaySpeed) => void; tt: Translator }) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div className="replay-speed-menu" onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        className={open ? "replay-speed-trigger active" : "replay-speed-trigger"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${tt("replay_speed")} ×${speed}`}
        onClick={() => setOpen((current) => !current)}
      >
        ×{speed}
      </button>
      {open ? (
        <div id={listId} className="replay-speed-options" role="listbox" aria-label={tt("replay_speed")}>
          {REPLAY_SPEEDS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === speed}
              className={option === speed ? "selected" : undefined}
              onClick={() => {
                setSpeed(option);
                setOpen(false);
              }}
            >
              ×{option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function clampStat(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
}

function liveTraits(base: CityCircuit["traits"], weather: Weather, lap: number) {
  const rainGrip = weather === "heavy_rain" ? -12 : weather === "light_rain" ? -5 : 0;
  const lateRace = Math.max(0, lap - 1);
  return {
    grip: clampStat(base.grip + rainGrip),
    overtaking: clampStat(base.overtaking + (weather === "dry" ? 0 : 3)),
    energy: clampStat(base.energy - lateRace * 2 - (weather === "heavy_rain" ? 5 : 0))
  };
}
