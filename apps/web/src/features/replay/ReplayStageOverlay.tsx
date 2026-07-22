import { type RaceDecision, type RaceResult, type TeamLivery, type Weather } from "@cr-league/shared";
import { type ReactNode, useId, useState } from "react";
import type { CityCircuit } from "../../app/circuits.js";
import type { Translator } from "../../app/helpers.js";
import type { TranslationKey } from "../../i18n/index.js";
import { MapTraitsPanel, type MapTraitImpacts } from "../CircuitMap.js";
import { MapPlanPanel } from "../MapPlanPanel.js";
import { Modal } from "../Modal.js";
import { PositionBadge } from "../PositionBadge.js";
import { RaceInfoDetailsForResolvedWeather } from "../RaceInfoDetails.js";
import { CountryBadge, VisualIcon, type VisualIconName } from "../VisualIcon.js";
import { ReplayProgress, type ReplayTimelineMarker } from "./ReplayProgress.js";
import { ReplayTower } from "./ReplayTower.js";
import type { ReplaySpeed } from "./useReplayClock.js";

const REPLAY_SPEEDS = [0.5, 1, 2, 4] as const;

type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string; decision?: RaceDecision };

function PlaybackIcon({ playing }: { playing: boolean }) {
  return (
    <svg className="replay-playback-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {playing ? (
        <>
          <rect x="7" y="5" width="3.5" height="14" rx="1" />
          <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
        </>
      ) : (
        <path d="M8 5v14l11-7z" />
      )}
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg className="replay-restart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 7h6a5 5 0 1 1-4.3 7.55" />
      <path d="M7 7V3" />
      <path d="M7 7h4" />
    </svg>
  );
}

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
  replayMode,
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
  onOpenTowerReport,
  onOpenPlan,
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
  playerFocus?: { position: number; delta: number; gapItems: Array<{ label: string; value: string }> };
  replayMode: "race" | "qualifying";
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
  onOpenTowerReport?: () => void;
  onOpenPlan?: () => void;
  onClose?: () => void;
  closeLabel?: string;
}) {
  const directorTitle = tt(activeDirector?.type === "qualifying_start" || activeDirector?.type === "qualifying_pace" || activeDirector?.type === "qualifying_final" ? "replay_director_chrono_title" : "replay_director_title");
  const playerFocusTitle = replayMode === "qualifying" ? tt("replay_player_focus_chrono") : tt("replay_player_focus");
  const seekValueText = `${tt("unit_lap")} ${liveLap}/${circuit.laps}, ${Math.round(clockSeconds)}s`;
  const [weatherInfoOpen, setWeatherInfoOpen] = useState(false);

  return (
    <>
      {weatherInfoOpen ? <ReplayWeatherModal resolvedWeather={resolvedWeather} tt={tt} onClose={() => setWeatherInfoOpen(false)} /> : null}
      <div className="map-info-stack">
        <div className="map-status">
          <span className="circuit-city">
            <CountryBadge country={circuit.country} /> {circuit.city}
          </span>
          <strong>{tt(circuit.layoutKey)}</strong>
          <small className="map-laps-readout">
            <VisualIcon name="laps" />
            {tt("unit_lap")} {liveLap}/{circuit.laps}
          </small>
          <small className="map-distance-readout">
            <VisualIcon name="distance" />
            {circuitDistance}
          </small>
          <small className="map-weather-readout">
            <VisualIcon name={liveWeather} />
            <span>{tt(`weather_${liveWeather}` as TranslationKey)}</span>
          </small>
          <button className="map-plan-edit-button map-weather-info-button" type="button" aria-label={tt("race_weather_info_title")} title={tt("race_weather_info_title")} onClick={() => setWeatherInfoOpen(true)}>
            {tt("action_info")}
          </button>
        </div>
        <div className="map-plan-performance">
          <MapPlanPanel decision={planDecision} editLabel={tt("action_view_plan")} onEdit={onOpenPlan} tt={tt} />
          <MapTraitsPanel traits={liveTraits(circuit.traits, liveWeather, liveLap)} impacts={traitImpacts} tt={tt} />
        </div>
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
              <span>{playerFocusTitle}</span>
              <small className="replay-player-gaps">
                <span className="position" aria-label={`P${playerFocus.position}`} title={`P${playerFocus.position}`}>
                  <PositionBadge position={playerFocus.position} />
                </span>
                {playerFocus.gapItems.map((item, index) => (
                  <span key={item.label} className={index === 0 ? "ahead" : "behind"} aria-label={`${item.label} ${item.value}`} title={`${item.label} ${item.value}`}>
                    <i aria-hidden="true" />
                    <b><GapValue value={item.value} /></b>
                  </span>
                ))}
              </small>
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
          <PlaybackIcon playing={playing} />
        </button>
        <button type="button" aria-label={tt("action_replay_restart")} title={tt("action_replay_restart")} onClick={restart}>
          <RestartIcon />
        </button>
        <button
          type="button"
          aria-label={tt("action_focus_driver")}
          title={tt("action_focus_driver")}
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
            <span className="replay-close-label">{closeLabel ?? tt("action_close")}</span>
            <span className="replay-close-mark" aria-hidden="true">×</span>
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
      {towerReplacement ?? (
        <ReplayTower
          entries={tower}
          playerTeamId={playerTeamId}
          positionPops={positionPops}
          title={tt("result_final_classification")}
          onReport={onOpenTowerReport}
          reportLabel={tt("action_view_plan").split(" ")[0] ?? tt("result_tab_report")}
          teamLiveries={teamLiveries}
        />
      )}
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

function ReplayWeatherModal({ resolvedWeather, tt, onClose }: { resolvedWeather: RaceResult["resolvedWeather"]; tt: Translator; onClose: () => void }) {
  return (
    <Modal label={tt("race_gp_info_title")} closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <h2>{tt("race_gp_info_title")}</h2>
      <RaceInfoDetailsForResolvedWeather resolvedWeather={resolvedWeather} tt={tt} />
    </Modal>
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

function GapValue({ value }: { value: string }) {
  return value.endsWith("s") ? <>{value.slice(0, -1)}<span className="replay-gap-unit">s</span></> : value;
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
