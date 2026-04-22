import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/i18n/config";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = (SUPPORTED_LANGS as readonly string[]).includes(i18n.language)
    ? (i18n.language as Lang)
    : "ar";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-gold" />
        <span className="text-foreground text-sm">{t("common.language")}</span>
      </div>
      <div className="flex gap-1">
        {SUPPORTED_LANGS.map((lng) => {
          const meta = LANG_META[lng];
          const active = current === lng;
          return (
            <button
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={`px-2 py-1 rounded-md text-lg border transition-all ${
                active
                  ? "border-gold bg-gold/20 scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              title={meta.label}
              aria-label={meta.label}
            >
              {meta.flag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
