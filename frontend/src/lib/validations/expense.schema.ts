"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

export function useCreateExpenseSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z.object({
        category_id: z.string().uuid({ message: t("categoryRequired") }),
        platform_id: z.string().uuid().optional().or(z.literal("")),
        amount: z.number({ message: t("amountRequired") }).min(0.01, t("amountMin")),
        currency: z.string().length(3, t("currencyLength")),
        expense_date: z.string().min(1, t("dateRequired")),
        notes: z.string().optional().or(z.literal("")),
      }),
    [t],
  );
}

export function useUpdateExpenseSchema() {
  return useCreateExpenseSchema();
}

export const createExpenseSchema = z.object({
  category_id: z.string(),
  platform_id: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  expense_date: z.string(),
  notes: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema;

export type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseFormValues = z.infer<typeof updateExpenseSchema>;
