"use client";

import { normalizeRole } from "@/lib/roles";
import { useTranslations } from "next-intl";

export function useRoleLabel() {
  const t = useTranslations("roles");

  return (role: string): string => {
    const normalized = normalizeRole(role);
    if (normalized === "admin" || normalized === "employee") {
      return t(normalized);
    }
    return normalized;
  };
}
