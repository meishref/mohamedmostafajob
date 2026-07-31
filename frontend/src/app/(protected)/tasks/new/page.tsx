"use client";

import { TaskFormFields } from "@/components/tasks/task-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useCreateTask } from "@/hooks/use-tasks";
import { useLookupOptions } from "@/hooks/use-settings";
import { useCreateTaskSchema, type CreateTaskFormValues } from "@/lib/validations/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const { parseError } = useApiError();
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const createTaskSchema = useCreateTaskSchema();
  const { data: statuses = [], isLoading: statusesLoading } = useLookupOptions("task-statuses");
  const { data: priorities = [], isLoading: prioritiesLoading } = useLookupOptions("priorities");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assigned_to: "",
      task_status_id: "",
      priority_id: "",
      start_date: "",
      due_date: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (statuses.length > 0 || priorities.length > 0) {
      const defaultStatus =
        statuses.find((s) => s.code === "todo" || s.code === "pending")?.id ?? statuses[0]?.id ?? "";
      const defaultPriority =
        priorities.find((p) => p.code === "medium" || p.code === "normal")?.id ??
        priorities[0]?.id ??
        "";
      reset((prev) => ({
        ...prev,
        task_status_id: prev.task_status_id || defaultStatus,
        priority_id: prev.priority_id || defaultPriority,
      }));
    }
  }, [statuses, priorities, reset]);

  const onSubmit = async (values: CreateTaskFormValues) => {
    try {
      await createTask.mutateAsync({
        title: values.title,
        description: values.description,
        assigned_to: values.assigned_to,
        task_status_id: values.task_status_id,
        priority_id: values.priority_id,
        start_date: values.start_date || undefined,
        due_date: values.due_date,
        notes: values.notes || undefined,
      });
      toast.success(t("toast.created"));
      router.push("/tasks");
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (statusesLoading || prioritiesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("new.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("new.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("new.cardTitle")}</CardTitle>
          <CardDescription>{t("new.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TaskFormFields register={register} errors={errors} control={control} />
            <div className="flex gap-3">
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? t("new.submitting") : t("new.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tasks">{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
