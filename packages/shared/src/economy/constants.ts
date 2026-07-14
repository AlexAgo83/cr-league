import type { CardId } from "../domain/race.js";

export const RACE_POINTS_BY_POSITION = [25, 18, 15, 12, 10, 8] as const;
export const RACE_CREDITS_BY_POSITION = [150, 130, 115, 105, 100, 100] as const;
export const FLEET_SPONSORSHIP_CREDIT_BONUS = 50;
export const ECONOMY_MODE_CREDIT_BONUS = 35;
export const CARD_PRICES: Record<CardId, number> = {
  rain_grip: 115,
  fleet_maintenance: 115,
  launch_boost: 115,
  urban_draft: 115,
  final_surge: 115,
  fleet_sponsorship: 115,
  soft_tires: 115,
  qualifying_focus: 115,
  defensive_order: 115,
  adjustable_wing: 115,
  rain_mapping: 115,
  economy_mode: 115,
  pit_relay: 115,
  hard_tires: 115,
  calculated_attack: 115
};
