"use client";

import { DataTableCard } from "@/components/common/data-table-card";
import { EmptyState } from "@/components/common/empty-state";
import { EmployeeSelect } from "@/components/common/employee-select";
import { LookupSelect } from "@/components/common/lookup-select";
import { PageHeader } from "@/components/common/page-header";
import { SortIcon } from "@/components/common/sort-icon";
import { StatusBadge } from "@/components/common/status-badge";
import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFormatters } from "@/hooks/use-formatters";
import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteTask, useRestoreTask, useTasks } from "@/hooks/use-tasks";
import type { TaskListParams } from "@/types/tasks";
import { ClipboardList, Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function TasksPage() {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate } = useFormatters();
  const {
    canCreateTasks,
    canUpdateTasks,
    canDeleteTasks,
    canRestoreTasks,
    hasPermission,
    isAdmin,
  } = usePermissions();
  const showAssigneeFilter = isAdmin || hasPermission("tasks.view");
  const confirm = useConfirm();
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<TaskListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
    trashed: "without",
  });

  const { data, isLoading, isFetching, isError, refetch } = useTasks(params);
  const deleteTask = useDeleteTask();
  const restoreTask = useRestoreTask();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<TaskListParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const toggleSort = (field: string) => {
    setParams((prev) => ({
      ...prev,
      sort_by: field,
      sort_direction:
        prev.sort_by === field && prev.sort_direction === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.description", { title }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteTask.mutateAsync(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreTask.mutateAsync(id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  const tasks = data?.tasks ?? [];
  const meta = data?.meta;
  const hasFilters =
    searchInput || params.assigned_to || params.task_status_id || params.priority_id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          canCreateTasks ? (
            <Button asChild>
              <Link href="/tasks/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("createTask")}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tCommon("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {showAssigneeFilter && (
              <EmployeeSelect
                value={params.assigned_to ?? ""}
                onChange={(v) => updateParams({ assigned_to: v || undefined })}
                placeholder={t("allEmployees")}
              />
            )}
            {showAssigneeFilter && (
              <LookupSelect
                resource="departments"
                value={params.department_id ?? ""}
                onChange={(v) => updateParams({ department_id: v || undefined })}
                placeholder={t("allDepartments")}
              />
            )}
            <LookupSelect
              resource="task-statuses"
              value={params.task_status_id ?? ""}
              onChange={(v) => updateParams({ task_status_id: v || undefined })}
              placeholder={t("allStatuses")}
            />
            <LookupSelect
              resource="priorities"
              value={params.priority_id ?? ""}
              onChange={(v) => updateParams({ priority_id: v || undefined })}
              placeholder={t("allPriorities")}
            />
            {showAssigneeFilter && (
              <Select
                value={params.trashed ?? "without"}
                onChange={(e) =>
                  updateParams({ trashed: e.target.value as TaskListParams["trashed"] })
                }
              >
                <option value="without">{t("activeTasks")}</option>
                <option value="only">{t("deletedOnly")}</option>
                <option value="with">{t("includeDeleted")}</option>
              </Select>
            )}            <Input
              type="date"
              value={params.date_from ?? ""}
              onChange={(e) => updateParams({ date_from: e.target.value || undefined })}
            />
            <Input
              type="date"
              value={params.date_to ?? ""}
              onChange={(e) => updateParams({ date_to: e.target.value || undefined })}
            />
          </div>
        </CardContent>
      </Card>

      <DataTableCard
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={tasks.length === 0}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title={t("emptyTitle")}
            description={hasFilters ? t("emptyFiltered") : t("emptyDefault")}
            variant="card"
            action={
              canCreateTasks && !searchInput ? (
                <Button asChild size="sm">
                  <Link href="/tasks/new">{t("createTask")}</Link>
                </Button>
              ) : undefined
            }
          />
        }
        meta={meta}
        onPageChange={(page) => updateParams({ page })}
        isFetching={isFetching}
        skeletonColumns={6}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("title")}
                >
                  {t("columns.title")}{" "}
                  <SortIcon
                    field="title"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.assignee")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.status")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.priority")}</TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("due_date")}
                >
                  {t("columns.dueDate")}{" "}
                  <SortIcon
                    field="due_date"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className={task.deleted_at ? "opacity-60" : ""}>
                  <TableCell>
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {task.assignee?.full_name ?? tCommon("na")}
                  </TableCell>
                  <TableCell>
                    {task.task_status ? (
                      <StatusBadge
                        name={task.task_status.name}
                        color={task.task_status.color}
                      />
                    ) : (
                      tCommon("na")
                    )}
                  </TableCell>
                  <TableCell>
                    {task.priority ? (
                      <StatusBadge name={task.priority.name} color={task.priority.color} />
                    ) : (
                      tCommon("na")
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {task.due_date ? formatDate(task.due_date) : tCommon("na")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/tasks/${task.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {!task.deleted_at && canUpdateTasks && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/tasks/${task.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {task.deleted_at && canRestoreTasks && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(task.id)}
                          disabled={restoreTask.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {!task.deleted_at && canDeleteTasks && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(task.id, task.title)}
                          disabled={deleteTask.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DataTableCard>
    </div>
  );
}
