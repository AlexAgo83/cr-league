import { APP_NAME, RACE_SEGMENTS, type CardId, type RaceDecision, type RaceResult } from "@cr-league/shared";
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
  layoutKey: TranslationKey;
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
    layoutKey: "circuit_docklands_sprint",
    laps: 5,
    traits: { grip: 64, overtaking: 72, energy: 58 },
    likelyWeather: "light_rain",
    routePath: "M52 112 C62 38 160 26 216 52 C288 85 273 142 194 134 C108 126 112 74 174 78 C226 82 225 112 181 112",
    center: { lat: 48.8568, lng: 2.3524 },
    zoom: 14,
    route: [
      { lat: 48.865689, lng: 2.333534 },
      { lat: 48.864344, lng: 2.335015 },
      { lat: 48.862711, lng: 2.33732 },
      { lat: 48.861726, lng: 2.341033 },
      { lat: 48.860818, lng: 2.340777 },
      { lat: 48.858654, lng: 2.341612 },
      { lat: 48.857588, lng: 2.345761 },
      { lat: 48.857566, lng: 2.347689 },
      { lat: 48.859992, lng: 2.349057 },
      { lat: 48.86293, lng: 2.350711 },
      { lat: 48.862771, lng: 2.353698 },
      { lat: 48.860611, lng: 2.353171 },
      { lat: 48.857551, lng: 2.351475 },
      { lat: 48.856717, lng: 2.348955 },
      { lat: 48.855374, lng: 2.352379 },
      { lat: 48.853716, lng: 2.35672 },
      { lat: 48.851661, lng: 2.356387 },
      { lat: 48.848536, lng: 2.353618 },
      { lat: 48.848583, lng: 2.348623 },
      { lat: 48.846799, lng: 2.34891 },
      { lat: 48.846581, lng: 2.346935 },
      { lat: 48.846979, lng: 2.342504 },
      { lat: 48.847629, lng: 2.340197 },
      { lat: 48.849266, lng: 2.337834 },
      { lat: 48.849058, lng: 2.334588 },
      { lat: 48.847345, lng: 2.332487 },
      { lat: 48.848224, lng: 2.332549 },
      { lat: 48.847928, lng: 2.329484 },
      { lat: 48.850406, lng: 2.327708 },
      { lat: 48.851705, lng: 2.324343 },
      { lat: 48.853508, lng: 2.319395 },
      { lat: 48.854419, lng: 2.322111 },
      { lat: 48.85574, lng: 2.325718 },
      { lat: 48.857052, lng: 2.327554 },
      { lat: 48.859672, lng: 2.329581 },
      { lat: 48.863702, lng: 2.332052 },
      { lat: 48.865689, lng: 2.333534 }
    ]
  },
  {
    city: "Paris",
    country: "FR",
    layout: "Left Bank Loop",
    layoutKey: "circuit_left_bank_loop",
    laps: 6,
    traits: { grip: 70, overtaking: 55, energy: 62 },
    likelyWeather: "dry",
    routePath: "M44 96 C78 38 158 35 210 58 C268 83 280 135 218 148 C156 162 78 138 44 96",
    center: { lat: 48.8492, lng: 2.3458 },
    zoom: 14,
    route: [
      { lat: 48.865689, lng: 2.333534 },
      { lat: 48.864732, lng: 2.33485 },
      { lat: 48.863119, lng: 2.335671 },
      { lat: 48.862383, lng: 2.338541 },
      { lat: 48.861637, lng: 2.341185 },
      { lat: 48.860801, lng: 2.340769 },
      { lat: 48.858662, lng: 2.341566 },
      { lat: 48.857963, lng: 2.344384 },
      { lat: 48.857184, lng: 2.347292 },
      { lat: 48.855662, lng: 2.348337 },
      { lat: 48.853592, lng: 2.347114 },
      { lat: 48.852176, lng: 2.346278 },
      { lat: 48.850347, lng: 2.347554 },
      { lat: 48.849671, lng: 2.350276 },
      { lat: 48.852492, lng: 2.352161 },
      { lat: 48.854456, lng: 2.351331 },
      { lat: 48.855596, lng: 2.348296 },
      { lat: 48.853476, lng: 2.347049 },
      { lat: 48.851393, lng: 2.345817 },
      { lat: 48.849687, lng: 2.34488 },
      { lat: 48.84691, lng: 2.343366 },
      { lat: 48.84541, lng: 2.344509 },
      { lat: 48.845137, lng: 2.342444 },
      { lat: 48.846906, lng: 2.342828 },
      { lat: 48.847477, lng: 2.340831 },
      { lat: 48.849077, lng: 2.339035 },
      { lat: 48.849656, lng: 2.337296 },
      { lat: 48.851231, lng: 2.333919 },
      { lat: 48.85159, lng: 2.331117 },
      { lat: 48.851747, lng: 2.32788 },
      { lat: 48.851705, lng: 2.324343 },
      { lat: 48.853056, lng: 2.319218 },
      { lat: 48.854752, lng: 2.320757 },
      { lat: 48.853443, lng: 2.326078 },
      { lat: 48.855992, lng: 2.325887 },
      { lat: 48.85765, lng: 2.327936 },
      { lat: 48.859609, lng: 2.329426 },
      { lat: 48.862144, lng: 2.330911 },
      { lat: 48.864484, lng: 2.332635 },
      { lat: 48.865689, lng: 2.333534 }
    ]
  },
  {
    city: "Amsterdam",
    country: "NL",
    layout: "Canal Loop",
    layoutKey: "circuit_canal_loop",
    laps: 5,
    traits: { grip: 60, overtaking: 68, energy: 66 },
    likelyWeather: "light_rain",
    routePath: "M48 124 C66 52 122 36 178 44 C250 55 292 102 260 138 C226 176 110 166 76 136 C58 120 82 90 132 82",
    center: { lat: 52.371, lng: 4.895 },
    zoom: 14,
    route: [
      { lat: 52.379467, lng: 4.884159 },
      { lat: 52.380605, lng: 4.887707 },
      { lat: 52.382033, lng: 4.890237 },
      { lat: 52.382826, lng: 4.893503 },
      { lat: 52.381244, lng: 4.89662 },
      { lat: 52.378212, lng: 4.90496 },
      { lat: 52.377388, lng: 4.912275 },
      { lat: 52.376268, lng: 4.921465 },
      { lat: 52.372911, lng: 4.918791 },
      { lat: 52.371159, lng: 4.914953 },
      { lat: 52.371264, lng: 4.912293 },
      { lat: 52.370972, lng: 4.909716 },
      { lat: 52.368841, lng: 4.904876 },
      { lat: 52.369681, lng: 4.900954 },
      { lat: 52.372023, lng: 4.900455 },
      { lat: 52.376014, lng: 4.902525 },
      { lat: 52.37541, lng: 4.903308 },
      { lat: 52.372707, lng: 4.907823 },
      { lat: 52.37151, lng: 4.910486 },
      { lat: 52.369029, lng: 4.905502 },
      { lat: 52.369733, lng: 4.903203 },
      { lat: 52.369745, lng: 4.902901 },
      { lat: 52.367992, lng: 4.903471 },
      { lat: 52.366642, lng: 4.904621 },
      { lat: 52.364402, lng: 4.902701 },
      { lat: 52.361472, lng: 4.907712 },
      { lat: 52.359449, lng: 4.906639 },
      { lat: 52.358021, lng: 4.900324 },
      { lat: 52.359453, lng: 4.898889 },
      { lat: 52.361004, lng: 4.899406 },
      { lat: 52.361996, lng: 4.89744 },
      { lat: 52.363584, lng: 4.886978 },
      { lat: 52.364593, lng: 4.889296 },
      { lat: 52.373906, lng: 4.885319 },
      { lat: 52.373926, lng: 4.882797 },
      { lat: 52.372547, lng: 4.877205 },
      { lat: 52.373206, lng: 4.876068 },
      { lat: 52.374434, lng: 4.876597 },
      { lat: 52.377715, lng: 4.879132 },
      { lat: 52.379467, lng: 4.884159 }
    ]
  },
  {
    city: "Amsterdam",
    country: "NL",
    layout: "Harbor Sprint",
    layoutKey: "circuit_harbor_sprint",
    laps: 4,
    traits: { grip: 58, overtaking: 78, energy: 52 },
    likelyWeather: "heavy_rain",
    routePath: "M38 128 L96 54 L180 48 L290 76 L250 136 L142 152 Z",
    center: { lat: 52.392, lng: 4.905 },
    zoom: 14,
    route: [
      { lat: 52.398598, lng: 4.883962 },
      { lat: 52.396724, lng: 4.880783 },
      { lat: 52.394789, lng: 4.876891 },
      { lat: 52.39472, lng: 4.872355 },
      { lat: 52.393265, lng: 4.868449 },
      { lat: 52.395143, lng: 4.862273 },
      { lat: 52.399813, lng: 4.852025 },
      { lat: 52.406252, lng: 4.856106 },
      { lat: 52.420262, lng: 4.87107 },
      { lat: 52.424034, lng: 4.880486 },
      { lat: 52.423351, lng: 4.900877 },
      { lat: 52.41782, lng: 4.910823 },
      { lat: 52.411841, lng: 4.910481 },
      { lat: 52.409114, lng: 4.915006 },
      { lat: 52.404724, lng: 4.90789 },
      { lat: 52.401983, lng: 4.910909 },
      { lat: 52.399811, lng: 4.912235 },
      { lat: 52.400243, lng: 4.919263 },
      { lat: 52.396939, lng: 4.917939 },
      { lat: 52.391843, lng: 4.916953 },
      { lat: 52.38887, lng: 4.913112 },
      { lat: 52.387163, lng: 4.913424 },
      { lat: 52.385075, lng: 4.913844 },
      { lat: 52.386079, lng: 4.92175 },
      { lat: 52.389156, lng: 4.920236 },
      { lat: 52.390961, lng: 4.920395 },
      { lat: 52.389363, lng: 4.918989 },
      { lat: 52.38412, lng: 4.91087 },
      { lat: 52.372087, lng: 4.910913 },
      { lat: 52.374915, lng: 4.904086 },
      { lat: 52.376472, lng: 4.903195 },
      { lat: 52.37865, lng: 4.903948 },
      { lat: 52.382894, lng: 4.894108 },
      { lat: 52.385413, lng: 4.893553 },
      { lat: 52.38959, lng: 4.891185 },
      { lat: 52.391106, lng: 4.885138 },
      { lat: 52.39282, lng: 4.878874 },
      { lat: 52.394898, lng: 4.877142 },
      { lat: 52.396976, lng: 4.881269 },
      { lat: 52.398598, lng: 4.883962 }
    ]
  },
  {
    city: "Berlin",
    country: "DE",
    layout: "Ring Sector",
    layoutKey: "circuit_ring_sector",
    laps: 6,
    traits: { grip: 76, overtaking: 62, energy: 70 },
    likelyWeather: "dry",
    routePath: "M52 96 C52 46 104 24 164 34 C238 47 294 82 278 126 C260 176 150 170 88 140 C64 128 52 114 52 96",
    center: { lat: 52.515, lng: 13.377 },
    zoom: 14,
    route: [
      { lat: 52.51634, lng: 13.378236 },
      { lat: 52.516491, lng: 13.383069 },
      { lat: 52.516682, lng: 13.386008 },
      { lat: 52.516994, lng: 13.390834 },
      { lat: 52.517236, lng: 13.393421 },
      { lat: 52.517878, lng: 13.396203 },
      { lat: 52.519165, lng: 13.396885 },
      { lat: 52.519941, lng: 13.399287 },
      { lat: 52.518396, lng: 13.400926 },
      { lat: 52.51981, lng: 13.404992 },
      { lat: 52.518235, lng: 13.407276 },
      { lat: 52.516818, lng: 13.408779 },
      { lat: 52.514765, lng: 13.406467 },
      { lat: 52.51329, lng: 13.40684 },
      { lat: 52.512213, lng: 13.409786 },
      { lat: 52.512914, lng: 13.411346 },
      { lat: 52.512497, lng: 13.411896 },
      { lat: 52.51125, lng: 13.415176 },
      { lat: 52.510361, lng: 13.415974 },
      { lat: 52.506825, lng: 13.413222 },
      { lat: 52.504174, lng: 13.411141 },
      { lat: 52.503822, lng: 13.410156 },
      { lat: 52.504333, lng: 13.407917 },
      { lat: 52.502654, lng: 13.406536 },
      { lat: 52.503252, lng: 13.404578 },
      { lat: 52.503622, lng: 13.402839 },
      { lat: 52.504899, lng: 13.398535 },
      { lat: 52.506354, lng: 13.397759 },
      { lat: 52.507157, lng: 13.39759 },
      { lat: 52.506949, lng: 13.394234 },
      { lat: 52.506741, lng: 13.390973 },
      { lat: 52.506466, lng: 13.386623 },
      { lat: 52.506888, lng: 13.385825 },
      { lat: 52.508699, lng: 13.38488 },
      { lat: 52.51116, lng: 13.383571 },
      { lat: 52.511842, lng: 13.385866 },
      { lat: 52.513578, lng: 13.386378 },
      { lat: 52.51531, lng: 13.38609 },
      { lat: 52.516939, lng: 13.385567 },
      { lat: 52.51661, lng: 13.380594 },
      { lat: 52.51634, lng: 13.378236 }
    ]
  },
  {
    city: "Berlin",
    country: "DE",
    layout: "Mitte Dash",
    layoutKey: "circuit_mitte_dash",
    laps: 5,
    traits: { grip: 68, overtaking: 74, energy: 60 },
    likelyWeather: "dry",
    routePath: "M42 132 C84 70 138 68 168 38 C202 64 238 58 286 104 C244 146 198 126 166 158 C128 124 92 158 42 132",
    center: { lat: 52.521, lng: 13.405 },
    zoom: 14,
    route: [
      { lat: 52.528823, lng: 13.391548 },
      { lat: 52.528458, lng: 13.393512 },
      { lat: 52.530511, lng: 13.394939 },
      { lat: 52.531785, lng: 13.394256 },
      { lat: 52.532488, lng: 13.397437 },
      { lat: 52.533394, lng: 13.403704 },
      { lat: 52.533217, lng: 13.407238 },
      { lat: 52.532026, lng: 13.410925 },
      { lat: 52.532727, lng: 13.412176 },
      { lat: 52.530881, lng: 13.412965 },
      { lat: 52.528786, lng: 13.416668 },
      { lat: 52.528716, lng: 13.421477 },
      { lat: 52.527884, lng: 13.425181 },
      { lat: 52.526178, lng: 13.428643 },
      { lat: 52.524196, lng: 13.430106 },
      { lat: 52.521327, lng: 13.429472 },
      { lat: 52.519127, lng: 13.428426 },
      { lat: 52.518381, lng: 13.427669 },
      { lat: 52.51577, lng: 13.426218 },
      { lat: 52.512862, lng: 13.423558 },
      { lat: 52.509901, lng: 13.421263 },
      { lat: 52.510479, lng: 13.416065 },
      { lat: 52.509095, lng: 13.412143 },
      { lat: 52.506078, lng: 13.412638 },
      { lat: 52.503743, lng: 13.410397 },
      { lat: 52.504676, lng: 13.407043 },
      { lat: 52.506497, lng: 13.400414 },
      { lat: 52.507153, lng: 13.397524 },
      { lat: 52.506847, lng: 13.392605 },
      { lat: 52.507615, lng: 13.390404 },
      { lat: 52.509907, lng: 13.390043 },
      { lat: 52.512075, lng: 13.389614 },
      { lat: 52.514025, lng: 13.389361 },
      { lat: 52.515723, lng: 13.389024 },
      { lat: 52.518447, lng: 13.388571 },
      { lat: 52.520432, lng: 13.38825 },
      { lat: 52.52367, lng: 13.38777 },
      { lat: 52.526347, lng: 13.387297 },
      { lat: 52.529058, lng: 13.388208 },
      { lat: 52.528823, lng: 13.391548 }
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
    if (isLocale(saved)) return saved;
    const browserLocale = navigator.language.split("-")[0] ?? "en";
    return isLocale(browserLocale) ? browserLocale : "en";
  });
  const [gameView, setGameView] = useState<"drive" | "directive" | "championship" | "garage" | "replay" | "report">("drive");
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
  const liveMapCars =
    result?.classification.slice(0, 6).map((entry, index) => ({
      id: entry.teamId,
      label: entry.teamName.slice(0, 3).toUpperCase(),
      player: entry.teamId === playerTeam?.id,
      delay: -(index * 0.68 + Math.max(0, entry.position - 1) * 0.14),
      duration: 7.5 + entry.position * 0.45
    })) ?? [];
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
    <main className={leagueState ? "app-shell game-mode" : "app-shell"} data-game-view={gameView}>
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
              <nav className="game-nav" aria-label={tt("cockpit_sections")}>
                {(["drive", "directive", "championship", "garage", "replay", "report"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    className={gameView === view ? "active" : undefined}
                    onClick={() => setGameView(view)}
                    disabled={(view === "replay" || view === "report") && !result}
                  >
                    {tt(`rail_${view}` as TranslationKey)}
                  </button>
                ))}
                <select className="game-language" aria-label={tt("language_label")} value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
                  <option value="en">{tt("language_en")}</option>
                  <option value="fr">{tt("language_fr")}</option>
                </select>
              </nav>
              <section className="race-console">
                <div>
                  <span className="section-kicker">{tt("briefing_next_action")}</span>
                  <h3>{tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}</h3>
                  <p>{isResolved ? tt("briefing_tip_resolved") : tt("briefing_tip_prepare")}</p>
                </div>
                <div className="race-telemetry" aria-label={tt("race_telemetry")}>
                  <span>{currentCircuit.city}</span>
                  <span>{tt(currentCircuit.layoutKey)}</span>
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
              <CityCircuitMap circuit={currentCircuit} tt={tt} cars={liveMapCars} immersive />

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
            <section className="dashboard-section team-section">
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
            <section className="dashboard-section standings-section">
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
            <section className="dashboard-section history-section">
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
  const circuit = circuitForRound(round);
  const playerEntry = result.classification.find((entry) => entry.teamId === playerTeamId) ?? result.classification[0];
  const winner = result.classification[0];
  const replayEvents = result.events
    .filter((event) => event.severity === "major" || event.teamId === playerTeamId || event.relatedTeamId === playerTeamId)
    .slice(0, 3);

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
      <ol className="replay-laps" aria-label={tt("result_replay_track_label")}>
        {RACE_SEGMENTS.slice(0, Math.min(RACE_SEGMENTS.length, circuit.laps)).map((segment, index) => (
          <li key={segment}>
            <strong>
              {tt("result_replay_phase")} {index + 1}
            </strong>
            <span>{tt(`weather_${result.resolvedWeather[segment]}` as TranslationKey)}</span>
          </li>
        ))}
      </ol>
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

