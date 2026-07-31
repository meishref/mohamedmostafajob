"use client";

import { Select } from "@/components/ui/select";
import { useLookupOptions } from "@/hooks/use-settings";
import type { SettingsResourceSlug } from "@/types/settings";
import { useTranslations } from "next-intl";

interface LookupSelectProps {
  resource: SettingsResourceSlug;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  placeholder?: string;
  excludeId?: string;
  disabled?: boolean;
}

export function LookupSelect({
  resource,
  value,
  onChange,
  id,
  placeholder,
  excludeId,
  disabled,
}: LookupSelectProps) {
  const t = useTranslations("common");
  const { data: options = [], isLoading } = useLookupOptions(resource);
  const filtered = excludeId ? options.filter((o) => o.id !== excludeId) : options;

  return (
    <Select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled || isLoading}
    >
      <option value="">{isLoading ? t("loading") : (placeholder ?? t("selectPlaceholder"))}</option>
      {filtered.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
