"use client";

import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
  type AppLocale,
} from "@/i18n/config";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

const STORAGE_KEY = "app-locale";

export function getStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isAppLocale(stored) ? stored : null;
}

export function persistLocale(locale: AppLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function useChangeLocale() {
  const router = useRouter();
  const current = useLocale() as AppLocale;
  const [isPending, startTransition] = useTransition();

  const changeLocale = useCallback(
    (locale: AppLocale) => {
      if (locale === current) return;
      persistLocale(locale);
      startTransition(() => {
        router.refresh();
      });
    },
    [current, router],
  );

  return { locale: current || defaultLocale, changeLocale, isPending };
}
