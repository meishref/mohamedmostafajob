export const locales = ["en-US", "ar-SA"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en-US";

export const localeCookieName = "NEXT_LOCALE";

export const localeLabels: Record<AppLocale, string> = {
  "en-US": "English",
  "ar-SA": "العربية",
};

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDirection(locale: AppLocale): "ltr" | "rtl" {
  return locale.startsWith("ar") ? "rtl" : "ltr";
}
