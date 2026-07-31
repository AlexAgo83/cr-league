import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useCircuitRoutesReady } from "../../app/circuitRoutes/index.js";
import { useT, type TranslationKey } from "../../i18n/index.js";
import { SetupBackButton } from "../../app/SetupViews.js";
import { regionsWithCircuits, withRoute } from "../../app/circuits.js";
import { BoardIcon } from "../VisualIcon.js";
import { TeamCar } from "../TeamCar.js";
import { Modal } from "../Modal.js";
import { CAR_ASSETS } from "../carAssets.js";
import {
  addWheelParticipant,
  loadWheelParticipants,
  loadWheelRegion,
  recolourWheelParticipant,
  removeWheelParticipant,
  saveWheelParticipants,
  saveWheelRegion,
  WHEEL_MAX_PARTICIPANTS,
  WHEEL_MIN_PARTICIPANTS,
  type WheelParticipant
} from "./arcadeStorage.js";
import { drawDestinyWheel, shuffleWheelLiveries, wheelLivery, wheelShareFromSearch, wheelShareLink, type WheelDraw, type WheelRegion } from "./destinyWheel.js";
import { copyText } from "../../app/appStorage.js";
import { finishTimes } from "../replay/replayMath.js";

const ReplayView = lazy(() => import("../ReplayView.js").then((module) => ({ default: module.ReplayView })));

/**
 * The whole game lives here: the participant list, the race, the order. It holds no LeagueState
 * and touches no campaign slot, so nothing about it needs to reach App.
 */
