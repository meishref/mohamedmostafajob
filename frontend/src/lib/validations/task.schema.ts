"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

export function useCreateTaskSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z
        .object({
          title: z.string().min(1, t("titleRequired")).max(255),
          description: z.string().min(1, t("descriptionRequired")),
          assigned_to: z
            .string()
            .min(1, t("employeeRequired"))
            .uuid({ message: t("invalidUuid") }),
          task_status_id: z.string().uuid({ message: t("statusRequired") }),
          priority_id: z.string().uuid({ message: t("priorityRequired") }),
          start_date: z.string().optional().or(z.literal("")),
          due_date: z.string().min(1, t("dueDateRequired")),
          notes: z.string().optional().or(z.literal("")),
        })
        .refine(
          (data) => {
            if (!data.start_date || !data.due_date) return true;
            return new Date(data.due_date) >= new Date(data.start_date);
          },
          { message: t("dueDateAfterStart"), path: ["due_date"] },
        ),
    [t],
  );
}

export function useUpdateTaskSchema() {
  return useCreateTaskSchema();
}

export const createTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  assigned_to: z.string(),
  task_status_id: z.string(),
  priority_id: z.string(),
  start_date: z.string().optional(),
  due_date: z.string(),
  notes: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema;

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
