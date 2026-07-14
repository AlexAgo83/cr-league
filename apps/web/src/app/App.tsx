import { APP_NAME, RACE_SEGMENTS, type CardId, type RaceDecision, type RaceResult } from "@cr-league/shared";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";
const PLAYER_CLAIM_KEY = "cr-league-player-claim";
const LANGUAGE_KEY = "cr-league-language";

type LeagueState = {
  league: {
    id: string;
    name: string;
    code: string;
    status: string;
    cadence: string;
    preparationDeadlineAt: string | null;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    round: number;
    status: string;
    primaryTrait: string;
    secondaryTrait: string;
    forecast: Record<string, number>;
    result: RaceResult | null;
  };
  grandPrixHistory: Array<{
    id: string;
    name: string;
    round: number;
    status: string;
    result: RaceResult | null;
  }>;
  teams: Array<{
    id: string;
    name: string;
    kind: string;
    points: number;
    credits: number;
    cards: CardId[];
    ready: boolean;
  }>;
  cardShop: Array<{
    cardId: CardId;
    price: number;
  }>;
  actionState: {
    submittedTeamIds: string[];
    missingTeamIds: string[];
    canResolve: boolean;
    canStartNextGrandPrix: boolean;
    nextAction: string;
  };
  player?: {
    teamId: string;
    claimCode: string;
  };
  decisions: Array<{
    teamId: string;
    approach: RaceDecision["approach"];
    preparation: RaceDecision["preparation"];
    cardId: RaceDecision["cardId"] | null;
    rivalTeamId: string | null;
  }>;
};

type FormState = {
  leagueName: string;
  joinCode: string;
  teamName: string;
  cadence: string;
  preparationDeadlineAt: string;
  approach: RaceDecision["approach"];
  preparation: RaceDecision["preparation"];
  cardId: RaceDecision["cardId"] | "";
};

type CityCircuit = {
  city: string;
  country: string;
  layout: string;
  laps: number;
  traits: {
    grip: number;
    overtaking: number;
    energy: number;
  };
  likelyWeather: "dry" | "light_rain" | "heavy_rain";
  routePath: string;
  center: { lat: number; lng: number };
  zoom: number;
  route: Array<{ lat: number; lng: number }>;
};

const CITY_CIRCUITS: [CityCircuit, ...CityCircuit[]] = [
  {
    city: "Paris",
    country: "FR",
    layout: "Docklands Sprint",
    laps: 5,
    traits: { grip: 64, overtaking: 72, energy: 58 },
    likelyWeather: "light_rain",
    routePath: "M52 112 C62 38 160 26 216 52 C288 85 273 142 194 134 C108 126 112 74 174 78 C226 82 225 112 181 112",
    center: { lat: 48.8568, lng: 2.3524 },
    zoom: 14,
    route: [
      { lat: 48.8624, lng: 2.3332 },
      { lat: 48.8665, lng: 2.3465 },
      { lat: 48.8612, lng: 2.3656 },
      { lat: 48.8526, lng: 2.3727 },
      { lat: 48.8467, lng: 2.3562 },
      { lat: 48.8505, lng: 2.3384 },
      { lat: 48.8624, lng: 2.3332 }
    ]
  },
  {
    city: "Paris",
    country: "FR",
    layout: "Left Bank Loop",
    laps: 6,
    traits: { grip: 70, overtaking: 55, energy: 62 },
    likelyWeather: "dry",
    routePath: "M44 96 C78 38 158 35 210 58 C268 83 280 135 218 148 C156 162 78 138 44 96",
    center: { lat: 48.8492, lng: 2.3458 },
    zoom: 14,
    route: [
      { lat: 48.8544, lng: 2.3238 },
      { lat: 48.8582, lng: 2.3424 },
      { lat: 48.8512, lng: 2.3664 },
      { lat: 48.8425, lng: 2.3594 },
      { lat: 48.8408, lng: 2.3372 },
      { lat: 48.8544, lng: 2.3238 }
    ]
  },
  {
    city: "Amsterdam",
    country: "NL",
    layout: "Canal Loop",
    laps: 5,
    traits: { grip: 60, overtaking: 68, energy: 66 },
    likelyWeather: "light_rain",
    routePath: "M48 124 C66 52 122 36 178 44 C250 55 292 102 260 138 C226 176 110 166 76 136 C58 120 82 90 132 82",
    center: { lat: 52.371, lng: 4.895 },
    zoom: 14,
    route: [
      { lat: 52.381, lng: 4.883 },
      { lat: 52.379, lng: 4.904 },
      { lat: 52.369, lng: 4.914 },
      { lat: 52.361, lng: 4.896 },
      { lat: 52.366, lng: 4.878 },
      { lat: 52.381, lng: 4.883 }
    ]
  },
  {
    city: "Amsterdam",
    country: "NL",
    layout: "Harbor Sprint",
    laps: 4,
    traits: { grip: 58, overtaking: 78, energy: 52 },
    likelyWeather: "heavy_rain",
    routePath: "M38 128 L96 54 L180 48 L290 76 L250 136 L142 152 Z",
    center: { lat: 52.392, lng: 4.905 },
    zoom: 14,
    route: [
      { lat: 52.401, lng: 4.882 },
      { lat: 52.407, lng: 4.907 },
      { lat: 52.395, lng: 4.928 },
      { lat: 52.382, lng: 4.913 },
      { lat: 52.385, lng: 4.889 },
      { lat: 52.401, lng: 4.882 }
    ]
  },
  {
    city: "Berlin",
    country: "DE",
    layout: "Ring Sector",
    laps: 6,
    traits: { grip: 76, overtaking: 62, energy: 70 },
    likelyWeather: "dry",
    routePath: "M52 96 C52 46 104 24 164 34 C238 47 294 82 278 126 C260 176 150 170 88 140 C64 128 52 114 52 96",
    center: { lat: 52.515, lng: 13.377 },
    zoom: 14,
    route: [
      { lat: 52.526, lng: 13.352 },
      { lat: 52.528, lng: 13.384 },
      { lat: 52.516, lng: 13.405 },
      { lat: 52.503, lng: 13.392 },
      { lat: 52.504, lng: 13.359 },
      { lat: 52.526, lng: 13.352 }
    ]
  },
  {
    city: "Berlin",
    country: "DE",
    layout: "Mitte Dash",
    laps: 5,
    traits: { grip: 68, overtaking: 74, energy: 60 },
    likelyWeather: "dry",
    routePath: "M42 132 C84 70 138 68 168 38 C202 64 238 58 286 104 C244 146 198 126 166 158 C128 124 92 158 42 132",
    center: { lat: 52.521, lng: 13.405 },
    zoom: 14,
    route: [
      { lat: 52.529, lng: 13.388 },
      { lat: 52.532, lng: 13.411 },
      { lat: 52.520, lng: 13.428 },
      { lat: 52.509, lng: 13.412 },
      { lat: 52.514, lng: 13.391 },
      { lat: 52.529, lng: 13.388 }
    ]
  }
];

