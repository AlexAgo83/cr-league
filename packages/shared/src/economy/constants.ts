import type { CardId } from "../domain/race.js";

export const RACE_POINTS_BY_POSITION = [25, 18, 15, 12, 10, 8] as const;
export const RACE_CREDITS_BY_POSITION = [150, 130, 115, 105, 100, 100] as const;
export const FLEET_SPONSORSHIP_CREDIT_BONUS = 50;
export const ECONOMY_MODE_CREDIT_BONUS = 45;
export const COMEBACK_CREDIT_BONUS_PER_POSITION = 10;
export const COMEBACK_CREDIT_BONUS_CAP = 40;
export const CARD_PRICE = 120;
export const CARD_PRICES: Record<CardId, number> = {
  rain_grip: 120,
  fleet_maintenance: 250,
  launch_boost: 180,
  urban_draft: 180,
  final_surge: 120,
  fleet_sponsorship: 120,
  soft_tires: 180,
  qualifying_focus: 120,
  defensive_order: 250,
  adjustable_wing: 500,
  rain_mapping: 250,
  economy_mode: 120,
  pit_relay: 250,
  hard_tires: 250,
  calculated_attack: 250
};
