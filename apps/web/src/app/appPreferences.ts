import { DIRECTIVE_STEP_KEY } from "../features/DirectivePanel.js";
import { DISMISSED_REPLAY_HELP_KEY, REPLAY_FOCUS_KEY, REPLAY_SPEED_KEY } from "../features/ReplayView.js";
import { ONBOARDING_HELP_KEYS, type OnboardingHelpTopic } from "./OnboardingShell.js";
import { DUEL_REGION_KEY, WHEEL_REGION_KEY } from "../features/arcade/arcadeStorage.js";
import { SEASON_RECAP_KEY_PREFIX, safeStorage } from "./appStorage.js";
import { AMBIENT_MAP_KEY, CHAMPIONSHIP_RECORD_TAB_KEY, GARAGE_PANEL_KEY } from "./viewPreferences.js";

export const UI_PREFERENCE_KEYS = [
  DISMISSED_REPLAY_HELP_KEY,
  REPLAY_SPEED_KEY,
  REPLAY_FOCUS_KEY,
  GARAGE_PANEL_KEY,
  CHAMPIONSHIP_RECORD_TAB_KEY,
  DIRECTIVE_STEP_KEY,
  "cr-league-card-consumption-help",
  "cr-league-card-consumption-help-v2",
  // The wheel's circuit pool is a remembered choice like the rest, and it was surviving the reset —
  // so "reset preferences" left whichever pool had been picked instead of restoring the default.
  // The participant list is not here on purpose: those are names somebody typed, not a preference.
  WHEEL_REGION_KEY,
  DUEL_REGION_KEY,
  AMBIENT_MAP_KEY,
  ...Object.values(ONBOARDING_HELP_KEYS)
] as const;

export const LEAGUE_SCOPED_HELP_TOPICS = new Set<OnboardingHelpTopic>(["leagueIntro", "race", "plan", "garage"]);

export function clearStoredUiPreferences(storage = safeStorage) {
  for (const key of UI_PREFERENCE_KEYS) storage.remove(key);
  const dynamicPreferenceKeys = storage.keys().filter(
    (key) =>
      key.startsWith(`${SEASON_RECAP_KEY_PREFIX}:`) ||
      key.startsWith(`${ONBOARDING_HELP_KEYS.leagueIntro}:`) ||
      key.startsWith(`${ONBOARDING_HELP_KEYS.race}:`) ||
      key.startsWith(`${ONBOARDING_HELP_KEYS.plan}:`) ||
      key.startsWith(`${ONBOARDING_HELP_KEYS.garage}:`)
  );
  for (const key of dynamicPreferenceKeys) storage.remove(key);
}
