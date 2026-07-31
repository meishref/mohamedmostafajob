"use client";

import { Select } from "@/components/ui/select";
import { useEmployeeOptions } from "@/hooks/use-tasks";
import { useTranslations } from "next-intl";

interface EmployeeSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function EmployeeSelect({
  value,
  onChange,
  id,
  placeholder,
  disabled,
}: EmployeeSelectProps) {
  const t = useTranslations("common");
  const tTasks = useTranslations("tasks");
  const { data: options = [], isLoading } = useEmployeeOptions();

  return (
    <Select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled || isLoading}
    >
      <option value="">
        {isLoading ? t("loading") : (placeholder ?? tTasks("allEmployees"))}
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
