import type { CardId, RaceResult } from "@cr-league/shared";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { cardFit, countCards, recommendedShopOffers, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";

export function GarageView({
  state,
  playerTeam,
  playerResult,
  consumedCardIds,
  ownedCardIds,
  forecastPick,
  isResolved,
  loading,
  onBuyCard,
  onUpdateLivery,
  onUpdateTeamName,
  tt
}: {
  state: LeagueState;
  playerTeam: LeagueState["teams"][number] | undefined;
  playerResult: RaceResult["classification"][number] | undefined;
  consumedCardIds: CardId[];
  ownedCardIds: CardId[];
  forecastPick: string;
  isResolved: boolean;
  loading: boolean;
  onBuyCard: (cardId: CardId) => void;
  onUpdateLivery: (livery: LeagueState["teams"][number]["livery"]) => void;
  onUpdateTeamName: (name: string) => void;
  tt: Translator;
}) {
  const [livery, setLivery] = useState(playerTeam?.livery ?? { primary: "#16c784", secondary: "#38bdf8" });
  const [teamName, setTeamName] = useState(playerTeam?.name ?? "");

  useEffect(() => {
    if (playerTeam?.livery) setLivery(playerTeam.livery);
  }, [playerTeam?.livery]);

  useEffect(() => {
    if (playerTeam?.name) setTeamName(playerTeam.name);
  }, [playerTeam?.name]);

  if (!playerTeam) {
    return (
      <section className="panel">
        <h2>{tt("dashboard_garage")}</h2>
        <p>{tt("dashboard_no_team")}</p>
      </section>
    );
  }

  const shopOffers = recommendedShopOffers(state, forecastPick);

  return (
    <div className="view-stack">
      <section className="panel">
        <h2>{tt("dashboard_my_team")}</h2>
        <p>
          {tt("league_your_team")} {playerTeam.name} · {playerTeam.points} {tt("unit_points")} · {playerTeam.credits} {tt("unit_credits")}
        </p>
        <div className="field-grid garage-livery-fields">
          <label>
            {tt("garage_team_name")}
            <input maxLength={32} value={teamName} onChange={(event) => setTeamName(event.target.value)} />
          </label>
          <button type="button" onClick={() => onUpdateTeamName(teamName)} disabled={loading || teamName.trim() === playerTeam.name}>
            {tt("garage_team_name_save")}
          </button>
        </div>
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
      </section>

      <section className="panel garage-livery-panel">
        <h3>{tt("garage_livery")}</h3>
        <div className="garage-livery-preview" style={{ "--livery-primary": livery.primary, "--livery-secondary": livery.secondary } as CSSProperties & Record<string, string>}>
          <span>{playerTeam.name.slice(0, 3).toUpperCase()}</span>
        </div>
        <div className="field-grid garage-livery-fields">
          <label>
            {tt("garage_livery_primary")}
            <input type="color" value={livery.primary} onChange={(event) => setLivery({ ...livery, primary: event.target.value })} />
          </label>
          <label>
            {tt("garage_livery_secondary")}
            <input type="color" value={livery.secondary} onChange={(event) => setLivery({ ...livery, secondary: event.target.value })} />
          </label>
        </div>
        <button type="button" onClick={() => onUpdateLivery(livery)} disabled={loading}>
          {tt("garage_livery_save")}
        </button>
      </section>

      <section className="panel">
        <h3>{tt("garage_inventory")}</h3>
        <p>{tt("garage_between_gp_hint")}</p>
        <ul className="card-inventory">
          {ownedCardIds.length ? (
            ownedCardIds.map((cardId) => (
              <li key={cardId}>
                <span>
                  {tt(`card_${cardId}` as TranslationKey)}
                  <small>{tt(`card_fit_${cardFit(cardId, state, forecastPick).level}` as TranslationKey)}</small>
                </span>
                <strong>x{countCards(playerTeam.cards, cardId)}</strong>
              </li>
            ))
          ) : (
            <li>{tt("garage_empty_inventory")}</li>
          )}
        </ul>
      </section>

      <section className="panel">
        <h3>{tt("garage_shop")}</h3>
        {!isResolved ? <p className="garage-locked">{tt("garage_shop_locked")}</p> : null}
        <div className="card-shop">
          {shopOffers.map((item) => (
            <button
              key={item.cardId}
              type="button"
              onClick={() => onBuyCard(item.cardId)}
              disabled={loading || !isResolved || playerTeam.credits < item.price}
            >
              <span>
                {tt(`card_${item.cardId}` as TranslationKey)} · {item.price}
              </span>
              <small>{tt(`card_fit_${item.fit.level}` as TranslationKey)}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
