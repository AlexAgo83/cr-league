import { LanguageSwitcher, SetupTopbar } from "./AppChrome.js";
import { useT } from "../i18n/index.js";
import type { Locale } from "../i18n/index.js";

export function HomeSplash({
  locale,
  onChangeLocale,
  onEnter
}: {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  onEnter: () => void;
}) {
  const tt = useT();
  return (
    <main className="home-splash" aria-label={tt("splash_label")}>
      {/* Art-directed, not just responsive: the portrait key art letterboxes badly on a wide
          screen, and the landscape recomposition loses the car on a phone. */}
      <picture>
        <source media="(min-aspect-ratio: 1/1)" srcSet="/assets/crl/home-background-wide.webp" />
        <img className="home-splash-background" src="/assets/crl/home-background.jpg" alt="" />
      </picture>
      <SetupTopbar hideBrand profileMenu={null} languageSwitcher={<LanguageSwitcher locale={locale} onChangeLocale={onChangeLocale} />} onHome={() => undefined} />
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
