"use client";

import { FormField } from "@/components/common/form-field";
import { LookupSelect } from "@/components/common/lookup-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { FieldConfig, SettingsResourceSlug } from "@/types/settings";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

const FIELD_LABEL_KEYS: Record<string, string> = {
  name: "name",
  code: "code",
  description: "description",
  parent_id: "parentDepartment",
  department_id: "department",
  is_active: "isActive",
  color: "color",
  sort_order: "sortOrder",
  is_default: "isDefault",
  is_closed: "isClosed",
  level: "level",
  is_final: "isFinal",
  website: "website",
  from_currency: "fromCurrency",
  to_currency: "toCurrency",
  rate: "rate",
  effective_date: "effectiveDate",
};

export function useSettingsFieldLabel() {
  const t = useTranslations("settings.fields");
  return useCallback(
    (field: FieldConfig) => {
      const key = FIELD_LABEL_KEYS[field.name];
      return key ? t(key as "name") : field.label;
    },
    [t],
  );
}

interface LookupFormFieldsProps {
  fields: FieldConfig[];
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  control: Control<Record<string, unknown>>;
  excludeSelfId?: string;
}

export function LookupFormFields({
  fields,
  register,
  errors,
  control,
  excludeSelfId,
}: LookupFormFieldsProps) {
  const t = useTranslations("settings");
  const getLabel = useSettingsFieldLabel();

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const error = errors[field.name]?.message as string | undefined;
        const label = getLabel(field);
        const placeholder =
          field.name === "code"
            ? t("fields.codePlaceholder")
            : field.name === "website"
              ? t("fields.websitePlaceholder")
              : field.placeholder;

        if (field.type === "textarea") {
          return (
            <FormField key={field.name} label={label} htmlFor={field.name} error={error}>
              <textarea
                id={field.name}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={placeholder}
                {...register(field.name)}
              />
            </FormField>
          );
        }

        if (field.type === "boolean") {
          return (
            <FormField key={field.name} label={label} htmlFor={field.name} error={error}>
              <Controller
                name={field.name}
                control={control}
                render={({ field: ctrl }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={Boolean(ctrl.value)}
                      onCheckedChange={(checked) => ctrl.onChange(Boolean(checked))}
                    />
                    <label htmlFor={field.name} className="text-sm text-muted-foreground">
                      {label}
                    </label>
                  </div>
                )}
              />
            </FormField>
          );
        }

        if (field.type === "lookup" && field.lookupResource) {
          return (
            <FormField key={field.name} label={label} htmlFor={field.name} error={error}>
              <Controller
                name={field.name}
                control={control}
                render={({ field: ctrl }) => (
                  <LookupSelect
                    id={field.name}
                    resource={field.lookupResource as SettingsResourceSlug}
                    value={String(ctrl.value ?? "")}
                    onChange={ctrl.onChange}
                    excludeId={field.excludeSelf ? excludeSelfId : undefined}
                    placeholder={t("selectPlaceholder", { label: label.toLowerCase() })}
                  />
                )}
              />
            </FormField>
          );
        }

        const inputType =
          field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : field.type === "url"
                ? "url"
                : field.type === "color"
                  ? "color"
                  : "text";

        return (
          <FormField key={field.name} label={label} htmlFor={field.name} error={error}>
            <Input
              id={field.name}
              type={inputType}
              placeholder={placeholder}
              step={field.step}
              min={field.min}
              max={field.max}
              {...register(field.name)}
            />
          </FormField>
        );
      })}
    </div>
  );
}
