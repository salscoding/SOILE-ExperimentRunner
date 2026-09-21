import { createI18n } from "vue-i18n";

import en from "./english.json";
import fi from "./finnish.json";

const instance = createI18n({
  legacy: false,
  globalInjection: true,
  messages: {
    en,
    fi,
  },
  locale: "en",
  fallbackLocale: "en",
});

export const supportedLocales = [
  { id: "en", name: "English" },
  { id: "fi", name: "Suomi (Finnish)" },
];

export default instance;

export const i18n = instance.global;
