import { APP_NAME, type CardId, type RaceDecision, type RaceResult } from "@cr-league/shared";
import { useEffect, useMemo, useState } from "react";
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
        <article className={leagueState ? "panel race-panel" : "panel control-panel setup-panel"}>
          <h2>{tt("race_desk_title")}</h2>
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
              <section className="race-briefing">
                <div>
                  <span className="section-kicker">{tt("briefing_next_action")}</span>
                  <h3>{tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}</h3>
                  <p>{isResolved ? tt("briefing_tip_resolved") : tt("briefing_tip_prepare")}</p>
                </div>
                <dl className="briefing-facts">
                  <div>
                    <dt>{tt("briefing_track")}</dt>
                    <dd>
                      {tt(`trait_${leagueState.currentGrandPrix.primaryTrait}` as TranslationKey)} ·{" "}
                      {tt(`trait_${leagueState.currentGrandPrix.secondaryTrait}` as TranslationKey)}
                    </dd>
                  </div>
                  <div>
                    <dt>{tt("briefing_forecast")}</dt>
                    <dd>
                      {tt(`weather_${forecastPick}` as TranslationKey)} · {leagueState.currentGrandPrix.forecast[forecastPick]}%
                    </dd>
                  </div>
                </dl>
              </section>

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

              <div className="actions race-actions">
                <button type="button" onClick={submitDirective} disabled={status === "loading" || isResolved}>
                  {tt("action_submit_directive")}
                </button>
                <button type="button" onClick={resolveGrandPrix} disabled={status === "loading" || isResolved}>
                  {tt("action_launch_grand_prix")}
                </button>
                <button type="button" onClick={startNextGrandPrix} disabled={status === "loading" || !leagueState.actionState.canStartNextGrandPrix}>
                  {tt("action_next_grand_prix")}
                </button>
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
          <article className="panel league-panel">
            <h2>{leagueState.league.name}</h2>
            <section className="dashboard-section">
              <h3>{tt("dashboard_my_team")}</h3>
              <p>{playerTeam ? `${tt("league_your_team")} ${playerTeam.name}` : tt("dashboard_no_team")}</p>
            </section>
            <section className="dashboard-section">
              <h3>{tt("dashboard_current_gp")}</h3>
              <p>
                {tt("league_code")} {leagueState.league.code} · {tt("league_round")} {leagueState.currentGrandPrix.round} ·{" "}
                {leagueState.currentGrandPrix.status}
              </p>
              <p>
                {tt("league_cadence")} {tt(`cadence_${leagueState.league.cadence}` as TranslationKey)} · {tt("league_next_action")}{" "}
                {tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}
              </p>
            </section>
            <section className="dashboard-section">
              <h3>{tt("dashboard_players")}</h3>
              <p>
                {leagueState.actionState.submittedTeamIds.length} {tt("league_ready")} · {leagueState.actionState.missingTeamIds.length}{" "}
                {tt("league_missing")}
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
            <ol className="classification">
              {leagueState.teams.map((team) => (
                <li key={team.id}>
                  <span>
                    <strong>{team.name}</strong> {team.kind === "bot" ? tt("team_bot") : tt("team_you")} ·{" "}
                    {team.ready ? tt("team_ready") : tt("team_missing")}
                  </span>
                  <span>
                    {team.points} {tt("unit_points")} · {team.credits} {tt("unit_credits")}
                  </span>
                </li>
              ))}
            </ol>
            <section className="dashboard-section">
              <h3>{tt("league_history")}</h3>
              <ol className="classification">
                {leagueState.grandPrixHistory.map((grandPrix) => (
                  <li key={grandPrix.id}>
                    <span>
                      {tt("league_round")} {grandPrix.round}
                    </span>
                    <span>{grandPrix.status}</span>
                  </li>
                ))}
              </ol>
            </section>
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
                    <p>{majorEvents[0]?.reportText ?? result.report.headline}</p>
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
              <p>{result.report.headline}</p>
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

            <article className="panel moments-panel">
              <h2>{tt("result_key_moments")}</h2>
              <ul className="events replay-timeline">
                {[...playerEvents, ...majorEvents, ...ambienceEvents]
                  .filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index)
                  .slice(0, 8)
                  .map((event) => (
                  <li key={event.id} className={event.teamId === playerTeam?.id ? "player-event" : undefined}>
                    <span className="lap-marker">{tt("unit_lap")} {event.lap}</span>
                    <strong>{event.replayText}</strong>
                    <small>{event.severity === "major" ? tt("event_major") : tt("event_ambience")}</small>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel report-panel">
              <h2>{tt("result_race_report")}</h2>
              {result.report.blocks.map((block) => (
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