function CityCircuitMap({
  circuit,
  tt,
  compact = false,
  immersive = false,
  cars = []
}: {
  circuit: CityCircuit;
  tt: (key: TranslationKey) => string;
  compact?: boolean;
  immersive?: boolean;
  cars?: Array<{ id: string; label: string; player: boolean; delay: number; duration: number }>;
}) {
  const immersiveSize = typeof window !== "undefined" && window.innerWidth < 700 ? { width: 900, height: 1600 } : { width: 1600, height: 900 };
  const map = projectedCircuitMap(circuit, immersive ? { ...immersiveSize, fitRoute: true } : undefined);
  const className = ["city-circuit-map", compact ? "compact" : "", immersive ? "immersive" : ""].filter(Boolean).join(" ");

  return (
    <section className={className} aria-label={tt("city_circuit_map")}>
      <div className="city-circuit-heading">
        <span>{circuit.city}</span>
        <strong>{tt(circuit.layoutKey)}</strong>
        <small>
          {circuit.country} · {circuit.laps} {tt("unit_laps")} · {tt(`weather_${circuit.likelyWeather}` as TranslationKey)}
        </small>
      </div>
      <div className="city-map-stage">
        <svg className="city-map-svg" viewBox={`0 0 ${map.width} ${map.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {map.tiles.map((tile) => (
            <image
              key={`${tile.x}-${tile.y}`}
              className="city-map-tile"
              href={`https://tile.openstreetmap.org/${map.zoom}/${tile.x}/${tile.y}.png`}
              x={tile.left}
              y={tile.top}
              width="256"
              height="256"
            />
          ))}
          <path className="city-route-shadow" d={map.path} />
          <path className="city-route-line" d={map.path} />
          <path className="city-route-accent" d={map.path} />
          {cars.length
            ? cars.map((car) => (
              <g key={car.id} className={`map-car ${car.player ? "player" : ""}`}>
                <circle r="17" />
                <text textAnchor="middle" dominantBaseline="central">
                  {car.label}
                </text>
                <animateMotion path={map.path} dur={`${car.duration}s`} begin={`${car.delay}s`} repeatCount="indefinite" />
              </g>
            ))
            : null}
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

