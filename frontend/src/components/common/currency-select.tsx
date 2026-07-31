"use client";

import { Select } from "@/components/ui/select";
import { useCurrencies } from "@/hooks/use-expenses";
import { useTranslations } from "next-intl";

interface CurrencySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function CurrencySelect({
  value,
  onChange,
  id,
  disabled,
  placeholder,
}: CurrencySelectProps) {
  const t = useTranslations("common");
  const { data: currencies = [], isLoading } = useCurrencies();

  return (
    <Select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled || isLoading}
    >
      <option value="">{isLoading ? t("loading") : (placeholder ?? t("selectPlaceholder"))}</option>
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.label}
        </option>
      ))}
    </Select>
  );
}
