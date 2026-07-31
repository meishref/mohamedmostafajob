"use client";

import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";

export function useFormatters() {
  const locale = useLocale() as AppLocale;

  return {
    locale,
    formatDate: (value?: string | Date | null, options?: Intl.DateTimeFormatOptions) => {
      if (!value) return "—";
      const date = typeof value === "string" ? new Date(value) : value;
      if (Number.isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat(locale, options ?? { dateStyle: "medium" }).format(date);
    },
    formatDateTime: (value?: string | Date | null) => {
      if (!value) return "—";
      const date = typeof value === "string" ? new Date(value) : value;
      if (Number.isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    },
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(value),
    formatCurrency: (amount: string | number, currency = "SAR") => {
      const num = typeof amount === "string" ? parseFloat(amount) : amount;
      if (Number.isNaN(num)) return "—";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(num);
    },
  };
}
