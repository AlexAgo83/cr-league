import { LanguageSwitcher, SetupTopbar } from "./AppChrome.js";
import type { Locale, TranslationKey } from "../i18n/index.js";

export function HomeSplash({
  locale,
  tt,
  onChangeLocale,
  onEnter
}: {
  locale: Locale;
  tt: (key: TranslationKey) => string;
  onChangeLocale: (locale: Locale) => void;
  onEnter: () => void;
}) {
  return (
    <main className="home-splash" aria-label={tt("splash_label")}>
      <img className="home-splash-background" src="/assets/crl/home-background.jpg" alt="" />
      <SetupTopbar hideBrand profileMenu={null} languageSwitcher={<LanguageSwitcher locale={locale} tt={tt} onChangeLocale={onChangeLocale} />} onHome={() => undefined} />
      <div className="home-splash-title" aria-hidden="true">
        <img className="home-splash-title-cr" src="/assets/crl/home-title-cr.webp" alt="" />
        <img className="home-splash-title-league" src="/assets/crl/home-title-league.webp" alt="" />
      </div>
      <button type="button" className="home-press-start" onClick={onEnter}>
        {tt("splash_press_start")}
      </button>
    </main>
  );
}
