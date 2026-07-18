import type { CardId, RaceResult } from "@cr-league/shared";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { cardFit, countCards, recommendedShopOffers, seasonWinsByTeamId, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { CardStatBadges } from "./CardStatBadges.js";
import { MapCarSprite } from "./CircuitMap.js";
import { LiveryPlate } from "./LiveryPlate.js";
import { Modal } from "./Modal.js";

type CardPanel = "team" | "inventory" | "shop";

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
  const [viewingCardId, setViewingCardId] = useState<CardId | undefined>();
  const [cardPanel, setCardPanel] = useState<CardPanel>("shop");

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
  const viewingFit = viewingCardId ? cardFit(viewingCardId, state, forecastPick) : null;
  const pendingBuyAffordable = Boolean(pendingBuy && playerTeam.credits >= pendingBuy.price);
  const panelTitle = cardPanel === "team" ? tt("dashboard_my_team") : cardPanel === "inventory" ? tt("garage_inventory") : tt("garage_shop");
  const seasonWins = seasonWinsByTeamId(state).get(playerTeam.id) ?? 0;
  const confirmBuy = () => {
    if (!pendingBuy || !pendingBuyAffordable) return;
    onBuyCard(pendingBuy.cardId);
    setPendingBuyCardId(undefined);
  };

  return (
    <div className="garage-grid">
      <section className="panel garage-card-panel">
        <div className="garage-card-heading">
          <div>
            <span className="section-kicker">{tt("dashboard_garage")}</span>
            <h3>{panelTitle}</h3>
          </div>
          <div className="garage-card-toggle" role="tablist" aria-label={tt("dashboard_garage")}>
            <button type="button" role="tab" className={cardPanel === "inventory" ? "active" : undefined} aria-selected={cardPanel === "inventory"} onClick={() => setCardPanel("inventory")}>
              {tt("garage_inventory")}
            </button>
            <button type="button" role="tab" className={cardPanel === "shop" ? "active" : undefined} aria-selected={cardPanel === "shop"} onClick={() => setCardPanel("shop")}>
              {tt("garage_shop")}
            </button>
            <button type="button" role="tab" className={cardPanel === "team" ? "active" : undefined} aria-selected={cardPanel === "team"} onClick={() => setCardPanel("team")}>
              {tt("dashboard_my_team")}
            </button>
          </div>
        </div>
        {cardPanel === "team" ? (
          <div className="garage-team-panel">
            <div className="garage-team-heading">
              <div className="garage-livery-visuals">
                <LiveryPlate className="garage-livery-preview" livery={livery} name={playerTeam.name} wins={seasonWins} />
                <svg className="garage-car-preview map-car" viewBox="-20 -24 40 48" style={{ "--car-primary": livery.primary, "--car-secondary": livery.secondary } as CSSProperties & Record<string, string>} aria-hidden="true">
                  <MapCarSprite sprite="idle" maskId="garage-car-preview-mask" transform="scale(1.45)" />
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
              <button type="button" onClick={() => onUpdateTeamName(teamName.trim())} disabled={loading || teamName.trim() === playerTeam.name}>
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
          </div>
        ) : null}
        {cardPanel === "inventory" ? (
          <>
            <ul className="card-inventory">
              {ownedCardIds.length ? (
                ownedCardIds.map((cardId) => (
                  <li key={cardId}>
                    <button className="card-inventory-button" type="button" onClick={() => setViewingCardId(cardId)}>
                      <span>
                        {tt(`card_${cardId}` as TranslationKey)}
                        <small>{tt(`card_fit_${cardFit(cardId, state, forecastPick).level}` as TranslationKey)}</small>
                        <CardStatBadges cardId={cardId} tt={tt} />
                      </span>
                      <strong>x{countCards(playerTeam.cards, cardId)}</strong>
                    </button>
                  </li>
                ))
              ) : (
                <li>{tt("garage_empty_inventory")}</li>
              )}
            </ul>
          </>
        ) : null}
        {cardPanel === "shop" ? (
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
        ) : null}
      </section>
      {pendingBuy ? (
        <Modal label={tt("garage_buy_confirm_title")} className="panel modal garage-buy-modal" onClose={() => setPendingBuyCardId(undefined)}>
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
        </Modal>
      ) : null}
      {viewingCardId && viewingFit ? (
        <Modal label={tt(`card_${viewingCardId}` as TranslationKey)} className="panel modal garage-buy-modal" onClose={() => setViewingCardId(undefined)}>
          <button className="modal-close-button" type="button" aria-label={tt("action_close")} onClick={() => setViewingCardId(undefined)}>
            ×
          </button>
          <span className="section-kicker">{tt("garage_inventory")}</span>
          <h2>{tt(`card_${viewingCardId}` as TranslationKey)}</h2>
          <p>{tt(`card_${viewingCardId}_hint` as TranslationKey)}</p>
          <div className="garage-buy-card garage-detail-card">
            <small>{tt(`card_fit_${viewingFit.level}` as TranslationKey)}</small>
            <CardStatBadges cardId={viewingCardId} tt={tt} />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setViewingCardId(undefined)}>
              {tt("action_close")}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
