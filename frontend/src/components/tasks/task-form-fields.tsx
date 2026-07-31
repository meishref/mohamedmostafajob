"use client";

import { FormField } from "@/components/common/form-field";
import { EmployeeSelect } from "@/components/common/employee-select";
import { LookupSelect } from "@/components/common/lookup-select";
import { Input } from "@/components/ui/input";
import type { CreateTaskFormValues, UpdateTaskFormValues } from "@/lib/validations/task.schema";
import { useTranslations } from "next-intl";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

interface TaskFormFieldsProps {
  register: UseFormRegister<CreateTaskFormValues | UpdateTaskFormValues>;
  errors: FieldErrors<CreateTaskFormValues | UpdateTaskFormValues>;
  control: Control<CreateTaskFormValues | UpdateTaskFormValues>;
}

export function TaskFormFields({ register, errors, control }: TaskFormFieldsProps) {
  const t = useTranslations("tasks.fields");

  return (
    <div className="space-y-4">
      <FormField label={t("title")} htmlFor="title" error={errors.title?.message}>
        <Input id="title" placeholder={t("titlePlaceholder")} {...register("title")} />
      </FormField>

      <FormField label={t("description")} htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t("descriptionPlaceholder")}
          {...register("description")}
        />
      </FormField>

      <FormField label={t("assignedEmployee")} htmlFor="assigned_to" error={errors.assigned_to?.message}>
        <Controller
          name="assigned_to"
          control={control}
          render={({ field }) => (
            <EmployeeSelect
              id="assigned_to"
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={t("selectEmployee")}
            />
          )}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("status")} htmlFor="task_status_id" error={errors.task_status_id?.message}>
          <Controller
            name="task_status_id"
            control={control}
            render={({ field }) => (
              <LookupSelect
                resource="task-statuses"
                placeholder={t("selectStatus")}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>

        <FormField label={t("priority")} htmlFor="priority_id" error={errors.priority_id?.message}>
          <Controller
            name="priority_id"
            control={control}
            render={({ field }) => (
              <LookupSelect
                resource="priorities"
                placeholder={t("selectPriority")}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("startDate")} htmlFor="start_date" error={errors.start_date?.message}>
          <Input id="start_date" type="date" {...register("start_date")} />
        </FormField>

        <FormField label={t("dueDate")} htmlFor="due_date" error={errors.due_date?.message}>
          <Input id="due_date" type="date" {...register("due_date")} />
        </FormField>
      </div>

      <FormField label={t("notes")} htmlFor="notes" error={errors.notes?.message}>
        <textarea
          id="notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t("notesPlaceholder")}
          {...register("notes")}
        />
      </FormField>
    </div>
  );
}
