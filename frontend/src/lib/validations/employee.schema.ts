"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

export function useCreateEmployeeSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z.object({
        full_name: z.string().min(1, t("fullNameRequired")).max(255),
        email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
        phone: z.string().max(20).optional().or(z.literal("")),
        department_id: z.string().uuid().optional().or(z.literal("")),
        job_title_id: z.string().uuid().optional().or(z.literal("")),
        employee_status_id: z.string().uuid({ message: t("employmentStatusRequired") }),
        hire_date: z.string().optional().or(z.literal("")),
        notes: z.string().optional().or(z.literal("")),
      }),
    [t],
  );
}

export function useUpdateEmployeeSchema() {
  return useCreateEmployeeSchema();
}

export const createEmployeeSchema = z.object({
  full_name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  department_id: z.string().optional(),
  job_title_id: z.string().optional(),
  employee_status_id: z.string(),
  hire_date: z.string().optional(),
  notes: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema;

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;