export function DestinyWheelView({ onBack, onRacingChange }: { onBack: () => void; onRacingChange?: (racing: boolean) => void }) {
  const tt = useT();
  // A shared link wins over whatever this browser had saved: someone sent this list on purpose.
  const shared = useMemo(() => wheelShareFromSearch(window.location.search, WHEEL_MAX_PARTICIPANTS), []);
  const [participants, setParticipants] = useState<WheelParticipant[]>(() =>
    shared ? shared.entries.map((entry, index) => ({ id: `wheel-shared-${index}`, ...entry })) : loadWheelParticipants()
  );
  const [name, setName] = useState("");
  const [region, setRegion] = useState<WheelRegion>(() => shared?.region ?? loadWheelRegion());
  const [shareCopied, setShareCopied] = useState(false);
  /** The participant whose car is being chosen, if any. */
  const [pickingCarFor, setPickingCarFor] = useState<string | null>(null);
  const [draw, setDraw] = useState<WheelDraw | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  /**
   * Same reason as the duel: a draw launched before the route chunk lands would carry an empty
   * polyline for the whole race. The draw itself does not depend on it — the simulation reads track
   * length and speed profile, not the drawn line — so re-taking it only affects what is drawn.
   */
  const routesReady = useCircuitRoutesReady();
  const drawnCircuit = useMemo(() => (draw && routesReady ? withRoute(draw.circuit) : null), [draw, routesReady]);
  /** Finishing times for the order screen. Above the early returns, like every other hook. */
  const orderTimes = useMemo(() => (draw ? finishTimes(draw.result, draw.result.replayTrace ?? []) : null), [draw]);
  const canRace = participants.length >= WHEEL_MIN_PARTICIPANTS;
  const racing = Boolean(draw) && !showOrder;
  useEffect(() => {
    onRacingChange?.(racing);
  }, [onRacingChange, racing]);

  function launch() {
    if (!canRace) return;
    // Persisted on launch, as the entry is validated by racing it.
    saveWheelParticipants(participants);
    // A new seed per launch, so the same names twice give two different orders.
    saveWheelRegion(region);
    setDraw(drawDestinyWheel(participants, `wheel-${Date.now()}-${participants.length}`, region));
    setShowOrder(false);
  }

  async function share() {
    await copyText(wheelShareLink(participants, region, window.location.origin));
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2400);
  }

  /* Before the launch button in both places, because a group sets the list up together and then
     someone races it: sharing is what happens just before, not after. */
  const shareButton = (
    <button type="button" className="secondary-button wheel-share" disabled={!participants.length} onClick={share}>
      {/* The icon the app already uses for handing a league to someone else. */}
      <BoardIcon className="wheel-share-icon" name="join-league" />
      {tt(shareCopied ? "wheel_share_copied" : "wheel_share")}
    </button>
  );

  function add() {
    const next = addWheelParticipant(participants, name);
    if (next !== participants) setName("");
    setParticipants(next);
  }

  if (draw && racing) {
    return (
      <div className="wheel-race">
        <Suspense fallback={null}>
          {/* No plan, decision or payoff inputs: those surfaces are absent rather than disabled. */}
          <ReplayView
            result={draw.result}
            circuit={drawnCircuit ?? draw.circuit}
            playerTeamId={undefined}
            teamLiveries={draw.liveries}
            titleKey="wheel_kicker"
            explainerKey="wheel_intro"
            showIntro={false}
            showPerformancePanel={false}
            // "Final classification" over a live order would give the draw away before the flag.
            towerTitleKey="wheel_running_order"
            closeLabel={tt("wheel_result_title")}
            onClose={() => setShowOrder(true)}
          />
        </Suspense>
      </div>
    );
  }

  /* The winner's time, then each car's gap to the one ahead — the reading the running order gives
     during the race, so the flag says the same thing as the screen it came from. Race seconds, not
     scaled to circuit distance: the map speaks in these and a party game has no use for the other.
     Computed once per draw rather than per row. */
  function orderGap(index: number) {
    if (!draw || !orderTimes) return "";
    const time = orderTimes.times[draw.result.classification[index]!.teamId] ?? orderTimes.leader;
    if (index === 0) return `${time.toFixed(1)}s`;
    const ahead = orderTimes.times[draw.result.classification[index - 1]!.teamId] ?? orderTimes.leader;
    return `+${Math.max(0, time - ahead).toFixed(1)}s`;
  }

  if (draw) {
    return (
      <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="wheel-result-title">
        <div className="panel setup-main-panel setup-hero-panel arcade-hero-panel">
          <span className="section-kicker">{tt("wheel_result_kicker")}</span>
          <h1 id="wheel-result-title">{tt("wheel_result_title")}</h1>
          <p className="status">{draw.circuit.city}</p>
        </div>
        <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
          <ol className="wheel-order">
            {draw.result.classification.map((entry, index) => (
              <li key={entry.teamId} className={index === 0 ? "wheel-order-row wheel-order-winner" : "wheel-order-row"}>
                <span className="wheel-order-rank">{index + 1}</span>
                <TeamCar className="wheel-order-car" livery={draw.liveries[entry.teamId] ?? wheelLivery(index)} />
                <strong>{entry.teamName}</strong>
                <small className="wheel-order-gap">{orderGap(index)}</small>
              </li>
            ))}
          </ol>
          {/* Two rows on purpose, both flush right: four buttons never fit on one line here, and left
              to wrap they broke three-and-one with the stray on its own. Each row pairs a way back
              with a way on, so the two things you can do next sit under each other on the right. */}
          <div className="actions arcade-actions">
            <button type="button" className="secondary-button" onClick={() => setDraw(null)}>
              {tt("wheel_back_to_entry")}
            </button>
            {shareButton}
          </div>
          <div className="actions arcade-actions">
            <button type="button" className="secondary-button" onClick={onBack}>
              {tt("wheel_back_to_catalogue")}
            </button>
            <button type="button" className="primary-button" onClick={launch}>
              {tt("wheel_draw_again")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="wheel-title">
      <div className="panel setup-main-panel setup-hero-panel arcade-hero-panel">
        <SetupBackButton onBack={onBack} />
        <span className="section-kicker">{tt("wheel_kicker")}</span>
        <h1 id="wheel-title">{tt("wheel_title")}</h1>
        <p className="status">{tt("wheel_intro")}</p>
      </div>
      {pickingCarFor ? (
        <WheelCarPicker
          participants={participants}
          participantId={pickingCarFor}
          onClose={() => setPickingCarFor(null)}
          onPick={(carAssetId) => {
            setParticipants(participants.map((entry) => (entry.id === pickingCarFor ? { ...entry, carAssetId } : entry)));
            setPickingCarFor(null);
          }}
        />
      ) : null}
      <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
        <form
          className="wheel-add"
          onSubmit={(event) => {
            event.preventDefault();
            add();
          }}
        >
          <input
            aria-label={tt("wheel_add_placeholder")}
            placeholder={tt("wheel_add_placeholder")}
            maxLength={24}
            value={name}
            disabled={participants.length >= WHEEL_MAX_PARTICIPANTS}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <button type="submit" className="secondary-button" disabled={!name.trim() || participants.length >= WHEEL_MAX_PARTICIPANTS}>
            {tt("wheel_add_action")}
          </button>
        </form>

        {participants.length ? (
          <ul className="wheel-participants">
            {participants.map((participant, index) => (
              <li key={participant.id} className="wheel-participant">
                <button
                  type="button"
                  className="wheel-participant-car-button"
                  aria-label={tt("wheel_pick_car", { name: participant.name })}
                  onClick={() => setPickingCarFor(participant.id)}
                >
                  <TeamCar className="wheel-participant-car" livery={wheelLivery(index, participant)} />
                </button>
                <strong>{participant.name}</strong>
                <span className="wheel-participant-colours">
                  {(["primary", "secondary"] as const).map((slot) => (
                    <input
                      key={slot}
                      type="color"
                      aria-label={tt(slot === "primary" ? "garage_livery_primary" : "garage_livery_secondary")}
                      value={wheelLivery(index, participant)[slot]}
                      onChange={(event) => setParticipants(recolourWheelParticipant(participants, participant.id, { [slot]: event.target.value }))}
                    />
                  ))}
                </span>
                <button
                  type="button"
                  className="secondary-button wheel-participant-remove"
                  aria-label={tt("wheel_remove", { name: participant.name })}
                  onClick={() => setParticipants(removeWheelParticipant(participants, participant.id))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="wheel-empty">
            <BoardIcon className="setup-choice-icon" name="empty-card-slot" />
            {tt("wheel_empty")}
          </p>
        )}

        <small className="wheel-count">{tt("wheel_count", { count: participants.length, max: WHEEL_MAX_PARTICIPANTS })}</small>

        <label className="wheel-region">
          <span>{tt("wheel_region_label")}</span>
          <select
            className="circuit-filter-region"
            value={region}
            onChange={(event) => setRegion(event.target.value as WheelRegion)}
          >
            <option value="all">{tt("circuit_region_all")}</option>
            {regionsWithCircuits().map((option) => (
              <option key={option} value={option}>{tt(`circuit_region_${option}` as TranslationKey)}</option>
            ))}
          </select>
        </label>

        <div className="actions arcade-actions">
          <button type="button" className="secondary-button wheel-share" disabled={!participants.length} onClick={() => setParticipants(shuffleWheelLiveries(participants))}>
            <BoardIcon className="wheel-share-icon" name="car-skin" />
            {tt("wheel_shuffle")}
          </button>
          {shareButton}
          <button type="button" className="primary-button" disabled={!canRace} onClick={launch}>
            {tt("wheel_launch")}
          </button>
        </div>
        {canRace ? null : <p className="status">{tt("wheel_need_more")}</p>}
      </div>
    </section>
  );
}

/**
 * The garage's car chooser, without the shop: every car is available here because a draw sells
 * nothing. A grid rather than the garage's carousel — sixteen cars and no prices to read means
 * there is nothing to step through.
 */
function WheelCarPicker({
  participants,
  participantId,
  onPick,
  onClose
}: {
  participants: WheelParticipant[];
  participantId: string;
  onPick: (carAssetId: string) => void;
  onClose: () => void;
}) {
  const tt = useT();
  const index = participants.findIndex((entry) => entry.id === participantId);
  const participant = participants[index];
  if (!participant) return null;
  const livery = wheelLivery(Math.max(0, index), participant);

  return (
    <Modal label={tt("wheel_pick_car", { name: participant.name })} closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <h3>{tt("wheel_pick_car", { name: participant.name })}</h3>
      <div className="wheel-car-grid">
        {CAR_ASSETS.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className={asset.id === livery.carAssetId ? "wheel-car-option selected" : "wheel-car-option"}
            aria-pressed={asset.id === livery.carAssetId}
            aria-label={asset.name}
            onClick={() => onPick(asset.id)}
          >
            <TeamCar className="wheel-car-option-car" livery={{ ...livery, carAssetId: asset.id }} />
          </button>
        ))}
      </div>
    </Modal>
  );
}
