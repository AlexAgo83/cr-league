import type { CardId, RaceResult } from "@cr-league/shared";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { cardFit, countCards, recommendedShopOffers, seasonWinsByTeamId, sortCardIdsByName, type Translator } from "../app/helpers.js";
import type { LeagueState } from "../app/types.js";
import { GARAGE_PANEL_KEY, type CardPanel } from "../app/viewPreferences.js";
import { AssetImage } from "./AssetImage.js";
import { CardArtImage, CardStatBadges } from "./CardStatBadges.js";
import { CAR_ASSETS, DEFAULT_CAR_ASSET, DEFAULT_CAR_ASSET_INDEX } from "./carAssets.js";
import { LiveryPlate } from "./LiveryPlate.js";
import { Modal } from "./Modal.js";
import { ModalHero } from "./ModalHero.js";
import { RewardValue } from "./RewardValue.js";

export function GarageView({
  state,
  playerTeam,
  playerResult,
  consumedCardIds,
  ownedCardIds,
  forecastPick,
  isResolved,
  loading,
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
  cardPanel: CardPanel;
  onBuyCard: (cardId: CardId, quantity?: number) => void;
  onSellCard: (cardId: CardId) => void;
  onSelectCardPanel: (panel: CardPanel) => void;
  onUpdateLivery: (livery: LeagueState["teams"][number]["livery"], options?: { silent?: boolean }) => void;
  onUpdateTeamName: (name: string) => void;
  tt: Translator;
}) {
  const [livery, setLivery] = useState(playerTeam?.livery ?? { primary: "#16c784", secondary: "#38bdf8" });
  const [teamName, setTeamName] = useState(playerTeam?.name ?? "");
  const [pendingBuyCardId, setPendingBuyCardId] = useState<CardId | undefined>();
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [viewingCardId, setViewingCardId] = useState<CardId | undefined>();
  const [carAssetIndex, setCarAssetIndex] = useState(DEFAULT_CAR_ASSET_INDEX);

  useEffect(() => {
    if (playerTeam?.livery) {
      setLivery(playerTeam.livery);
      setCarAssetIndex(playerTeam.livery.carAssetId ? Math.max(0, CAR_ASSETS.findIndex((asset) => asset.id === playerTeam.livery.carAssetId)) : DEFAULT_CAR_ASSET_INDEX);
    }
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
  const previewCarAsset = (nextIndex: number) => {
    setCarAssetIndex(nextIndex);
  };
  const saveCarAsset = () => {
    const nextAsset = CAR_ASSETS[carAssetIndex] ?? DEFAULT_CAR_ASSET;
    const nextLivery = { ...livery, carAssetId: nextAsset.id };
    setLivery(nextLivery);
    onUpdateLivery(nextLivery, { silent: true });
  };
  const selectCardPanel = (nextPanel: CardPanel) => {
    localStorage.setItem(GARAGE_PANEL_KEY, nextPanel);
    onSelectCardPanel(nextPanel);
  };
  const selectedCarAsset = CAR_ASSETS[carAssetIndex] ?? DEFAULT_CAR_ASSET;
  const carTintStyle = { "--garage-car-secondary": livery.secondary, "--garage-car-stroke": livery.primary } as CSSProperties & Record<string, string>;
  const topCarStyle = { ...carTintStyle, "--garage-car-mask": `url("${selectedCarAsset.top}")` } as CSSProperties & Record<string, string>;
  const sideCarStyle = { ...carTintStyle, "--garage-car-mask": `url("${selectedCarAsset.side}")` } as CSSProperties & Record<string, string>;
  const canChangeCarAsset = CAR_ASSETS.length > 1;
  const selectedSkinSaved = selectedCarAsset.id === livery.carAssetId || (!livery.carAssetId && selectedCarAsset.id === DEFAULT_CAR_ASSET.id);

  return (
    <div className="garage-grid">
      <section className="panel garage-overview">
        <div className="garage-overview-header">
          <div>
            <span className="section-kicker">{tt("dashboard_garage")}</span>
            <div className="garage-team-title">
              <h2>{playerTeam.name}</h2>
              <LiveryPlate className="garage-livery-preview" livery={livery} name={playerTeam.name} wins={seasonWins} />
            </div>
          </div>
          <span className="garage-credit-summary">
            <small>{tt("payoff_credits")}</small>
            <RewardValue type="credits" value={playerTeam.credits} tt={tt} />
          </span>
        </div>
        <div className="garage-car-showcase">
          <button className="garage-car-skin-button" type="button" aria-label="Previous car skin" disabled={!canChangeCarAsset} onClick={() => previewCarAsset((carAssetIndex + CAR_ASSETS.length - 1) % CAR_ASSETS.length)}>
            ‹
          </button>
          <span className="garage-car-preview-frame garage-car-preview-top" style={topCarStyle}>
            <AssetImage className="garage-car-preview" src={selectedCarAsset.top} alt="" />
            <span className="garage-car-gradient" aria-hidden="true" />
          </span>
          <button className="garage-car-select-button" type="button" disabled={loading || selectedSkinSaved} onClick={saveCarAsset}>
            {tt(selectedSkinSaved ? "garage_car_skin_selected" : "garage_car_skin_select")}
          </button>
          <span className="garage-car-preview-frame garage-car-preview-side" style={sideCarStyle}>
            <AssetImage className="garage-car-preview" src={selectedCarAsset.side} alt="" />
            <span className="garage-car-gradient" aria-hidden="true" />
          </span>
          <button className="garage-car-skin-button" type="button" aria-label="Next car skin" disabled={!canChangeCarAsset} onClick={() => previewCarAsset((carAssetIndex + 1) % CAR_ASSETS.length)}>
            ›
          </button>
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
            <CardStatBadges cardId={pendingBuy.cardId} tt={tt} />
          </div>
          <p>{pendingBuyAffordable ? tt("garage_buy_confirm_body") : tt("garage_buy_missing_credits")}</p>
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
            <CardStatBadges cardId={viewingCardId} tt={tt} />
          </div>
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