function fittedRouteZoom(circuit: CityCircuit, width: number, height: number) {
  for (let zoom = circuit.zoom + 1; zoom >= circuit.zoom - 2; zoom -= 1) {
    const projection = circuit.route.map((point) => projectLatLng(point, zoom));
    const bounds = projection.reduce(
      (acc, point) => ({
        minX: Math.min(acc.minX, point.x),
        maxX: Math.max(acc.maxX, point.x),
        minY: Math.min(acc.minY, point.y),
        maxY: Math.max(acc.maxY, point.y)
      }),
      { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxY: Number.NEGATIVE_INFINITY }
    );
    if (bounds.maxX - bounds.minX <= width * 0.76 && bounds.maxY - bounds.minY <= height * 0.7) {
      return zoom;
    }
  }

  return circuit.zoom - 2;
}

function projectedCircuitMap(circuit: CityCircuit, options: { width: number; height: number; zoom?: number; fitRoute?: boolean } = { width: 960, height: 520 }) {
  const { width, height, fitRoute = false } = options;
  const zoom = options.zoom ?? (fitRoute ? fittedRouteZoom(circuit, width, height) : circuit.zoom);
  const tileSize = 256;
  const routeProjection = circuit.route.map((point) => projectLatLng(point, zoom));
  const bounds = routeProjection.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y)
    }),
    { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxY: Number.NEGATIVE_INFINITY }
  );
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  };
  const points = routeProjection.map((projected) => ({
    x: projected.x - center.x + width / 2,
    y: projected.y - center.y + height / 2
  }));
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
    zoom,
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
