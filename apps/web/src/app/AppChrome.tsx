import { APP_NAME, APP_VERSION } from "@cr-league/shared";
import { useT } from "../i18n/index.js";
import type { ReactNode } from "react";
import type { Locale, TranslationKey } from "../i18n/index.js";
import { AssetImage } from "../features/AssetImage.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { BoardIcon, CountryBadge, type BoardIconName } from "../features/VisualIcon.js";
import { GAME_VIEWS, type GameView } from "./types.js";
import { useAmbientMapEnabled } from "./viewPreferences.js";
import type { Notification } from "./useNotifications.js";
import { usePwaInstall, usePwaUpdate } from "./pwa.js";

const GAME_VIEW_ICONS: Record<GameView, BoardIconName> = {
  admin: "admin-tools",
  changelog: "changelog",
  championship: "championship",
  drive: "stand-drive",
  garage: "garage",
  plan: "edit-plan"
};

export function NotificationStack({ notifications, onDismiss }: { notifications: Notification[]; onDismiss: (id: number) => void }) {
  const tt = useT();
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

export function LanguageSwitcher({ locale, onChangeLocale }: { locale: Locale; onChangeLocale: (locale: Locale) => void }) {
  const tt = useT();
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
  hasLeague,
  isSoloLeague = false,
  isAdmin,
  hasRecoveryCode,
  onChangeLocale,
  onLeaveToMenu,
  onResumeGame,
  onToggleOpen,
  onClose,
  onOpenLeagueControls,
  onOpenAdminConsole,
  onOpenProfileCode,
  onOpenPreferencesReset,
  onOpenSoloReset,
  onOpenProfileLogout,
  onOpenChangelog
}: {
  locale: Locale;
  profileOpen: boolean;
  playerTeamName?: string;
  pendingMessage: string | null;
  hasLeague: boolean;
  isSoloLeague?: boolean;
  isAdmin: boolean;
  hasRecoveryCode: boolean;
  onChangeLocale: (locale: Locale) => void;
  /** Both mirror the topbar pills, which a phone has no room for. Hidden on wide screens. */
  onLeaveToMenu?: () => void;
  onResumeGame?: () => void;
  onToggleOpen: () => void;
  onClose: () => void;
  onOpenLeagueControls: () => void;
  onOpenAdminConsole: () => void;
  onOpenProfileCode: () => void;
  onOpenPreferencesReset: () => void;
  onOpenSoloReset: () => void;
  onOpenProfileLogout: () => void;
  onOpenChangelog: () => void;
}) {
  const tt = useT();
  const [ambientMap, setAmbientMap] = useAmbientMapEnabled();
  const { canInstall, promptInstall } = usePwaInstall();
  const { updateReady, applyUpdate } = usePwaUpdate();
  return (
    <div
      className="profile-menu"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button type="button" data-testid="profile-menu" className="profile-menu-button" aria-label={tt("profile_menu")} aria-expanded={profileOpen} onClick={onToggleOpen}>
        {/* Without a team there are no initials to show, and "CR" read as a logo rather than
            something to press. A menu glyph says what the button does. */}
        {playerTeamName ? playerTeamName.slice(0, 2).toUpperCase() : <MenuGlyph />}
      </button>
      {profileOpen ? (
        <div className="profile-menu-panel">
          <PendingFeedback message={pendingMessage} />
          <LanguageSwitcher locale={locale} onChangeLocale={onChangeLocale} />
          {onLeaveToMenu ? (
            <button type="button" data-testid="profile-action-leave-to-menu" className="profile-menu-action profile-menu-narrow-only" onClick={onLeaveToMenu}>
              {tt("menu_title")}
            </button>
          ) : null}
          {onResumeGame ? (
            <button type="button" data-testid="profile-action-resume-game" className="profile-menu-action profile-menu-narrow-only" onClick={onResumeGame}>
              {tt("action_resume_game")}
            </button>
          ) : null}
          <hr className="profile-menu-separator" />
          {hasLeague && !isSoloLeague ? (
            <button type="button" data-testid="profile-action-race-direction" className="profile-menu-action" onClick={onOpenLeagueControls}>
              {tt("settings_title")}
            </button>
          ) : null}
          {isAdmin ? (
            <button type="button" data-testid="profile-action-admin" className="profile-menu-action profile-menu-action-info" onClick={onOpenAdminConsole}>
              {tt("admin_action_open")}
            </button>
          ) : null}
          {hasRecoveryCode ? (
            <button type="button" data-testid="profile-action-profile-code" className="profile-menu-action profile-menu-action-info" onClick={onOpenProfileCode}>
              {tt("action_copy_profile_code")}
            </button>
          ) : null}
          {/* A switch rather than an action: it says what it is and what it currently is. */}
          <label className="profile-menu-action profile-menu-toggle">
            <input type="checkbox" checked={ambientMap} onChange={(event) => setAmbientMap(event.target.checked)} />
            {tt("action_ambient_map")}
          </label>
          <button type="button" data-testid="profile-action-reset-preferences" className="profile-menu-action profile-menu-action-info" onClick={onOpenPreferencesReset}>
            {tt("action_reset_ui_preferences")}
          </button>
          {isSoloLeague ? (
            <button type="button" data-testid="profile-action-reset-solo" className="profile-menu-action profile-menu-action-danger" onClick={onOpenSoloReset}>
              {tt("action_reset_solo")}
            </button>
          ) : null}
          {updateReady ? (
            <button type="button" className="profile-menu-action profile-menu-action-info" onClick={applyUpdate}>
              {tt("action_update_app")}
            </button>
          ) : canInstall ? (
            <button type="button" className="profile-menu-action profile-menu-action-info" onClick={promptInstall}>
              {tt("action_install_app")}
            </button>
          ) : null}
          <button type="button" data-testid="profile-action-sign-out" className="profile-menu-action profile-menu-action-danger" onClick={onOpenProfileLogout}>
            {tt("action_forget_profile")}
          </button>
          <hr className="profile-menu-separator" />
          <button type="button" data-testid="profile-action-changelog" className="profile-menu-version" onClick={onOpenChangelog}>
            v{APP_VERSION}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function BrandLoadingIndicator({ pendingMessage }: { pendingMessage: string | null }) {
  return pendingMessage ? (
    <span className="brand-loading-spinner" role="status" title={pendingMessage}>
      <span />
      <span />
      <span />
      <span className="visually-hidden">{pendingMessage}</span>
    </span>
  ) : null;
}

function MenuGlyph() {
  return (
    <svg className="profile-menu-glyph" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2 4h12M2 8h12M2 12h12" />
    </svg>
  );
}

export function SetupTopbar({ profileMenu, languageSwitcher, pendingMessage = null, onHome, onResumeGame, onLeaveToMenu, hideBrand = false, hideWordmark = false }: { profileMenu: ReactNode; languageSwitcher: ReactNode; pendingMessage?: string | null; onHome: () => void; /** Absent unless a game was left behind. It lives here rather than in the profile menu: a solo player has no profile, so no menu. */ onResumeGame?: () => void; /** Inside an arcade game, where the way out matters more than a game left behind elsewhere. Takes the slot rather than sharing it. */ onLeaveToMenu?: () => void; hideBrand?: boolean; hideWordmark?: boolean }) {
  const tt = useT();
  return (
    <header className="setup-topbar">
      {hideBrand ? null : (
        <button type="button" className="brand brand-button" aria-label={APP_NAME} onClick={onHome}>
          <span className="brand-icon-slot">
            <AssetImage className="brand-icon brand-icon-cr" src="/assets/crl/home-title-cr.webp" alt="" loading="eager" />
            <BrandLoadingIndicator pendingMessage={pendingMessage} />
          </span>
          {hideWordmark ? null : <AssetImage className="brand-wordmark" src="/assets/crl/home-title-league.webp" alt={APP_NAME} loading="eager" />}
        </button>
      )}
      <div className="setup-topbar-actions">
        {onLeaveToMenu ? (
          <button type="button" data-testid="setup-leave-to-menu" className="topbar-pill-button" aria-label={tt("menu_title")} onClick={onLeaveToMenu}>
            <BoardIcon className="topbar-pill-icon" name="previous-action" />
            <span className="topbar-pill-label">{tt("menu_title")}</span>
          </button>
        ) : onResumeGame ? (
          <button type="button" data-testid="setup-resume-game" className="topbar-pill-button" aria-label={tt("action_resume_game")} onClick={onResumeGame}>
            <BoardIcon className="topbar-pill-icon" name="stand-drive" />
            {/* Dropped on a phone, where the label pushed the language pills off the edge. */}
            <span className="topbar-pill-label">{tt("action_resume_game")}</span>
          </button>
        ) : null}
        {profileMenu ?? languageSwitcher}
      </div>
    </header>
  );
}

export function GameTopbar({
  leagueName,
  modeBadge,
  gameView,
  pendingMessage = null,
  profileMenu,
  onHome,
  onLeaveToMenu,
  onSelectView
}: {
  leagueName: string;
  modeBadge?: string;
  gameView: GameView;
  pendingMessage?: string | null;
  profileMenu: ReactNode;
  onHome: () => void;
  /** The same exit the profile menu offers, surfaced on wide screens where there is room. */
  onLeaveToMenu: () => void;
  onSelectView: (view: GameView) => void;
}) {
  const tt = useT();
  return (
    <header className="topbar">
      <button type="button" className="brand brand-button" aria-label={`${APP_NAME} ${leagueName}`} onClick={onHome}>
        <span className="brand-icon-slot">
          <AssetImage className="brand-icon brand-icon-cr" src="/assets/crl/home-title-cr.webp" alt="" loading="eager" />
          <BrandLoadingIndicator pendingMessage={pendingMessage} />
          {/* Inside the logo slot, not next to it: the slot is the box the badge sits on. */}
          {modeBadge ? <span className="topbar-mode-badge">{modeBadge}</span> : null}
        </span>
        <strong>{leagueName}</strong>
      </button>
      <nav className="game-nav" aria-label={tt("cockpit_sections")}>
        {GAME_VIEWS.map((view) => (
          <button key={view} type="button" data-testid={`nav-${view}`} className={gameView === view ? "active" : undefined} aria-label={tt(`rail_${view}` as TranslationKey)} onClick={() => onSelectView(view)}>
            <BoardIcon className="nav-board-icon" name={GAME_VIEW_ICONS[view]} />
            <span className="nav-label-full">{tt(`rail_${view}` as TranslationKey)}</span>
            <span className="nav-label-short" aria-hidden="true">
              {tt(`rail_short_${view}` as TranslationKey)}
            </span>
          </button>
        ))}
      </nav>
      <button type="button" data-testid="topbar-leave-to-menu" className="topbar-pill-button" onClick={onLeaveToMenu}>
        <BoardIcon className="topbar-pill-icon" name="previous-action" />
        <span className="topbar-pill-label">{tt("menu_title")}</span>
      </button>
      {profileMenu}
    </header>
  );
}