function createInitialForm(locale: Locale): FormState {
  return {
    leagueName: t("default_league_name", locale),
    joinCode: "",
    teamName: t("default_team_name", locale),
    cadence: "manual",
    preparationDeadlineAt: "",
    approach: "balanced",
    preparation: "weather",
    cardId: "rain_grip"
  };
}

export function App() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return isLocale(saved) ? saved : "en";
  });
  const tt = (key: TranslationKey) => t(key, locale);
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
  const [form, setForm] = useState<FormState>(() => createInitialForm(locale));
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(() => t("status_initial", locale));

  useEffect(() => {
    const saved = localStorage.getItem(PLAYER_CLAIM_KEY);
    if (!saved) return;
    void run(tt("status_rejoining_league"), async () => {
      const state = await api<LeagueState>("/leagues/rejoin", {
        method: "POST",
        body: saved
      });
      rememberPlayer(state);
      setLeagueState(state);
      setMessage(tt("status_league_rejoined"));
    });
  }, []);

  const playerTeam = useMemo(
    () =>
      leagueState?.teams.find((team) => team.id === leagueState.player?.teamId) ??
      leagueState?.teams.find((team) => team.kind === "human") ??
      leagueState?.teams[0],
    [leagueState]
  );
  const playerDecision = leagueState?.decisions.find((decision) => decision.teamId === playerTeam?.id);
  const result = leagueState?.currentGrandPrix.result;
  const isResolved = leagueState?.currentGrandPrix.status === "resolved" || Boolean(result);
  const forecastPick = leagueState ? strongestForecast(leagueState.currentGrandPrix.forecast) : "dry";
  const ownedCardIds = useMemo(() => Array.from(new Set(playerTeam?.cards ?? [])), [playerTeam]);
  const selectedCardId = ownedCardIds.includes(form.cardId as CardId) ? form.cardId : "";
  const selectedCardFit = leagueState && selectedCardId ? cardFit(selectedCardId, leagueState, forecastPick) : null;
  const playerResult = result?.classification.find((entry) => entry.teamId === playerTeam?.id);
  const consumedCardIds = result?.consumedCards.filter((card) => card.teamId === playerTeam?.id).map((card) => card.cardId) ?? [];
  const shopOffers = leagueState ? recommendedShopOffers(leagueState, forecastPick) : [];
  const playerEvents = result?.events.filter((event) => event.teamId === playerTeam?.id || event.relatedTeamId === playerTeam?.id) ?? [];
  const majorEvents = result?.events.filter((event) => event.severity === "major") ?? [];
  const ambienceEvents = result?.events.filter((event) => event.severity === "minor" && event.type === "race_note") ?? [];
  const deskState = isResolved ? "resolved" : playerDecision ? "ready" : "prepare";
  const leader = leagueState?.teams[0];
  const currentCircuit = leagueState ? circuitForRound(leagueState.currentGrandPrix.round) : CITY_CIRCUITS[0];
  const primaryCommand =
    deskState === "prepare"
      ? { label: tt("action_submit_directive"), action: submitDirective, disabled: status === "loading" || isResolved }
      : deskState === "ready"
        ? { label: tt("action_launch_grand_prix"), action: resolveGrandPrix, disabled: status === "loading" || isResolved }
        : { label: tt("action_next_grand_prix"), action: startNextGrandPrix, disabled: status === "loading" || !leagueState?.actionState.canStartNextGrandPrix };

  async function createLeague() {
    await run(tt("status_creating_league"), async () => {
      const state = await api<LeagueState>("/leagues", {
        method: "POST",
        body: JSON.stringify({
          name: form.leagueName,
          teamName: form.teamName
        })
      });
      rememberPlayer(state);
      setLeagueState(state);
      setMessage(tt("status_league_created"));
    });
  }

  async function joinLeague() {
    await run(tt("status_joining_league"), async () => {
      const state = await api<LeagueState>("/leagues/join", {
        method: "POST",
        body: JSON.stringify({
          code: form.joinCode,
          teamName: form.teamName
        })
      });
      rememberPlayer(state);
      setLeagueState(state);
      setMessage(tt("status_league_joined"));
    });
  }

  async function submitDirective() {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_submitting_directive"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/decisions`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          approach: form.approach,
          preparation: form.preparation,
          cardId: selectedCardId || undefined
        })
      });
      setLeagueState(state);
      setMessage(tt("status_directive_locked"));
    });
  }

  async function updateSettings() {
    if (!leagueState) return;

    await run(tt("status_updating_settings"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/settings`, {
        method: "POST",
        body: JSON.stringify({
          cadence: form.cadence,
          preparationDeadlineAt: form.preparationDeadlineAt ? new Date(form.preparationDeadlineAt).toISOString() : null
        })
      });
      setLeagueState(state);
      setMessage(tt("status_settings_updated"));
    });
  }

  async function resolveGrandPrix() {
    if (!leagueState) return;

    await run(tt("status_resolving_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({
          allowDefaults: !playerDecision
        })
      });
      setLeagueState(state);
      setMessage(tt("status_grand_prix_resolved"));
    });
  }

  async function startNextGrandPrix() {
    if (!leagueState) return;

    await run(tt("status_starting_next_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/next-grand-prix`, {
        method: "POST"
      });
      setLeagueState(state);
      setMessage(tt("status_next_grand_prix_started"));
    });
  }

  async function buyCard(cardId: CardId) {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_buying_card"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/cards/buy`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          cardId
        })
      });
      setLeagueState(state);
      setMessage(tt("status_card_bought"));
    });
  }

  async function restartLeague() {
    if (!leagueState || !window.confirm(tt("restart_confirm"))) return;

    await run(tt("status_restarting_league"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/restart`, {
        method: "POST"
      });
      setLeagueState(leagueState.player ? { ...state, player: leagueState.player } : state);
      setMessage(tt("status_league_restarted"));
    });
  }

  async function run(nextMessage: string, action: () => Promise<void>) {
    setStatus("loading");
    setMessage(nextMessage);

    try {
      await action();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      if (isStaleLeagueError(error)) {
        localStorage.removeItem(PLAYER_CLAIM_KEY);
        setLeagueState(null);
        setMessage(tt("status_saved_league_expired"));
        return;
      }
      setMessage(error instanceof Error ? error.message : tt("status_api_unavailable"));
    }
  }

  function forgetPlayer() {
    localStorage.removeItem(PLAYER_CLAIM_KEY);
    setLeagueState(null);
    setMessage(tt("status_player_forgotten"));
  }

  function changeLocale(nextLocale: Locale) {
    localStorage.setItem(LANGUAGE_KEY, nextLocale);
    setLocaleState(nextLocale);
    if (!leagueState && message === t("status_initial", locale)) {
      setMessage(t("status_initial", nextLocale));
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <div className="hero-topline">
          <p className="eyebrow">{tt("app_eyebrow")}</p>
          <label className="language-select">
            {tt("language_label")}
            <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
              <option value="en">{tt("language_en")}</option>
              <option value="fr">{tt("language_fr")}</option>
            </select>
          </label>
        </div>
        <h1 id="app-title">{APP_NAME}</h1>
        <p>{tt("app_intro")}</p>
      </section>

      <section className="play-grid" aria-label={tt("flow_label")}>
        <article className={leagueState ? "panel race-panel" : "panel control-panel setup-panel"} id="race-desk">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">{tt("race_desk_kicker")}</span>
              <h2>{tt("race_desk_title")}</h2>
            </div>
            {leagueState ? <span className={`race-state state-${deskState}`}>{tt(`race_state_${deskState}` as TranslationKey)}</span> : null}
          </div>
          <p className={status === "error" ? "status error" : "status"}>{message}</p>

          {!leagueState ? (
            <>
              <div className="field-grid setup-fields">
                <label>
                  {tt("field_league")}
                  <input value={form.leagueName} onChange={(event) => setForm({ ...form, leagueName: event.target.value })} />
                </label>
                <label>
                  {tt("field_join_code")}
                  <input
                    value={form.joinCode}
                    onChange={(event) => setForm({ ...form, joinCode: event.target.value.toUpperCase() })}
                    maxLength={6}
                    placeholder="PLAY01"
                  />
                </label>
                <label>
                  {tt("field_team")}
                  <input value={form.teamName} onChange={(event) => setForm({ ...form, teamName: event.target.value })} />
                </label>
              </div>

              <div className="actions primary-actions">
                <button type="button" onClick={createLeague} disabled={status === "loading"}>
                  {tt("action_create_league")}
                </button>
                <button type="button" onClick={joinLeague} disabled={status === "loading"}>
                  {tt("action_join_league")}
                </button>
              </div>
            </>
          ) : null}

          {leagueState ? (
            <>
              <section className="race-console">
                <div>
                  <span className="section-kicker">{tt("briefing_next_action")}</span>
                  <h3>{tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}</h3>
                  <p>{isResolved ? tt("briefing_tip_resolved") : tt("briefing_tip_prepare")}</p>
                </div>
                <div className="race-telemetry" aria-label={tt("race_telemetry")}>
                  <span>{currentCircuit.city}</span>
                  <span>{currentCircuit.layout}</span>
                  <span>
                    {currentCircuit.laps} {tt("unit_laps")}
                  </span>
                  <span>{tt(`trait_${leagueState.currentGrandPrix.primaryTrait}` as TranslationKey)}</span>
                  <span>{tt(`trait_${leagueState.currentGrandPrix.secondaryTrait}` as TranslationKey)}</span>
                  <span>
                    {tt(`weather_${forecastPick}` as TranslationKey)} {leagueState.currentGrandPrix.forecast[forecastPick]}%
                  </span>
                </div>
              </section>
              <CityCircuitMap circuit={currentCircuit} tt={tt} />

              <section className="race-workbench" aria-label={tt("directive_workbench")}>
                <div className="settings-block">
                  <h3>{tt("settings_title")}</h3>
                  <div className="field-grid settings-fields">
                    <label>
                      {tt("field_cadence")}
                      <select value={form.cadence} onChange={(event) => setForm({ ...form, cadence: event.target.value })}>
                        <option value="manual">{tt("cadence_manual")}</option>
                        <option value="fast">{tt("cadence_fast")}</option>
                        <option value="weekly">{tt("cadence_weekly")}</option>
                      </select>
                    </label>
                    <label>
                      {tt("field_deadline")}
                      <input
                        type="datetime-local"
                        value={form.preparationDeadlineAt}
                        onChange={(event) => setForm({ ...form, preparationDeadlineAt: event.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="directive-block">
                  <h3>{tt("directive_title")}</h3>
                  <div className="field-grid directive-fields">
                    <label>
                      {tt("field_approach")}
                      <select value={form.approach} onChange={(event) => setForm({ ...form, approach: event.target.value as FormState["approach"] })}>
                        <option value="prudent">{tt("approach_prudent")}</option>
                        <option value="balanced">{tt("approach_balanced")}</option>
                        <option value="aggressive">{tt("approach_aggressive")}</option>
                      </select>
                      <small>{tt(`approach_${form.approach}_hint` as TranslationKey)}</small>
                    </label>
                    <label>
                      {tt("field_preparation")}
                      <select
                        value={form.preparation}
                        onChange={(event) => setForm({ ...form, preparation: event.target.value as FormState["preparation"] })}
                      >
                        <option value="speed">{tt("preparation_speed")}</option>
                        <option value="reliability">{tt("preparation_reliability")}</option>
                        <option value="weather">{tt("preparation_weather")}</option>
                      </select>
                      <small>{tt(`preparation_${form.preparation}_hint` as TranslationKey)}</small>
                    </label>
                    <label>
                      {tt("field_card")}
                      <select value={selectedCardId} onChange={(event) => setForm({ ...form, cardId: event.target.value as FormState["cardId"] })}>
                        <option value="">{tt("card_none")}</option>
                        {ownedCardIds.map((cardId) => (
                          <option key={cardId} value={cardId}>
                            {tt(`card_${cardId}` as TranslationKey)}
                          </option>
                        ))}
                      </select>
                      <small>
                        {selectedCardFit ? `${tt(`card_fit_${selectedCardFit.level}` as TranslationKey)} · ` : ""}
                        {selectedCardId ? tt(`card_${selectedCardId}_hint` as TranslationKey) : tt("card_none_hint")}
                      </small>
                    </label>
                  </div>
                </div>
              </section>

              <div className="race-command-row">
                <button className="primary-command" type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                  {primaryCommand.label}
                </button>
                <p>{tt(`command_hint_${deskState}` as TranslationKey)}</p>
              </div>

              <div className="actions race-actions secondary-actions">
                <button type="button" onClick={updateSettings} disabled={status === "loading"}>
                  {tt("action_update_settings")}
                </button>
                <button type="button" onClick={forgetPlayer} disabled={status === "loading" || !leagueState.player}>
                  {tt("action_forget_team")}
                </button>
              </div>
            </>
          ) : null}
        </article>

        {leagueState ? (
          <article className="panel league-panel" id="championship">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">{tt("championship_kicker")}</span>
                <h2>{leagueState.league.name}</h2>
              </div>
              <span className="invite-code">{leagueState.league.code}</span>
            </div>
            <div className="dashboard-summary" aria-label={tt("dashboard_summary")}>
              <div>
                <span>{tt("dashboard_current_gp")}</span>
                <strong>
                  {tt("league_round")} {leagueState.currentGrandPrix.round}
                </strong>
                <small>{statusLabel(leagueState.currentGrandPrix.status, tt)}</small>
              </div>
              <div>
                <span>{tt("dashboard_players")}</span>
                <strong>
                  {leagueState.actionState.submittedTeamIds.length}/{leagueState.teams.length}
                </strong>
                <small>{tt("league_ready")}</small>
              </div>
              <div>
                <span>{tt("dashboard_leader")}</span>
                <strong>{leader?.name ?? "-"}</strong>
                <small>
                  {leader?.points ?? 0} {tt("unit_points")}
                </small>
              </div>
              <div>
                <span>{tt("league_cadence")}</span>
                <strong>{tt(`cadence_${leagueState.league.cadence}` as TranslationKey)}</strong>
                <small>{tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}</small>
              </div>
            </div>
            <section className="dashboard-section">
              <h3>{tt("dashboard_my_team")}</h3>
              <p>
                {playerTeam
                  ? `${tt("league_your_team")} ${playerTeam.name} · ${playerTeam.points} ${tt("unit_points")} · ${playerTeam.credits} ${tt("unit_credits")}`
                  : tt("dashboard_no_team")}
              </p>
            </section>
            {playerTeam ? (
              <section className="dashboard-section garage-section">
                <h3>{tt("dashboard_garage")}</h3>
                {isResolved && playerResult ? (
                  <div className="garage-summary">
                    <strong>{tt("garage_last_gp")}</strong>
                    <span>
                      +{playerResult.credits} {tt("unit_credits")} · +{playerResult.points} {tt("unit_points")}
                    </span>
                    <span>
                      {consumedCardIds.length
                        ? `${tt("garage_consumed")} ${consumedCardIds.map((cardId) => tt(`card_${cardId}` as TranslationKey)).join(", ")}`
                        : tt("garage_no_card_consumed")}
                    </span>
                  </div>
                ) : null}
                <p>
                  {playerTeam.credits} {tt("unit_credits")} · {tt("garage_between_gp_hint")}
                </p>
                <h4>{tt("garage_inventory")}</h4>
                <ul className="card-inventory">
                  {ownedCardIds.length ? (
                    ownedCardIds.map((cardId) => (
                      <li key={cardId}>
                        <span>
                          {tt(`card_${cardId}` as TranslationKey)}
                          <small>{tt(`card_fit_${cardFit(cardId, leagueState, forecastPick).level}` as TranslationKey)}</small>
                        </span>
                        <strong>x{countCards(playerTeam.cards, cardId)}</strong>
                      </li>
                    ))
                  ) : (
                    <li>{tt("garage_empty_inventory")}</li>
                  )}
                </ul>
                <h4>{tt("garage_shop")}</h4>
                {!isResolved ? <p className="garage-locked">{tt("garage_shop_locked")}</p> : null}
                <div className="card-shop">
                  {shopOffers.map((item) => (
                    <button
                      key={item.cardId}
                      type="button"
                      onClick={() => buyCard(item.cardId)}
                      disabled={status === "loading" || !isResolved || playerTeam.credits < item.price}
                    >
                      <span>{tt(`card_${item.cardId}` as TranslationKey)} · {item.price}</span>
                      <small>{tt(`card_fit_${item.fit.level}` as TranslationKey)}</small>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
            <section className="dashboard-section">
              <h3>{tt("dashboard_standings")}</h3>
              <ol className="classification standings-list">
                {leagueState.teams.map((team, index) => (
                  <li key={team.id} className={team.id === playerTeam?.id ? "current-team" : undefined}>
                    <span>
                      <strong>P{index + 1}</strong> {team.name}
                      <small>
                        {team.kind === "bot" ? tt("team_bot") : tt("team_you")} · {team.ready ? tt("team_ready") : tt("team_missing")}
                      </small>
                    </span>
                    <span>
                      {team.points} {tt("unit_points")} · {team.credits} {tt("unit_credits")}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <section className="dashboard-section">
              <h3>{tt("league_history")}</h3>
              <ol className="classification">
                {leagueState.grandPrixHistory.map((grandPrix) => (
                  <li key={grandPrix.id}>
                    <span>
                      {tt("league_round")} {grandPrix.round}
                    </span>
                    <span>{statusLabel(grandPrix.status, tt)}</span>
                  </li>
                ))}
              </ol>
            </section>
            <div className="actions dashboard-actions">
              <button type="button" onClick={restartLeague} disabled={status === "loading"}>
                {tt("action_restart_league")}
              </button>
            </div>
          </article>
        ) : null}

        {result ? (
          <>
            {playerTeam && playerResult ? (
              <article className="panel recap-panel">
                <h2>{tt("result_recap_title")}</h2>
                <div className="recap-grid">
                  <section>
                    <h3>{tt("result_difference")}</h3>
                    <p>{majorEvents[0] ? eventReportText(majorEvents[0], tt) : resultHeadline(result, tt)}</p>
                  </section>
                  <section>
                    <h3>{tt("result_your_directive")}</h3>
                    <p>{describeDecision(playerDecision, tt)}</p>
                  </section>
                  <section>
                    <h3>{tt("result_next_lesson")}</h3>
                    <p>{nextLesson(leagueState, playerDecision, playerEvents, forecastPick, tt)}</p>
                  </section>
                </div>
              </article>
            ) : null}

            <article className="panel result-panel">
              <h2>{result.grandPrixName}</h2>
              <p>{resultHeadline(result, tt)}</p>
              <ol className="classification">
                {result.classification.map((entry) => (
                  <li key={entry.teamId}>
                    <span>
                      <strong>P{entry.position}</strong> {entry.teamName}
                    </span>
                    <span>
                      {entry.points} {tt("unit_points")} · {entry.credits} {tt("unit_credits")}
                    </span>
                  </li>
                ))}
              </ol>
            </article>

            <VisualReplay result={result} playerTeamId={playerTeam?.id} round={leagueState.currentGrandPrix.round} tt={tt} />

            <article className="panel moments-panel">
              <h2>{tt("result_key_moments")}</h2>
              <ul className="events replay-timeline">
                {[...playerEvents, ...majorEvents, ...ambienceEvents]
                  .filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index)
                  .slice(0, 8)
                  .map((event) => (
                  <li key={event.id} className={event.teamId === playerTeam?.id ? "player-event" : undefined}>
                    <span className="lap-marker">{tt("unit_lap")} {event.lap}</span>
                    <strong>{eventReplayText(event, tt)}</strong>
                    <small>{event.severity === "major" ? tt("event_major") : tt("event_ambience")}</small>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel report-panel">
              <h2>{tt("result_race_report")}</h2>
              {localizedReportBlocks(result, tt).map((block) => (
                <section key={block.title}>
                  <h3>{block.title}</h3>
                  <p>{block.body}</p>
                </section>
              ))}
            </article>
          </>
        ) : null}
      </section>
    </main>
  );
}

function VisualReplay({
  result,
  playerTeamId,
  round,
  tt
}: {
  result: RaceResult;
  playerTeamId: string | undefined;
  round: number;
  tt: (key: TranslationKey) => string;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const circuit = circuitForRound(round);
  const mapPath = projectedCircuitMap(circuit).path;
  const playerEntry = result.classification.find((entry) => entry.teamId === playerTeamId) ?? result.classification[0];
  const winner = result.classification[0];
  const replayEvents = result.events
    .filter((event) => event.severity === "major" || event.teamId === playerTeamId || event.relatedTeamId === playerTeamId)
    .slice(0, 3);
  const cars = result.classification.slice(0, 6).map((entry, index) => ({
    entry,
    delay: -(index * 0.72 + Math.max(0, entry.position - 1) * 0.18),
    duration: 8 + entry.position * 0.55
  }));
  const speedDuration = `${Math.max(3, 9 / speed)}s`;
  const playbackStyle = {
    "--race-path": `path("${mapPath}")`,
    "--race-duration": speedDuration,
    "--race-state": isPlaying ? "running" : "paused"
  } as CSSProperties & Record<string, string>;

  return (
    <article className="panel visual-replay-panel" id="race-replay">
      <h2>{tt("result_replay_title")}</h2>
      <p className="replay-explainer">{tt("result_replay_explainer")}</p>
      <div className="replay-summary">
        <span>
          {tt("result_replay_winner")} <strong>{winner?.teamName ?? result.grandPrixName}</strong>
        </span>
        {playerEntry ? (
          <span>
            {tt("result_replay_you")} <strong>P{playerEntry.position}</strong>
          </span>
        ) : null}
      </div>
      <div className="replay-controls" aria-label={tt("result_replay_controls")}>
        <button type="button" onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? tt("action_pause_replay") : tt("action_play_replay")}
        </button>
        <button type="button" onClick={() => setSpeed((value) => (value === 1 ? 2 : 1))}>
          {speed === 1 ? tt("action_replay_speed_fast") : tt("action_replay_speed_normal")}
        </button>
      </div>
      <h3>{tt("result_replay_positions")}</h3>
      <div className="replay-track city-replay-track" aria-label={tt("result_replay_track_label")} style={playbackStyle}>
        <CityCircuitMap circuit={circuit} tt={tt} compact />
        {cars.map(({ entry, delay, duration }) => (
          <span
            key={entry.teamId}
            className={`replay-car ${entry.teamId === playerTeamId ? "player" : ""}`}
            style={{
              animationDelay: `${delay}s`,
              animationDuration: `${duration / speed}s`,
              offsetPath: `path("${mapPath}")`
            } as CSSProperties}
          >
            {entry.teamName.slice(0, 3).toUpperCase()}
          </span>
        ))}
        <ol className="replay-laps">
          {RACE_SEGMENTS.slice(0, Math.min(RACE_SEGMENTS.length, circuit.laps)).map((segment, index) => (
            <li key={segment}>
              <strong>
                {tt("result_replay_phase")} {index + 1}
              </strong>
              <span>{tt(`weather_${result.resolvedWeather[segment]}` as TranslationKey)}</span>
            </li>
          ))}
        </ol>
      </div>
      {replayEvents.length > 0 ? (
        <ol className="replay-callouts">
          {replayEvents.map((event) => (
            <li key={event.id}>
              <span>
                {tt("unit_lap")} {event.lap}
              </span>
              <strong>{eventReplayText(event, tt)}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="replay-empty">{tt("result_replay_empty")}</p>
      )}
    </article>
  );
}

function CityCircuitMap({ circuit, tt, compact = false }: { circuit: CityCircuit; tt: (key: TranslationKey) => string; compact?: boolean }) {
  const map = projectedCircuitMap(circuit);

  return (
    <section className={compact ? "city-circuit-map compact" : "city-circuit-map"} aria-label={tt("city_circuit_map")}>
      <div className="city-circuit-heading">
        <span>{circuit.city}</span>
        <strong>{circuit.layout}</strong>
        <small>
          {circuit.country} · {circuit.laps} {tt("unit_laps")} · {tt(`weather_${circuit.likelyWeather}` as TranslationKey)}
        </small>
      </div>
      <div className="city-map-stage">
        {map.tiles.map((tile) => (
          <img
            key={`${tile.x}-${tile.y}`}
            alt=""
            className="city-map-tile"
            src={`https://tile.openstreetmap.org/${circuit.zoom}/${tile.x}/${tile.y}.png`}
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
        <svg viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true">
          <path className="city-route-shadow" d={map.path} />
          <path className="city-route-line" d={map.path} />
          <path className="city-route-accent" d={map.path} />
        </svg>
      </div>
      {!compact ? (
        <div className="circuit-traits">
          <span>{tt("circuit_grip")} {circuit.traits.grip}</span>
          <span>{tt("circuit_overtaking")} {circuit.traits.overtaking}</span>
          <span>{tt("circuit_energy")} {circuit.traits.energy}</span>
        </div>
      ) : null}
    </section>
  );
}

function circuitForRound(round: number) {
  return CITY_CIRCUITS[(Math.max(1, round) - 1) % CITY_CIRCUITS.length] ?? CITY_CIRCUITS[0];
}

function projectedCircuitMap(circuit: CityCircuit) {
  const width = 960;
  const height = 520;
  const tileSize = 256;
  const center = projectLatLng(circuit.center, circuit.zoom);
  const points = circuit.route.map((point) => {
    const projected = projectLatLng(point, circuit.zoom);
    return {
      x: projected.x - center.x + width / 2,
      y: projected.y - center.y + height / 2
    };
  });
  const minTileX = Math.floor((center.x - width / 2) / tileSize);
  const maxTileX = Math.floor((center.x + width / 2) / tileSize);
  const minTileY = Math.floor((center.y - height / 2) / tileSize);
  const maxTileY = Math.floor((center.y + height / 2) / tileSize);
  const tiles = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      tiles.push({
        x,
        y,
        left: x * tileSize - (center.x - width / 2),
        top: y * tileSize - (center.y - height / 2)
      });
    }
  }

  return {
    width,
    height,
    tiles,
    path: points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")
  };
}

