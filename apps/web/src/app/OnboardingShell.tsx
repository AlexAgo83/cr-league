import { type ReactNode, useMemo, useState } from "react";
import { CITY_CIRCUITS } from "./circuits.js";
import { type TranslationKey } from "../i18n/index.js";
import { CircuitMap } from "../features/CircuitMap.js";
import { Modal } from "../features/Modal.js";
import { ModalHero } from "../features/ModalHero.js";

export const ONBOARDING_HELP_KEYS = {
  profileCode: "cr-league-help-profile-code",
  leagueIntro: "cr-league-help-league-intro",
  race: "cr-league-help-race",
  plan: "cr-league-help-plan",
  garage: "cr-league-help-garage"
} as const;

export const ONBOARDING_HELP_IMAGES = {
  race: "/assets/crl/track-briefing.png",
  plan: "/assets/crl/strategy-cards.png",
  garage: "/assets/crl/garage-empty.webp"
} as const;

const LEAGUE_ONBOARDING_IMAGES = [
  "/assets/crl/onboarding-pit-wall.webp",
  "/assets/crl/onboarding-setup.webp",
  "/assets/crl/onboarding-chrono.webp",
  "/assets/crl/onboarding-season.webp"
] as const;

export type OnboardingHelpTopic = keyof typeof ONBOARDING_HELP_KEYS;
export type StandardOnboardingHelpTopic = Exclude<OnboardingHelpTopic, "leagueIntro">;

export const SCREEN_ONBOARDING_HELP_TOPICS = ["race", "plan", "garage"] as const satisfies readonly OnboardingHelpTopic[];

function AmbientRaceBackground({ tt }: { tt: (key: TranslationKey) => string }) {
  const { circuit, cars } = useMemo(() => {
    const liveries: Array<[string, string]> = [
      ["#22c55e", "#052e16"],
      ["#38bdf8", "#082f49"],
      ["#facc15", "#451a03"],
      ["#fb7185", "#4c0519"],
      ["#a78bfa", "#2e1065"],
      ["#f97316", "#431407"],
      ["#14b8a6", "#042f2e"],
      ["#e5e7eb", "#111827"]
    ];
    return {
      circuit: CITY_CIRCUITS[Math.floor(Math.random() * CITY_CIRCUITS.length)]!,
      cars: liveries.map(([primary, secondary], index) => ({
        id: `ambient-${index}`,
        label: "",
        player: false,
        delay: -index * 2.2,
        duration: 14 + index * 1.4,
        repeatCount: "indefinite" as const,
        livery: { primary, secondary }
      }))
    };
  }, []);

  return (
    <div className="ambient-race-background" aria-hidden="true">
      <CircuitMap className="ambient-race-map" circuit={circuit} tt={tt} cars={cars} camera={{ enabled: true, car: cars[0] }} showHeading={false} framed={false} showTraits={false} />
    </div>
  );
}

export function SetupShell({
  children,
  errorModal,
  notificationStack,
  preferencesResetModal,
  profileCodeModal,
  profileLogoutModal,
  topbar,
  tt
}: {
  children: ReactNode;
  errorModal: ReactNode;
  notificationStack: ReactNode;
  preferencesResetModal: ReactNode;
  profileCodeModal: ReactNode;
  profileLogoutModal: ReactNode;
  topbar: ReactNode;
  tt: (key: TranslationKey) => string;
}) {
  return (
    <main className="app-shell setup-shell">
      <AmbientRaceBackground tt={tt} />
      {topbar}
      {children}
      {notificationStack}
      {errorModal}
      {preferencesResetModal}
      {profileCodeModal}
      {profileLogoutModal}
    </main>
  );
}

export function OnboardingHelpModal({
  topic,
  recoveryCode,
  onClose,
  tt
}: {
  topic: StandardOnboardingHelpTopic;
  recoveryCode?: string;
  onClose: (dismiss: boolean) => void;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const [dismiss, setDismiss] = useState(false);
  const items = topic === "profileCode" ? [] : [1, 2, 3].map((index) => tt(`onboarding_${topic}_item_${index}` as TranslationKey));
  const image = topic === "profileCode" ? "/assets/crl/profile-arrival.png" : ONBOARDING_HELP_IMAGES[topic];

  return (
    <Modal label={tt(`onboarding_${topic}_title` as TranslationKey)} onClose={() => onClose(dismiss)}>
      <ModalHero image={image} kicker={tt("onboarding_kicker")} title={tt(`onboarding_${topic}_title` as TranslationKey)} />
      <p>{tt(`onboarding_${topic}_body` as TranslationKey)}</p>
      {recoveryCode ? <strong className="onboarding-code">{recoveryCode}</strong> : null}
      {items.length ? (
        <ul className="onboarding-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <label className="checkbox-field onboarding-dismiss">
        <input type="checkbox" checked={dismiss} onChange={(event) => setDismiss(event.target.checked)} />
        {tt(`onboarding_${topic}_dismiss` as TranslationKey)}
      </label>
      <div className="actions secondary-actions">
        <button type="button" onClick={() => onClose(dismiss)}>
          {tt("action_got_it")}
        </button>
      </div>
    </Modal>
  );
}

export function LeagueIntroModal({
  onClose,
  tt
}: {
  onClose: (dismiss: boolean) => void;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const [step, setStep] = useState(0);
  const [dismiss, setDismiss] = useState(false);
  const stepNumber = step + 1;
  const isLastStep = step === LEAGUE_ONBOARDING_IMAGES.length - 1;

  return (
    <Modal label={tt("league_onboarding_title")} onClose={() => onClose(dismiss)}>
      <div className="league-onboarding">
        <ModalHero image={LEAGUE_ONBOARDING_IMAGES[step]!} kicker={tt("onboarding_kicker")} title={tt(`league_onboarding_step_${stepNumber}_title` as TranslationKey)} />
        <p>{tt(`league_onboarding_step_${stepNumber}_body` as TranslationKey)}</p>
        <div className="league-onboarding-dots" aria-label={tt("league_onboarding_progress")}>
          {LEAGUE_ONBOARDING_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === step ? "active" : undefined}
              aria-label={tt("league_onboarding_go_to_step", { step: index + 1 })}
              onClick={() => setStep(index)}
            />
          ))}
        </div>
        <label className="checkbox-field onboarding-dismiss">
          <input type="checkbox" checked={dismiss} onChange={(event) => setDismiss(event.target.checked)} />
          {tt("league_onboarding_dismiss")}
        </label>
        <div className="actions secondary-actions">
          <button type="button" className="secondary-button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            {tt("action_back")}
          </button>
          <button type="button" onClick={() => (isLastStep ? onClose(dismiss) : setStep((current) => current + 1))}>
            {isLastStep ? tt("action_start_racing") : tt("action_next")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
