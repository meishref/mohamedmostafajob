"use client";

import { Button } from "@/components/ui/button";
import { localeLabels, locales, type AppLocale } from "@/i18n/config";
import { useChangeLocale } from "@/i18n/locale";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";

export function LanguageSwitcher() {
  const t = useTranslations("locale");
  const { locale, changeLocale, isPending } = useChangeLocale();

  const nextLocale: AppLocale = locale === "en-US" ? "ar-SA" : "en-US";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={isPending}
      onClick={() => changeLocale(nextLocale)}
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{localeLabels[nextLocale]}</span>
      <span className="sm:hidden">{nextLocale === "ar-SA" ? "ع" : "EN"}</span>
    </Button>
  );
}

export function LanguageSelect() {
  const t = useTranslations("locale");
  const { locale, changeLocale, isPending } = useChangeLocale();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("switchLanguage")}</span>
      <select
        className="h-10 rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={locale}
        disabled={isPending}
        onChange={(e) => changeLocale(e.target.value as AppLocale)}
        aria-label={t("switchLanguage")}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
