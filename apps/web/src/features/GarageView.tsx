import type { CardId, RaceResult } from "@cr-league/shared";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { cardFit, countCards, recommendedShopOffers, seasonWinsByTeamId, sortCardIdsByName, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { GARAGE_PANEL_KEY, type CardPanel } from "../app/viewPreferences.js";
import { CardArtImage, CardStatBadges, CardStatDetails } from "./CardStatBadges.js";
import { MapCarSprite } from "./CircuitMap.js";
import { LiveryPlate } from "./LiveryPlate.js";
import { Modal } from "./Modal.js";
import { ModalHero } from "./ModalHero.js";
import { PendingFeedback } from "./PendingFeedback.js";
import { RewardValue } from "./RewardValue.js";

const MAX_PRIMARY_LIVERY_CHANNEL = 120;
const MIN_SECONDARY_LIVERY_CHANNEL = 150;

function boundedLiveryColor(color: string, mode: "primary" | "secondary") {
  return `#${[1, 3, 5].map((index) => {
    const channel = Number.parseInt(color.slice(index, index + 2), 16);
    const bounded = mode === "primary" ? Math.min(channel, MAX_PRIMARY_LIVERY_CHANNEL) : Math.max(channel, MIN_SECONDARY_LIVERY_CHANNEL);
    return bounded.toString(16).padStart(2, "0");
  }).join("")}`;
}

export function GarageView({
  state,
  playerTeam,
  playerResult,
  consumedCardIds,
  ownedCardIds,
  forecastPick,
  isResolved,
  loading,
  pendingMessage,
  cardPanel,
  onBuyCard,
  onSellCard,
  onSelectCardPanel,
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
  pendingMessage: string | null;
  cardPanel: CardPanel;
  onBuyCard: (cardId: CardId, quantity?: number) => void;
  onSellCard: (cardId: CardId) => void;
  onSelectCardPanel: (panel: CardPanel) => void;
  onUpdateLivery: (livery: LeagueState["teams"][number]["livery"]) => void;
  onUpdateTeamName: (name: string) => void;
  tt: Translator;
}) {
  const [livery, setLivery] = useState(playerTeam?.livery ?? { primary: "#16c784", secondary: "#38bdf8" });
  const [teamName, setTeamName] = useState(playerTeam?.name ?? "");
  const [pendingBuyCardId, setPendingBuyCardId] = useState<CardId | undefined>();
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [viewingCardId, setViewingCardId] = useState<CardId | undefined>();

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

  const shopOffers = recommendedShopOffers(state, forecastPick).sort((left, right) => tt(`card_${left.cardId}` as TranslationKey).localeCompare(tt(`card_${right.cardId}` as TranslationKey)));
  const isCardLocked = (cardId: CardId) =>
    state.decisions.some((decision) => decision.teamId === playerTeam.id && decision.cardId === cardId) ||
    state.currentGrandPrix.qualifyingRuns.some((run) => run.teamId === playerTeam.id && run.decision?.cardId === cardId);
  const inventoryCards = sortCardIdsByName(ownedCardIds, tt);
  const pendingBuy = shopOffers.find((item) => item.cardId === pendingBuyCardId);
  const viewingFit = viewingCardId ? cardFit(viewingCardId, state, forecastPick) : null;
  const viewingSellPrice = (state.cardShop.find((item) => item.cardId === viewingCardId)?.price ?? 0) / 2;
  const viewingCardLocked = Boolean(viewingCardId && isCardLocked(viewingCardId));
  const maxBuyQuantity = pendingBuy ? Math.min(10, Math.floor(playerTeam.credits / pendingBuy.price)) : 0;
  const buyQuantityOptions = Array.from({ length: maxBuyQuantity }, (_, index) => index + 1);
  const pendingBuyAffordable = Boolean(pendingBuy && maxBuyQuantity > 0);
  const panelTitle = cardPanel === "team" ? tt("dashboard_my_team") : cardPanel === "inventory" ? tt("garage_inventory") : tt("garage_shop");
  const seasonWins = seasonWinsByTeamId(state).get(playerTeam.id) ?? 0;
  const confirmBuy = () => {
    if (!pendingBuy || !pendingBuyAffordable) return;
    onBuyCard(pendingBuy.cardId, buyQuantity);
    setPendingBuyCardId(undefined);
    setBuyQuantity(1);
  };
  const selectCardPanel = (nextPanel: CardPanel) => {
    localStorage.setItem(GARAGE_PANEL_KEY, nextPanel);
    onSelectCardPanel(nextPanel);
  };

  return (
    <div className="garage-grid">
      <section className="panel garage-overview">
        <div>
          <span className="section-kicker">{tt("dashboard_garage")}</span>
          <h2>{playerTeam.name}</h2>
          {state.league.code ? (
            <div className="championship-meta">
              <span className="invite-code">{state.league.code}</span>
            </div>
          ) : null}
        </div>
        <div className="garage-stats">
          <span className="garage-livery-visuals">
            <small>{tt("garage_identity")}</small>
            <LiveryPlate className="garage-livery-preview" livery={livery} name={playerTeam.name} wins={seasonWins} />
            <span className="garage-car-stage">
              <svg className="garage-car-preview map-car" viewBox="-20 -24 40 48" style={{ "--car-primary": livery.primary, "--car-secondary": livery.secondary } as CSSProperties & Record<string, string>} aria-hidden="true">
                <MapCarSprite sprite="idle" maskId="garage-car-preview-mask" transform="scale(1.45)" />
              </svg>
            </span>
          </span>
          <span>
            <small>{tt("payoff_credits")}</small>
            <RewardValue type="credits" value={playerTeam.credits} tt={tt} />
          </span>
        </div>
      </section>
      <section className={`panel garage-card-panel garage-panel-${cardPanel}`}>
        <header className={`garage-card-heading garage-hero-${cardPanel}`}>
          <div>
            <h3>{panelTitle}</h3>
          </div>
          <div className="garage-card-toggle" role="tablist" aria-label={tt("dashboard_garage")}>
            <button type="button" role="tab" className={cardPanel === "inventory" ? "active" : undefined} aria-selected={cardPanel === "inventory"} onClick={() => selectCardPanel("inventory")}>
              {tt("garage_inventory")}
            </button>
            <button type="button" role="tab" className={cardPanel === "shop" ? "active" : undefined} aria-selected={cardPanel === "shop"} onClick={() => selectCardPanel("shop")}>
              {tt("garage_shop")}
            </button>
            <button type="button" role="tab" className={cardPanel === "team" ? "active" : undefined} aria-selected={cardPanel === "team"} onClick={() => selectCardPanel("team")}>
              {tt("dashboard_my_team")}
            </button>
          </div>
        </header>
        {cardPanel === "team" ? (
          <div className="garage-team-panel">
            <PendingFeedback message={pendingMessage} />
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
                <input type="color" value={livery.primary} aria-label={tt("garage_livery_primary")} onChange={(event) => setLivery({ ...livery, primary: boundedLiveryColor(event.target.value, "primary") })} />
              </label>
              <label>
                <span>{tt("garage_livery_secondary")}</span>
                <input type="color" value={livery.secondary} aria-label={tt("garage_livery_secondary")} onChange={(event) => setLivery({ ...livery, secondary: boundedLiveryColor(event.target.value, "secondary") })} />
              </label>
              <button type="button" onClick={() => onUpdateLivery(livery)} disabled={loading}>
                {tt("garage_livery_save")}
              </button>
            </div>
            {isResolved && playerResult ? (
              <div className="garage-summary">
                <strong>{tt("garage_last_gp")}</strong>
                <span>
                  <RewardValue type="credits" value={playerResult.credits} signed tt={tt} /> <RewardValue type="points" value={playerResult.points} signed tt={tt} />
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
            <PendingFeedback message={pendingMessage} />
            <ul className="card-inventory">
              {inventoryCards.length ? (
                inventoryCards.map((cardId) => (
                  <li key={cardId}>
                    <button className="card-inventory-button card-art-cell" type="button" onClick={() => setViewingCardId(cardId)}>
                      <span>
                        {tt(`card_${cardId}` as TranslationKey)}
                        <small>{tt(`card_fit_${cardFit(cardId, state, forecastPick).level}` as TranslationKey)}</small>
                        <CardStatBadges cardId={cardId} tt={tt} />
                      </span>
                      <strong className="card-owned-count">x{countCards(playerTeam.cards, cardId)}</strong>
                      <CardArtImage cardId={cardId} />
                    </button>
                  </li>
                ))
              ) : (
                <li className="garage-empty-inventory">
                  <span>{tt("garage_empty_inventory")}</span>
                </li>
              )}
            </ul>
          </>
        ) : null}
        {cardPanel === "shop" ? (
          <div className="card-shop">
            <PendingFeedback className="card-shop-feedback" message={pendingMessage} />
            {shopOffers.map((item) => (
              <button key={item.cardId} className="card-art-cell" type="button" onClick={() => { setPendingBuyCardId(item.cardId); setBuyQuantity(1); }} disabled={loading}>
                <span>{tt(`card_${item.cardId}` as TranslationKey)}</span>
                <strong className="card-price-badge">
                  <span aria-hidden="true" className="reward-icon">●</span>
                  <span>{item.price}</span>
                </strong>
                <strong className="card-owned-count">x{countCards(playerTeam.cards, item.cardId)}</strong>
                <small>{tt(`card_fit_${item.fit.level}` as TranslationKey)}</small>
                <CardStatBadges cardId={item.cardId} tt={tt} />
                <CardArtImage cardId={item.cardId} />
              </button>
            ))}
          </div>
        ) : null}
      </section>
      {pendingBuy ? (
        <Modal label={tt("garage_buy_confirm_title")} className="panel modal garage-buy-modal" closeLabel={tt("action_close")} showCloseButton onClose={() => setPendingBuyCardId(undefined)}>
          <ModalHero image="/assets/crl/garage-buy-modal.png" kicker={tt("garage_shop")} title={tt(`card_${pendingBuy.cardId}` as TranslationKey)} />
          <p>{tt(`card_${pendingBuy.cardId}_hint` as TranslationKey)}</p>
          <div className="garage-buy-card">
            <CardArtImage cardId={pendingBuy.cardId} />
            <strong>
              <RewardValue type="credits" value={pendingBuy.price * buyQuantity} tt={tt} />
            </strong>
            <small>{tt(`card_fit_${pendingBuy.fit.level}` as TranslationKey)}</small>
          </div>
          <CardStatDetails cardId={pendingBuy.cardId} tt={tt} />
          <p>{pendingBuyAffordable ? tt("garage_buy_confirm_body") : tt("garage_buy_missing_credits")}</p>
          <PendingFeedback message={pendingMessage} />
          <div className="modal-actions">
            {pendingBuyAffordable ? (
              <div className="garage-buy-quantity">
                <select aria-label={tt("garage_buy_quantity")} value={buyQuantity} onChange={(event) => setBuyQuantity(Number(event.target.value))}>
                  {buyQuantityOptions.map((quantity) => (
                    <option key={quantity} value={quantity}>x{quantity}</option>
                  ))}
                </select>
              </div>
            ) : null}
            <button type="button" onClick={confirmBuy} disabled={loading || !pendingBuyAffordable}>
              {tt("garage_buy_confirm_action")}
            </button>
          </div>
        </Modal>
      ) : null}
      {viewingCardId && viewingFit ? (
        <Modal label={tt(`card_${viewingCardId}` as TranslationKey)} className="panel modal garage-buy-modal" closeLabel={tt("action_close")} showCloseButton onClose={() => setViewingCardId(undefined)}>
          <ModalHero image="/assets/crl/garage-sell-modal.png" kicker={tt("garage_inventory")} title={tt(`card_${viewingCardId}` as TranslationKey)} />
          <p>{tt(`card_${viewingCardId}_hint` as TranslationKey)}</p>
          <div className="garage-buy-card">
            <CardArtImage cardId={viewingCardId} />
            <small>{tt(`card_fit_${viewingFit.level}` as TranslationKey)}</small>
          </div>
          <CardStatDetails cardId={viewingCardId} tt={tt} />
          <PendingFeedback message={pendingMessage} />
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => {
                onSellCard(viewingCardId);
                setViewingCardId(undefined);
              }}
              disabled={loading || viewingSellPrice <= 0 || viewingCardLocked}
            >
              {tt("garage_sell_card_action", { price: viewingSellPrice })}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
