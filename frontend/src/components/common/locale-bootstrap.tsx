"use client";

import { defaultLocale, isAppLocale, localeCookieName } from "@/i18n/config";
import { getStoredLocale, persistLocale } from "@/i18n/locale";
import { useLocale } from "next-intl";
import { useEffect } from "react";

/**
 * Restores locale preference from localStorage when cookie is missing,
 * and keeps html lang/dir in sync on the client.
 */
export function LocaleBootstrap() {
  const locale = useLocale();

  useEffect(() => {
    const stored = getStoredLocale();
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${localeCookieName}=`))
      ?.split("=")[1];

    if (!cookieMatch && stored && isAppLocale(stored) && stored !== locale) {
      persistLocale(stored);
      window.location.reload();
      return;
    }

    if (!stored && isAppLocale(locale)) {
      persistLocale(locale);
    }

    document.documentElement.lang = locale || defaultLocale;
    document.documentElement.dir = locale.startsWith("ar") ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
