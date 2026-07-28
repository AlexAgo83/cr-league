import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { t, TranslationProvider } from "./i18n/index.js";

// Components read the translator from context, so anything rendered in isolation needs a
// provider. English keeps the assertions in the test files readable. rerender is wrapped
// too, since testing-library replaces the whole tree — provider included.
export function renderWithT(ui: ReactElement) {
  const wrap = (node: ReactElement) => <TranslationProvider value={(key, params) => t(key, "en", params)}>{node}</TranslationProvider>;
  const result = render(wrap(ui));
  return { ...result, rerender: (next: ReactElement) => result.rerender(wrap(next)) };
}
