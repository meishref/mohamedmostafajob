"use client";

import type { FieldConfig, LookupRecord } from "@/types/settings";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { z } from "zod";

function fieldToZod(field: FieldConfig, requiredMessage: string): z.ZodTypeAny {
  switch (field.type) {
    case "text":
    case "color":
      return field.required
        ? z.string().min(1, requiredMessage)
        : z.string().optional().nullable();
    case "textarea":
    case "url":
      return z.string().optional().nullable();
    case "number":
      return field.required
        ? z.coerce.number().min(field.min ?? 0)
        : z.coerce.number().optional().nullable();
    case "boolean":
      return z.boolean().optional();
    case "date":
      return field.required
        ? z.string().min(1, requiredMessage)
        : z.string().optional().nullable();
    case "lookup":
      return z.string().uuid().optional().nullable().or(z.literal("").transform(() => null));
    default:
      return z.unknown();
  }
}

export function buildLookupSchema(
  fields: FieldConfig[],
  getRequiredMessage: (field: FieldConfig) => string = (f) => `${f.label} is required`,
) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.name] = fieldToZod(field, getRequiredMessage(field));
  }
  return z.object(shape);
}

export function useBuildLookupSchema() {
  const t = useTranslations("validation");
  return useCallback(
    (fields: FieldConfig[], getLabel: (field: FieldConfig) => string = (f) => f.label) =>
      buildLookupSchema(fields, (field) => t("fieldRequired", { field: getLabel(field) })),
    [t],
  );
}

export function buildDefaultValues(fields: FieldConfig[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.type) {
      case "boolean":
        defaults[field.name] = field.name === "is_active" ? true : false;
        break;
      case "number":
        defaults[field.name] = field.name === "sort_order" ? 0 : field.name === "level" ? 1 : "";
        break;
      case "lookup":
        defaults[field.name] = "";
        break;
      default:
        defaults[field.name] = "";
    }
  }
  return defaults;
}

export function recordToFormValues(
  record: LookupRecord,
  fields: FieldConfig[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    const val = record[field.name];
    if (field.type === "lookup") {
      values[field.name] = val ?? "";
    } else if (field.type === "boolean") {
      values[field.name] = Boolean(val);
    } else {
      values[field.name] = val ?? "";
    }
  }
  return values;
}
