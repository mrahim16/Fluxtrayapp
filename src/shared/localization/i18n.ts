import { createI18n } from "vue-i18n";

import en from "./locales/en.json";
import ar from "./locales/ar.json";
import fr from "./locales/fr.json";

const locale = localStorage.getItem("fluxbooks-language") ?? "en";

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: "en",
  messages: {
    en,
    ar,
    fr,
  },
});