function projectLatLng(point: { lat: number; lng: number }, zoom: number) {
  const tileSize = 256;
  const scale = tileSize * 2 ** zoom;
  const sin = Math.sin((point.lat * Math.PI) / 180);

  return {
    x: ((point.lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
}

function rememberPlayer(state: LeagueState) {
  if (state.player) {
    localStorage.setItem(PLAYER_CLAIM_KEY, JSON.stringify(state.player));
  }
}

async function api<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: init.body ? { "content-type": "application/json", ...init.headers } : init.headers
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(response.status, errorBody?.message ?? `API request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

function isStaleLeagueError(error: unknown) {
  return error instanceof ApiError && error.statusCode === 404 && localStorage.getItem(PLAYER_CLAIM_KEY);
}

function strongestForecast(forecast: Record<string, number>) {
  return Object.entries(forecast).reduce((best, current) => (current[1] > best[1] ? current : best), ["dry", 0])[0];
}

function countCards(cards: CardId[], cardId: CardId) {
  return cards.filter((candidate) => candidate === cardId).length;
}

type CardFit = {
  level: "recommended" | "risky" | "low";
  score: number;
};

function recommendedShopOffers(state: LeagueState, forecastPick: string) {
  return state.cardShop
    .map((item) => ({ ...item, fit: cardFit(item.cardId, state, forecastPick) }))
    .sort((left, right) => right.fit.score - left.fit.score || left.cardId.localeCompare(right.cardId))
    .slice(0, 3);
}

function cardFit(cardId: CardId, state: LeagueState, forecastPick: string): CardFit {
  const traits = [state.currentGrandPrix.primaryTrait, state.currentGrandPrix.secondaryTrait];
  const hasRain = forecastPick !== "dry";

  if (cardId === "rain_grip") return hasRain || traits.includes("weather_sensitive") ? { level: "recommended", score: 90 } : { level: "risky", score: 45 };
  if (cardId === "fleet_maintenance") return traits.includes("high_wear") ? { level: "recommended", score: 85 } : { level: "low", score: 35 };
  if (cardId === "launch_boost") return traits.includes("fast") ? { level: "recommended", score: 80 } : { level: "risky", score: 50 };
  if (cardId === "urban_draft") return traits.includes("urban") ? { level: "recommended", score: 78 } : { level: "low", score: 30 };
  if (cardId === "final_surge") return { level: "risky", score: 55 };
  return { level: "risky", score: 52 };
}

function describeDecision(decision: LeagueState["decisions"][number] | undefined, tt: (key: TranslationKey) => string) {
  if (!decision) return tt("result_no_directive");
  const card = decision.cardId ? ` · ${tt(`card_${decision.cardId}` as TranslationKey)}` : "";
  return `${tt(`approach_${decision.approach}` as TranslationKey)} · ${tt(`preparation_${decision.preparation}` as TranslationKey)}${card}`;
}

function nextLesson(
  state: LeagueState | null,
  decision: LeagueState["decisions"][number] | undefined,
  events: RaceResult["events"],
  forecastPick: string,
  tt: (key: TranslationKey) => string
) {
  if (events.some((event) => event.cardId)) return tt("lesson_card_paid");
  if (decision?.preparation === "weather" && forecastPick !== "dry") return tt("lesson_weather_paid");
  if (state?.currentGrandPrix.secondaryTrait === "high_wear") return tt("lesson_reliability");
  if (state?.currentGrandPrix.primaryTrait === "fast") return tt("lesson_speed");
  return tt("lesson_balanced");
}

type RaceEvent = RaceResult["events"][number];

function resultHeadline(result: RaceResult, tt: (key: TranslationKey) => string) {
  const winner = result.classification[0];
  return winner ? `${result.grandPrixName}: ${winner.teamName} ${tt("report_wins")}.` : result.grandPrixName;
}

function localizedReportBlocks(result: RaceResult, tt: (key: TranslationKey) => string) {
  const keyEvents = result.events.filter((event) => event.severity === "major").slice(0, 4);
  return [
    {
      title: tt("report_key_moments"),
      body: keyEvents.length ? keyEvents.map((event) => eventReportText(event, tt)).join(" ") : tt("report_clean_race")
    },
    {
      title: tt("report_rewards"),
      body: result.classification.map((entry) => `${entry.teamName}: ${entry.points} ${tt("unit_points")}, ${entry.credits} ${tt("unit_credits")}`).join(" · ")
    }
  ];
}

function eventReplayText(event: RaceEvent, tt: (key: TranslationKey) => string) {
  if (event.type === "weather_change" || event.type === "race_note") return tt(`event_${event.type}` as TranslationKey);
  if (event.cardId) return `${tt(`card_${event.cardId}` as TranslationKey)} · ${eventTeam(event)} ${tt(`event_${event.type}` as TranslationKey)}`;
  return `${eventTeam(event)} ${tt(`event_${event.type}` as TranslationKey)}`;
}

function eventReportText(event: RaceEvent, tt: (key: TranslationKey) => string) {
  const delta = event.positionDelta ? ` (${event.positionDelta > 0 ? "+" : ""}${event.positionDelta})` : "";
  return `${eventReplayText(event, tt)}${delta}.`;
}

function eventTeam(event: RaceEvent) {
  return (
    event.replayText.split(" triggers for ")[1] ??
    event.replayText.match(/: (.+?) wins\./)?.[1] ??
    event.replayText.split(" finishes ")[0] ??
    event.replayText.split(" hits ")[0] ??
    "Course"
  );
}

function statusLabel(status: string, tt: (key: TranslationKey) => string) {
  if (status === "briefing" || status === "resolved") return tt(`gp_status_${status}` as TranslationKey);
  return status;
}
