"use client";

import { PageHeader } from "@/components/common/page-header";
import {
  RecentEmptyState,
  RecentListCard,
} from "@/components/dashboard/recent-list-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFormatters } from "@/hooks/use-formatters";
import type { EmployeeDashboardData } from "@/types/dashboard";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ListTodo,
  PlayCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface EmployeeDashboardProps {
  data: EmployeeDashboardData;
  isFetching?: boolean;
}

function TaskListItems({
  tasks,
  emptyMessage,
  formatDate,
  dueLabel,
}: {
  tasks: EmployeeDashboardData["tasks"]["due_today"];
  emptyMessage: string;
  formatDate: (value: string | null | undefined) => string;
  dueLabel: (date: string) => string;
}) {
  if (tasks.length === 0) {
    return <RecentEmptyState message={emptyMessage} />;
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            href={`/tasks/${task.id}`}
            className="block rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{task.title}</p>
              {task.task_status && (
                <Badge
                  variant="outline"
                  style={
                    task.task_status.color
                      ? {
                          borderColor: task.task_status.color,
                          color: task.task_status.color,
                        }
                      : undefined
                  }
                >
                  {task.task_status.name}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {task.priority?.name}
              {task.due_date && ` · ${dueLabel(formatDate(task.due_date))}`}
              {task.creator && ` · ${task.creator.name}`}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function EmployeeDashboard({ data, isFetching }: EmployeeDashboardProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { formatDate, formatDateTime } = useFormatters();
  const { statistics, tasks, notifications, employee } = data;

  const dueLabel = (date: string) => tCommon("due", { date });

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("employeeTitle")}
        description={
          isFetching
            ? t("employeeDescriptionUpdating")
            : employee
              ? t("employeeDescriptionNamed", { name: employee.full_name })
              : t("employeeDescription")
        }
        action={
          <Button variant="outline" asChild>
            <Link href="/tasks">{t("employeeViewAllTasks")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("employeeMyTasks")} value={statistics.my_tasks} icon={ClipboardList} />
        <StatCard title={t("employeeNewTasks")} value={statistics.new_tasks} icon={ListTodo} />
        <StatCard
          title={t("employeeInProgress")}
          value={statistics.in_progress_tasks}
          icon={PlayCircle}
        />
        <StatCard
          title={t("employeeCompleted")}
          value={statistics.completed_tasks}
          icon={CheckCircle2}
        />
        <StatCard
          title={t("employeeOverdue")}
          value={statistics.overdue_tasks}
          icon={AlertTriangle}
        />
        <StatCard
          title={t("employeeDueToday")}
          value={statistics.due_today_tasks}
          icon={Clock3}
        />
        <StatCard
          title={t("employeeUpcoming")}
          value={statistics.upcoming_tasks}
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentListCard
          title={t("employeeDueTodayList")}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">{tCommon("viewAll")}</Link>
            </Button>
          }
        >
          <TaskListItems
            tasks={tasks.due_today}
            emptyMessage={t("employeeNoDueToday")}
            formatDate={formatDate}
            dueLabel={dueLabel}
          />
        </RecentListCard>

        <RecentListCard title={t("employeeOverdueList")}>
          <TaskListItems
            tasks={tasks.overdue}
            emptyMessage={t("employeeNoOverdue")}
            formatDate={formatDate}
            dueLabel={dueLabel}
          />
        </RecentListCard>

        <RecentListCard title={t("employeeUpcomingList")}>
          <TaskListItems
            tasks={tasks.upcoming}
            emptyMessage={t("employeeNoUpcoming")}
            formatDate={formatDate}
            dueLabel={dueLabel}
          />
        </RecentListCard>

        <RecentListCard title={t("employeeRecentList")}>
          <TaskListItems
            tasks={tasks.recent}
            emptyMessage={t("employeeNoRecent")}
            formatDate={formatDate}
            dueLabel={dueLabel}
          />
        </RecentListCard>

        <RecentListCard
          title={t("employeeRecentNotifications")}
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notifications">{tCommon("viewAll")}</Link>
            </Button>
          }
        >
          {notifications.length === 0 ? (
            <RecentEmptyState message={t("employeeNoNotifications")} />
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => {
                const taskId =
                  typeof notification.data?.task_id === "string"
                    ? notification.data.task_id
                    : null;
                const content = (
                  <div className="flex gap-3 rounded-lg p-2">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      {notification.created_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(notification.created_at)}
                        </p>
                      )}
                    </div>
                    {!notification.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );

                return (
                  <li key={notification.id}>
                    {taskId ? (
                      <Link
                        href={`/tasks/${taskId}`}
                        className="block transition-colors hover:bg-accent rounded-lg"
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </RecentListCard>
      </div>
    </div>
  );
}
