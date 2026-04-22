import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";

export const SUPPORTED_LANGS = ["ar", "en", "fr", "de"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const LANG_META: Record<Lang, { label: string; flag: string; dir: "rtl" | "ltr" }> = {
  ar: { label: "العربية", flag: "🇸🇦", dir: "rtl" },
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  fr: { label: "Français", flag: "🇫🇷", dir: "ltr" },
  de: { label: "Deutsch", flag: "🇩🇪", dir: "ltr" },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
    },
    fallbackLng: "ar",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "game-lang",
      caches: ["localStorage"],
    },
  });

export function applyLangToDocument(lang: string) {
  const meta = LANG_META[(lang as Lang)] ?? LANG_META.ar;
  document.documentElement.lang = lang;
  document.documentElement.dir = meta.dir;
}

i18n.on("languageChanged", applyLangToDocument);
applyLangToDocument(i18n.language);

export default i18n;
