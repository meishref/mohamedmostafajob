"use client";

import { AttachmentManager } from "@/components/common/attachment-manager";
import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { DetailPageSkeleton } from "@/components/common/detail-page-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { NotFoundState } from "@/components/common/not-found-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFormatters } from "@/hooks/use-formatters";
import { usePermissions } from "@/hooks/use-permissions";
import { useLookupOptions } from "@/hooks/use-settings";
import {
  useAddTaskComment,
  useDeleteTask,
  useRestoreTask,
  useTask,
  useTaskComments,
  useUpdateTaskStatus,
} from "@/hooks/use-tasks";
import { EMPLOYEE_TASK_STATUS_CODES } from "@/types/tasks";
import { ArrowLeft, ExternalLink, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { data: task, isLoading, isError, refetch } = useTask(taskId);
  const {
    canUpdateTasks,
    canDeleteTasks,
    canRestoreTasks,
    canUpdateTaskStatus,
    canCommentTasks,
    canViewOwnTasks,
  } = usePermissions();
  const deleteTask = useDeleteTask();
  const restoreTask = useRestoreTask();
  const updateStatus = useUpdateTaskStatus(taskId);
  const addComment = useAddTaskComment(taskId);
  const canViewComments = canCommentTasks || canUpdateTasks || canViewOwnTasks;
  const { data: comments = [], isLoading: commentsLoading } = useTaskComments(
    taskId,
    canViewComments,
  );
  const { data: statuses = [] } = useLookupOptions("task-statuses");
  const confirm = useConfirm();
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate, formatDateTime } = useFormatters();
  const [commentBody, setCommentBody] = useState("");

  const statusOnly = canUpdateTaskStatus && !canUpdateTasks;
  const canChangeStatus = (canUpdateTaskStatus || canUpdateTasks) && !task?.deleted_at;
  const canAddComment = (canCommentTasks || canUpdateTasks) && !task?.deleted_at;

  const statusOptions = useMemo(() => {
    if (!statusOnly) return statuses;
    const allowed = statuses.filter((s) =>
      EMPLOYEE_TASK_STATUS_CODES.includes(
        (s.code ?? "") as (typeof EMPLOYEE_TASK_STATUS_CODES)[number],
      ),
    );
    if (
      task?.task_status_id &&
      !allowed.some((s) => s.id === task.task_status_id)
    ) {
      const current = statuses.find((s) => s.id === task.task_status_id);
      if (current) return [current, ...allowed];
    }
    return allowed;
  }, [statuses, statusOnly, task?.task_status_id]);

  const handleDelete = async () => {
    if (!task) return;
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.shortDescription", { title: task.title }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success(t("toast.deleted"));
      router.push("/tasks");
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async () => {
    if (!task) return;
    try {
      await restoreTask.mutateAsync(task.id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  const handleStatusChange = async (task_status_id: string) => {
    if (!task || !task_status_id || task_status_id === task.task_status_id) return;
    try {
      await updateStatus.mutateAsync(task_status_id);
      toast.success(t("updateStatus.success"));
    } catch {
      toast.error(t("updateStatus.failed"));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = commentBody.trim();
    if (!body) return;
    try {
      await addComment.mutateAsync({ body });
      setCommentBody("");
      toast.success(t("comments.added"));
    } catch {
      toast.error(t("comments.addFailed"));
    }
  };

  if (isLoading) return <DetailPageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!task) {
    return (
      <NotFoundState
        title={t("detail.notFoundTitle")}
        message={t("detail.notFoundMessage")}
        backHref="/tasks"
        backLabel={t("detail.backLabel")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
            <p className="text-sm text-muted-foreground">
              {t("detail.createdOn", { date: formatDate(task.created_at) })}
              {task.is_overdue && (
                <Badge variant="destructive" className="ms-2">
                  {t("detail.overdue")}
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!task.deleted_at && canUpdateTasks && (
            <Button variant="outline" asChild>
              <Link href={`/tasks/${task.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {tCommon("edit")}
              </Link>
            </Button>
          )}
          {task.deleted_at && canRestoreTasks && (
            <Button variant="outline" onClick={handleRestore} disabled={restoreTask.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {tCommon("restore")}
            </Button>
          )}
          {!task.deleted_at && canDeleteTasks && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {task.task_status && (
              <Badge
                variant="outline"
                style={
                  task.task_status.color
                    ? { borderColor: task.task_status.color, color: task.task_status.color }
                    : undefined
                }
              >
                {task.task_status.name}
              </Badge>
            )}
            {task.priority && (
              <Badge
                variant="secondary"
                style={
                  task.priority.color
                    ? { borderColor: task.priority.color, color: task.priority.color }
                    : undefined
                }
              >
                {task.priority.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {canChangeStatus && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {statusOnly ? t("updateStatus.label") : t("detail.status")}
              </p>
              <Select
                value={task.task_status_id}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updateStatus.isPending}
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {task.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.description")}</p>
              <p className="mt-1 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.startDate")}</p>
              <p>{formatDate(task.start_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.dueDate")}</p>
              <p>{formatDate(task.due_date)}</p>
            </div>
          </div>

          {task.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.notes")}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{task.notes}</p>
              </div>
            </>
          )}

          {task.creator && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("assignedBy")}</p>
                <p>{task.creator.name}</p>
                <p className="text-sm text-muted-foreground">{task.creator.email}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {task.assignee && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.assignedEmployee")}</CardTitle>
            <CardDescription>{t("detail.assignedEmployeeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={task.assignee.profile_image_url ?? undefined} />
                  <AvatarFallback>
                    {task.assignee.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.assignee.full_name}</p>
                  <p className="text-sm text-muted-foreground">{task.assignee.employee_number}</p>
                  <p className="text-sm">{task.assignee.email}</p>
                </div>
              </div>
              {canUpdateTasks && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employees/${task.assignee.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("detail.viewEmployee")}
                  </Link>
                </Button>
              )}
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.department")}</p>
                <p>{task.assignee.department?.name ?? tCommon("na")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.jobTitle")}</p>
                <p>{task.assignee.job_title?.name ?? tCommon("na")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.status")}</p>
                {task.assignee.employee_status ? (
                  <Badge
                    variant="outline"
                    style={
                      task.assignee.employee_status.color
                        ? {
                            borderColor: task.assignee.employee_status.color,
                            color: task.assignee.employee_status.color,
                          }
                        : undefined
                    }
                  >
                    {task.assignee.employee_status.name}
                  </Badge>
                ) : (
                  tCommon("na")
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AttachmentManager
        resource="tasks"
        resourceId={task.id}
        canUpload={canUpdateTasks}
        canDelete={canUpdateTasks}
      />

      {canViewComments && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("comments.title")}</CardTitle>
            <CardDescription>{t("comments.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {commentsLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("comments.empty")}</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {comment.user?.name ?? tCommon("system")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(comment.created_at)}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{comment.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {canAddComment && (
              <form onSubmit={handleAddComment} className="space-y-3 border-t pt-4">
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={t("comments.placeholder")}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  disabled={addComment.isPending}
                />
                <Button type="submit" disabled={addComment.isPending || !commentBody.trim()}>
                  {addComment.isPending ? t("comments.submitting") : t("comments.submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
