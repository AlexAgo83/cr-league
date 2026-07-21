import { CARD_DESCRIPTORS, type CardId, type CardStrengthBand } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { Translator } from "../app/helpers.js";
import { AssetImage } from "./AssetImage.js";
import { VisualIcon } from "./VisualIcon.js";

const CARD_ART: Record<CardId, string> = {
  rain_grip: "/assets/crl/card-rain-grip.png",
  fleet_maintenance: "/assets/crl/card-fleet-maintenance.png",
  launch_boost: "/assets/crl/card-launch-boost.png",
  urban_draft: "/assets/crl/card-urban-draft.png",
  final_surge: "/assets/crl/card-final-surge.png",
  fleet_sponsorship: "/assets/crl/card-fleet-sponsorship.png",
  soft_tires: "/assets/crl/card-soft-tires.png",
  qualifying_focus: "/assets/crl/card-qualifying-focus.png",
  defensive_order: "/assets/crl/card-defensive-order.png",
  adjustable_wing: "/assets/crl/card-adjustable-wing.png",
  rain_mapping: "/assets/crl/card-rain-mapping.png",
  economy_mode: "/assets/crl/card-economy-mode.png",
  pit_relay: "/assets/crl/card-pit-relay.png",
  hard_tires: "/assets/crl/card-hard-tires.png",
  calculated_attack: "/assets/crl/card-calculated-attack.png"
};

export function CardArtImage({ cardId }: { cardId: CardId }) {
  return <AssetImage className="card-cell-art" src={CARD_ART[cardId]} alt="" />;
}

export const CARD_BADGES: Record<CardId, Array<{ trait: "grip" | "overtaking" | "energy"; sign: "+" | "-"; label: TranslationKey }>> = {
  rain_grip: [
    { trait: "grip", sign: "+", label: "circuit_grip" },
    { trait: "overtaking", sign: "-", label: "circuit_overtaking" }
  ],
  fleet_maintenance: [{ trait: "energy", sign: "+", label: "circuit_energy" }],
  launch_boost: [
    { trait: "overtaking", sign: "+", label: "circuit_overtaking" },
    { trait: "energy", sign: "-", label: "circuit_energy" }
  ],
  urban_draft: [{ trait: "overtaking", sign: "+", label: "circuit_overtaking" }],
  final_surge: [
    { trait: "energy", sign: "+", label: "circuit_energy" },
    { trait: "overtaking", sign: "+", label: "circuit_overtaking" }
  ],
  fleet_sponsorship: [{ trait: "overtaking", sign: "-", label: "circuit_overtaking" }],
  soft_tires: [
    { trait: "overtaking", sign: "+", label: "circuit_overtaking" },
    { trait: "energy", sign: "-", label: "circuit_energy" }
  ],
  qualifying_focus: [{ trait: "overtaking", sign: "+", label: "circuit_overtaking" }],
  defensive_order: [
    { trait: "energy", sign: "+", label: "circuit_energy" },
    { trait: "overtaking", sign: "-", label: "circuit_overtaking" }
  ],
  adjustable_wing: [
    { trait: "overtaking", sign: "+", label: "circuit_overtaking" },
    { trait: "energy", sign: "-", label: "circuit_energy" }
  ],
  rain_mapping: [
    { trait: "grip", sign: "+", label: "circuit_grip" },
    { trait: "overtaking", sign: "-", label: "circuit_overtaking" }
  ],
  economy_mode: [
    { trait: "energy", sign: "+", label: "circuit_energy" },
    { trait: "overtaking", sign: "-", label: "circuit_overtaking" }
  ],
  pit_relay: [{ trait: "energy", sign: "+", label: "circuit_energy" }],
  hard_tires: [
    { trait: "energy", sign: "+", label: "circuit_energy" },
    { trait: "overtaking", sign: "-", label: "circuit_overtaking" }
  ],
  calculated_attack: [
    { trait: "overtaking", sign: "+", label: "circuit_overtaking" },
    { trait: "grip", sign: "-", label: "circuit_grip" }
  ]
};

const CARD_INFO_BADGES: Partial<Record<CardId, TranslationKey>> = {
  rain_grip: "card_info_weather",
  fleet_maintenance: "card_info_save",
  launch_boost: "card_info_start",
  urban_draft: "card_info_rival",
  final_surge: "card_info_finish",
  fleet_sponsorship: "card_info_credits",
  soft_tires: "card_info_early",
  qualifying_focus: "card_info_chrono",
  defensive_order: "card_info_defense",
  adjustable_wing: "card_info_attack",
  rain_mapping: "card_info_weather",
  economy_mode: "card_info_credits",
  pit_relay: "card_info_defense",
  hard_tires: "card_info_finish",
  calculated_attack: "card_info_rival"
};

const CARD_STRENGTH_LABEL: Record<CardStrengthBand, TranslationKey> = {
  weak: "card_strength_weak",
  medium: "card_strength_medium",
  strong: "card_strength_strong"
};

const BADGE_TRAIT_LABEL: Record<"grip" | "overtaking" | "energy", TranslationKey> = {
  grip: "circuit_grip_short",
  overtaking: "circuit_overtaking_short",
  energy: "circuit_energy_short"
};

const BADGE_TRAIT_HINT: Record<"grip" | "overtaking" | "energy", TranslationKey> = {
  grip: "circuit_grip_hint",
  overtaking: "circuit_overtaking_hint",
  energy: "circuit_energy_hint"
};

export function CardStatBadges({ cardId, tt }: { cardId: CardId; tt: Translator }) {
  const infoLabel = CARD_INFO_BADGES[cardId];
  const descriptor = CARD_DESCRIPTORS[cardId];

  return (
    <span className="card-stat-badges">
      {CARD_BADGES[cardId].map((badge) => {
        const label = `${badge.sign} ${tt(BADGE_TRAIT_LABEL[badge.trait])}`;
        const title = `${badge.sign} ${tt(badge.label)}. ${tt(BADGE_TRAIT_HINT[badge.trait])}`;
        return (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- informational stat badges need keyboard focus so native title/ARIA explanations are reachable outside hover.
          <span key={`${badge.sign}-${badge.trait}`} className={`card-stat-badge map-trait-${badge.trait} ${badge.sign === "-" ? "weakness" : "bonus"}`} title={title} aria-label={title} tabIndex={0}>
            <i aria-hidden="true"><VisualIcon name={badge.trait} /></i>
            <span>{label}</span>
          </span>
        );
      })}
      {infoLabel ? (
        <span className="card-stat-badge card-info-badge">
          <i aria-hidden="true">i</i>
          <span>{tt(infoLabel)}</span>
        </span>
      ) : null}
      <span className={`card-stat-badge card-info-badge card-strength-${descriptor.strength}`}>
        <i aria-hidden="true">i</i>
        <span>{tt(descriptor.conditionKey as TranslationKey)}</span>
      </span>
      <span className={`card-stat-badge card-info-badge card-strength-${descriptor.strength}`}>
        <i aria-hidden="true">i</i>
        <span>{tt(CARD_STRENGTH_LABEL[descriptor.strength]!)}</span>
      </span>
      <span className="card-stat-badge card-info-badge weakness">
        <i aria-hidden="true">i</i>
        <span>{tt(descriptor.downsideKey as TranslationKey)}</span>
      </span>
    </span>
  );
}
