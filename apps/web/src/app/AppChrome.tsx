import { APP_NAME, APP_VERSION } from "@cr-league/shared";
import type { ReactNode } from "react";
import type { Locale, TranslationKey } from "../i18n/index.js";
import { AssetImage } from "../features/AssetImage.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { CountryBadge } from "../features/VisualIcon.js";
import type { StoredPlayerClaim } from "./appStorage.js";
import { GAME_VIEWS, type GameView } from "./types.js";
import type { Translator } from "./helpers.js";

type Notification = { id: number; text: string; tone: "info" | "error"; persistent?: boolean };

export function NotificationStack({ notifications, tt, onDismiss }: { notifications: Notification[]; tt: Translator; onDismiss: (id: number) => void }) {
  return notifications.length ? (
    <div className="notification-stack" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className={`floating-notification ${notification.tone}`}>
          <p>{notification.text}</p>
          <button type="button" aria-label={tt("notification_close")} onClick={() => onDismiss(notification.id)} />
        </div>
      ))}
    </div>
  ) : null;
}

export function LanguageSwitcher({ locale, tt, onChangeLocale }: { locale: Locale; tt: Translator; onChangeLocale: (locale: Locale) => void }) {
  return (
    <div className="language-select" role="group" aria-label={tt("language_label")}>
      <span>{tt("language_label")}</span>
      {(["en", "fr"] as const).map((nextLocale) => (
        <button key={nextLocale} type="button" className={locale === nextLocale ? "active" : undefined} aria-label={tt(`language_${nextLocale}`)} aria-pressed={locale === nextLocale} onClick={() => onChangeLocale(nextLocale)}>
          <CountryBadge country={nextLocale === "en" ? "GB" : "FR"} />
          {nextLocale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function ProfileMenu({
  locale,
  profileOpen,
  playerTeamName,
  pendingMessage,
  savedClaims,
  activeTeamId,
  showManageLeague = true,
  showLeagueSwitch = true,
  hasLeague,
  isAdmin,
  hasRecoveryCode,
  tt,
  onChangeLocale,
  onToggleOpen,
  onClose,
  onSwitchLeague,
  onAddLeague,
  onOpenLeagueControls,
  onOpenAdminConsole,
  onOpenProfileCode,
  onOpenPreferencesReset,
  onOpenProfileLogout,
  onOpenChangelog
}: {
  locale: Locale;
  profileOpen: boolean;
  playerTeamName?: string;
  pendingMessage: string | null;
  savedClaims: StoredPlayerClaim[];
  activeTeamId: string;
  showManageLeague?: boolean;
  showLeagueSwitch?: boolean;
  hasLeague: boolean;
  isAdmin: boolean;
  hasRecoveryCode: boolean;
  tt: Translator;
  onChangeLocale: (locale: Locale) => void;
  onToggleOpen: () => void;
  onClose: () => void;
  onSwitchLeague: (teamId: string) => void;
  onAddLeague: () => void;
  onOpenLeagueControls: () => void;
  onOpenAdminConsole: () => void;
  onOpenProfileCode: () => void;
  onOpenPreferencesReset: () => void;
  onOpenProfileLogout: () => void;
  onOpenChangelog: () => void;
}) {
  return (
    <div
      className="profile-menu"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button type="button" className="profile-menu-button" aria-label={tt("profile_menu")} aria-expanded={profileOpen} onClick={onToggleOpen}>
        {playerTeamName?.slice(0, 2).toUpperCase() ?? "CR"}
      </button>
      {profileOpen ? (
        <div className="profile-menu-panel">
          <PendingFeedback message={pendingMessage} />
          {showLeagueSwitch && savedClaims.length > 1 ? (
            <label>
              {tt("profile_league_switch")}
              <select value={activeTeamId} onChange={(event) => onSwitchLeague(event.target.value)}>
                {savedClaims.map((claim) => (
                  <option key={claim.teamId} value={claim.teamId}>
                    {claim.leagueName} · {claim.teamName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {showManageLeague ? (
            <button type="button" className="profile-menu-action" onClick={onAddLeague}>
              {tt("action_add_league")}
            </button>
          ) : null}
          {hasLeague ? (
            <button type="button" className="profile-menu-action" onClick={onOpenLeagueControls}>
              {tt("settings_title")}
            </button>
          ) : null}
          {isAdmin ? (
            <button type="button" className="profile-menu-action profile-menu-action-info" onClick={onOpenAdminConsole}>
              {tt("admin_action_open")}
            </button>
          ) : null}
          {hasRecoveryCode ? (
            <button type="button" className="profile-menu-action profile-menu-action-info" onClick={onOpenProfileCode}>
              {tt("action_copy_profile_code")}
            </button>
          ) : null}
          <LanguageSwitcher locale={locale} tt={tt} onChangeLocale={onChangeLocale} />
          <button type="button" className="profile-menu-action profile-menu-action-info" onClick={onOpenPreferencesReset}>
            {tt("action_reset_ui_preferences")}
          </button>
          <button type="button" className="profile-menu-action profile-menu-action-danger" onClick={onOpenProfileLogout}>
            {tt("action_forget_profile")}
          </button>
          <button type="button" className="profile-menu-version" onClick={onOpenChangelog}>
            v{APP_VERSION}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SetupTopbar({ profileMenu, languageSwitcher, onHome }: { profileMenu: ReactNode; languageSwitcher: ReactNode; onHome: () => void }) {
  return (
    <header className="setup-topbar">
      <button type="button" className="brand brand-button" onClick={onHome}>
        <AssetImage className="brand-icon brand-icon-cr" src="/assets/crl/home-title-cr.png" alt="" loading="eager" />
        <AssetImage className="brand-wordmark" src="/assets/crl/home-title-league.png" alt={APP_NAME} loading="eager" />
      </button>
      <div className="setup-topbar-actions">{profileMenu ?? languageSwitcher}</div>
    </header>
  );
}

export function GameTopbar({
  leagueName,
  gameView,
  profileMenu,
  tt,
  onHome,
  onSelectView
}: {
  leagueName: string;
  gameView: GameView;
  profileMenu: ReactNode;
  tt: Translator;
  onHome: () => void;
  onSelectView: (view: GameView) => void;
}) {
  return (
    <header className="topbar">
      <button type="button" className="brand brand-button" onClick={onHome}>
        <AssetImage className="brand-icon brand-icon-cr" src="/assets/crl/home-title-cr.png" alt="" loading="eager" />
        <strong>{leagueName}</strong>
      </button>
      <nav className="game-nav" aria-label={tt("cockpit_sections")}>
        {GAME_VIEWS.map((view) => (
          <button key={view} type="button" className={gameView === view ? "active" : undefined} onClick={() => onSelectView(view)}>
            <span className="nav-label-full">{tt(`rail_${view}` as TranslationKey)}</span>
            <span className="nav-label-short" aria-hidden="true">
              {tt(`rail_short_${view}` as TranslationKey)}
            </span>
          </button>
        ))}
      </nav>
      {profileMenu}
    </header>
  );
}
