import type { CardId, RaceResult } from "@cr-league/shared";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { cardFit, countCards, recommendedShopOffers, seasonWinsByTeamId, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { CardStatBadges } from "./CardStatBadges.js";
import { MapCarShape } from "./CircuitMap.js";

type CardPanel = "inventory" | "shop";

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
  const [pendingBuyCardId, setPendingBuyCardId] = useState<CardId | undefined>();
  const [cardPanel, setCardPanel] = useState<CardPanel>(ownedCardIds.length ? "inventory" : "shop");

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
  const pendingBuy = shopOffers.find((item) => item.cardId === pendingBuyCardId);
  const pendingBuyAffordable = Boolean(pendingBuy && playerTeam.credits >= pendingBuy.price);
  const seasonWins = seasonWinsByTeamId(state).get(playerTeam.id) ?? 0;
  const confirmBuy = () => {
    if (!pendingBuy || !pendingBuyAffordable) return;
    onBuyCard(pendingBuy.cardId);
    setPendingBuyCardId(undefined);
  };

  return (
    <div className="garage-grid">
      <section className="panel garage-team-panel">
        <div className="garage-team-heading">
          <div>
            <span className="section-kicker">{tt("dashboard_garage")}</span>
            <h2>{tt("dashboard_my_team")}</h2>
          </div>
          <div className="garage-livery-visuals">
            <div className="garage-livery-preview" style={{ "--livery-primary": livery.primary, "--livery-secondary": livery.secondary } as CSSProperties & Record<string, string>}>
              <span className="livery-plate-text">{playerTeam.name.slice(0, 3).toUpperCase()}</span>
              {seasonWins ? <span className="livery-plate-stars">{"★".repeat(Math.min(seasonWins, 5))}</span> : null}
            </div>
            <svg className="garage-car-preview map-car" viewBox="-20 -14 40 28" style={{ "--car-primary": livery.primary, "--car-secondary": livery.secondary } as CSSProperties & Record<string, string>} aria-hidden="true">
              <MapCarShape />
            </svg>
          </div>
        </div>
        <div className="garage-stats">
          <span>
            <strong>{playerTeam.points}</strong>
            <small>{tt("unit_points")}</small>
          </span>
          <span>
            <strong>{playerTeam.credits}</strong>
            <small>{tt("unit_credits")}</small>
          </span>
        </div>
        <div className="field-grid garage-name-fields">
          <label>
            {tt("garage_team_name")}
            <input maxLength={32} value={teamName} onChange={(event) => setTeamName(event.target.value)} />
          </label>
          <button type="button" onClick={() => onUpdateTeamName(teamName)} disabled={loading || teamName.trim() === playerTeam.name}>
            {tt("garage_team_name_save")}
          </button>
        </div>
        <div className="field-grid garage-livery-fields">
          <label>
            <span>{tt("garage_livery_primary")}</span>
            <input type="color" value={livery.primary} aria-label={tt("garage_livery_primary")} onChange={(event) => setLivery({ ...livery, primary: event.target.value })} />
          </label>
          <label>
            <span>{tt("garage_livery_secondary")}</span>
            <input type="color" value={livery.secondary} aria-label={tt("garage_livery_secondary")} onChange={(event) => setLivery({ ...livery, secondary: event.target.value })} />
          </label>
          <button type="button" onClick={() => onUpdateLivery(livery)} disabled={loading}>
            {tt("garage_livery_save")}
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

      <section className="panel garage-card-panel">
        <div className="garage-card-heading">
          <h3>{tt("garage_cards")}</h3>
          <div className="garage-card-toggle" aria-label={tt("garage_cards")}>
            <button type="button" className={cardPanel === "inventory" ? "active" : undefined} aria-pressed={cardPanel === "inventory"} onClick={() => setCardPanel("inventory")}>
              {tt("garage_inventory")}
            </button>
            <button type="button" className={cardPanel === "shop" ? "active" : undefined} aria-pressed={cardPanel === "shop"} onClick={() => setCardPanel("shop")}>
              {tt("garage_shop")}
            </button>
          </div>
        </div>
        {cardPanel === "inventory" ? (
          <>
            <p>{tt("garage_between_gp_hint")}</p>
            <ul className="card-inventory">
              {ownedCardIds.length ? (
                ownedCardIds.map((cardId) => (
                  <li key={cardId}>
                    <span>
                      {tt(`card_${cardId}` as TranslationKey)}
                      <small>{tt(`card_fit_${cardFit(cardId, state, forecastPick).level}` as TranslationKey)}</small>
                      <CardStatBadges cardId={cardId} tt={tt} />
                    </span>
                    <strong>x{countCards(playerTeam.cards, cardId)}</strong>
                  </li>
                ))
              ) : (
                <li>{tt("garage_empty_inventory")}</li>
              )}
            </ul>
          </>
        ) : (
          <div className="card-shop">
            {shopOffers.map((item) => (
              <button key={item.cardId} type="button" onClick={() => setPendingBuyCardId(item.cardId)} disabled={loading}>
                <span>{tt(`card_${item.cardId}` as TranslationKey)}</span>
                <strong>{item.price}</strong>
                <small>{tt(`card_fit_${item.fit.level}` as TranslationKey)}</small>
                <CardStatBadges cardId={item.cardId} tt={tt} />
              </button>
            ))}
          </div>
        )}
      </section>
      {pendingBuy ? (
        <div className="modal-overlay" onClick={() => setPendingBuyCardId(undefined)}>
          <section className="panel modal garage-buy-modal" role="dialog" aria-modal="true" aria-label={tt("garage_buy_confirm_title")} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close-button" type="button" aria-label={tt("action_close")} onClick={() => setPendingBuyCardId(undefined)}>
              ×
            </button>
            <span className="section-kicker">{tt("garage_shop")}</span>
            <h2>{tt(`card_${pendingBuy.cardId}` as TranslationKey)}</h2>
            <p>{tt(`card_${pendingBuy.cardId}_hint` as TranslationKey)}</p>
            <div className="garage-buy-card">
              <strong>{pendingBuy.price}</strong>
              <span>{tt("unit_credits")}</span>
              <small>{tt(`card_fit_${pendingBuy.fit.level}` as TranslationKey)}</small>
              <CardStatBadges cardId={pendingBuy.cardId} tt={tt} />
            </div>
            <p>{pendingBuyAffordable ? tt("garage_buy_confirm_body") : tt("garage_buy_missing_credits")}</p>
            <div className="modal-actions">
              <button type="button" onClick={confirmBuy} disabled={loading || !pendingBuyAffordable}>
                {tt("garage_buy_confirm_action")}
              </button>
              <button type="button" onClick={() => setPendingBuyCardId(undefined)}>
                {tt("action_close")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
