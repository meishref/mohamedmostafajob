"use client";

import { TaskFormFields } from "@/components/tasks/task-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useTask, useUpdateTask } from "@/hooks/use-tasks";
import { useUpdateTaskSchema, type UpdateTaskFormValues } from "@/lib/validations/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask(taskId);
  const { parseError } = useApiError();
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const updateTaskSchema = useUpdateTaskSchema();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        assigned_to: task.assigned_to ?? "",
        task_status_id: task.task_status_id,
        priority_id: task.priority_id,
        start_date: task.start_date ?? "",
        due_date: task.due_date ?? "",
        notes: task.notes ?? "",
      });
    }
  }, [task, reset]);

  const onSubmit = async (values: UpdateTaskFormValues) => {
    try {
      await updateTask.mutateAsync({
        title: values.title,
        description: values.description,
        assigned_to: values.assigned_to,
        task_status_id: values.task_status_id,
        priority_id: values.priority_id,
        start_date: values.start_date || null,
        due_date: values.due_date,
        notes: values.notes || null,
      });
      toast.success(t("toast.updated"));
      router.push(`/tasks/${taskId}`);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (isLoading || !task) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("edit.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("edit.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("edit.cardTitle")}</CardTitle>
          <CardDescription>{t("edit.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TaskFormFields register={register} errors={errors} control={control} />
            <div className="flex gap-3">
              <Button type="submit" disabled={updateTask.isPending}>
                {updateTask.isPending ? t("edit.saving") : t("edit.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/tasks/${taskId}`}>{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
