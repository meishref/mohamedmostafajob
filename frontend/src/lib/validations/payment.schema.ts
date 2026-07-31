"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

export function useCreatePaymentSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z.object({
        employee_id: z.string().uuid({ message: t("employeeRequired") }),
        payment_type_id: z.string().uuid({ message: t("paymentTypeRequired") }),
        payment_status_id: z.string().uuid({ message: t("paymentStatusRequired") }),
        amount: z.number({ message: t("amountRequired") }).min(0.01, t("amountMin")),
        currency: z.string().length(3, t("currencyLength")),
        payment_date: z.string().min(1, t("dateRequired")),
        reference: z.string().optional().or(z.literal("")),
        notes: z.string().optional().or(z.literal("")),
      }),
    [t],
  );
}

export function useUpdatePaymentSchema() {
  return useCreatePaymentSchema();
}

export const createPaymentSchema = z.object({
  employee_id: z.string(),
  payment_type_id: z.string(),
  payment_status_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  payment_date: z.string(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema;

export type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentFormValues = z.infer<typeof updatePaymentSchema>;
