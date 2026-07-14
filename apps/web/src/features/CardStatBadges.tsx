import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import type { Translator } from "../app/helpers.js";

const CARD_BADGES: Record<CardId, Array<{ trait: "grip" | "overtaking" | "energy"; sign: "+" | "-"; icon: string; label: TranslationKey }>> = {
  rain_grip: [
    { trait: "grip", sign: "+", icon: "◆", label: "circuit_grip" },
    { trait: "overtaking", sign: "-", icon: "↗", label: "circuit_overtaking" }
  ],
  fleet_maintenance: [{ trait: "energy", sign: "+", icon: "⚡", label: "circuit_energy" }],
  launch_boost: [
    { trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" },
    { trait: "energy", sign: "-", icon: "⚡", label: "circuit_energy" }
  ],
  urban_draft: [{ trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" }],
  final_surge: [
    { trait: "energy", sign: "+", icon: "⚡", label: "circuit_energy" },
    { trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" }
  ],
  fleet_sponsorship: [{ trait: "overtaking", sign: "-", icon: "↗", label: "circuit_overtaking" }],
  soft_tires: [
    { trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" },
    { trait: "energy", sign: "-", icon: "⚡", label: "circuit_energy" }
  ],
  qualifying_focus: [{ trait: "overtaking", sign: "+", icon: "↗", label: "circuit_overtaking" }],
  defensive_order: [
    { trait: "energy", sign: "+", icon: "⚡", label: "circuit_energy" },
    { trait: "overtaking", sign: "-", icon: "↗", label: "circuit_overtaking" }
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
  defensive_order: "card_info_defense"
};

export function CardStatBadges({ cardId, tt }: { cardId: CardId; tt: Translator }) {
  const infoLabel = CARD_INFO_BADGES[cardId];

  return (
    <span className="card-stat-badges">
      {CARD_BADGES[cardId].map((badge) => (
        <span key={`${badge.sign}-${badge.trait}`} className={`card-stat-badge map-trait-${badge.trait} ${badge.sign === "-" ? "weakness" : "bonus"}`}>
          <i aria-hidden="true">{badge.icon}</i>
          <span>
            {badge.sign} {tt(badge.label)}
          </span>
        </span>
      ))}
      {infoLabel ? (
        <span className="card-stat-badge card-info-badge">
          <i aria-hidden="true">i</i>
          <span>{tt(infoLabel)}</span>
        </span>
      ) : null}
    </span>
  );
}
