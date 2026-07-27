import { CARD_DEFINITIONS, CARD_PRICES, TEAM_NAME_SUGGESTIONS, type CardId, type TeamLivery } from "@cr-league/shared";

export const LEAGUE_CADENCES = ["manual", "fast", "weekly"] as const;
export const STARTING_CREDITS = 180;
export const STARTER_CARDS: CardId[] = [];
export const CARD_SHOP = Object.keys(CARD_DEFINITIONS).map((cardId) => ({ cardId: cardId as CardId, price: CARD_PRICES[cardId as CardId] }));
export const DEFAULT_LIVERY: TeamLivery = { primary: "#16c784", secondary: "#38bdf8" };
export const PRIMARY_LIVERY_COLORS = ["#020617", "#050816", "#09090b", "#0b1020", "#111827", "#0f172a", "#120712", "#07120f"] as const;
export const SECONDARY_LIVERY_COLORS = ["#00f5ff", "#39ff14", "#ff2bd6", "#ffea00", "#ff6b00", "#7c3cff", "#00ff9d", "#ff1744"] as const;
export const BOT_TEAM_NAMES = TEAM_NAME_SUGGESTIONS;
export const DEFAULT_MAX_PLAYERS = 8;
export const MAX_PLAYERS_LIMIT = 16;
export const DEFAULT_QUALIFYING_ATTEMPTS = 3;
export const MAX_QUALIFYING_ATTEMPTS = 5;
export const DEFAULT_GRAND_PRIX_PER_SEASON = 6;
export const MAX_GRAND_PRIX_PER_SEASON = 18;
export const TEAM_NAME_LIMIT = 32;
export const LEAGUE_NAME_LIMIT = 40;
