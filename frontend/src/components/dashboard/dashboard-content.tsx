"use client";

import { PageHeader } from "@/components/common/page-header";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { MonthlyBarChart } from "@/components/dashboard/monthly-bar-chart";
import { TasksByStatusChart } from "@/components/dashboard/tasks-by-status-chart";
import { EmployeesByDepartmentChart } from "@/components/dashboard/employees-by-department-chart";
import {
  RecentEmptyState,
  RecentListCard,
  RecentListSkeleton,
} from "@/components/dashboard/recent-list-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ChartSkeleton } from "@/components/dashboard/dashboard-chart-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { useFormatters } from "@/hooks/use-formatters";
import type { AdminDashboardData } from "@/types/dashboard";
import {
  Activity,
  Building2,
  ClipboardList,
  CreditCard,
  Receipt,
  UserCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

function AdminDashboard({
  data,
  isFetching,
}: {
  data: AdminDashboardData;
  isFetching?: boolean;
}) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { formatDate, formatDateTime, formatCurrency } = useFormatters();
  const { statistics, charts, recent } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={isFetching ? t("descriptionUpdating") : t("description")}
        action={<QuickActions />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title={t("totalEmployees")} value={statistics.total_employees} icon={UserCircle} />
        <StatCard title={t("totalDepartments")} value={statistics.total_departments} icon={Building2} />
        <StatCard title={t("totalTasks")} value={statistics.total_tasks} icon={ClipboardList} />
        <StatCard title={t("totalPayments")} value={statistics.total_payments} icon={CreditCard} />
        <StatCard title={t("totalExpenses")} value={statistics.total_expenses} icon={Receipt} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyBarChart
          title={t("monthlyExpenses")}
          description={t("monthlyExpensesDescription")}
          data={charts.monthly_expenses}
          color="#ef4444"
        />
        <MonthlyBarChart
          title={t("monthlyPayments")}
          description={t("monthlyPaymentsDescription")}
          data={charts.monthly_payments}
          color="#22c55e"
        />
        <TasksByStatusChart data={charts.tasks_by_status} />
        <EmployeesByDepartmentChart data={charts.employees_by_department} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <RecentListCard
          title={t("recentEmployees")}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/employees">{tCommon("viewAll")}</Link>
            </Button>
          }
        >
          {recent.employees.length === 0 ? (
            <RecentEmptyState message={t("noEmployeesYet")} />
          ) : (
            <ul className="space-y-3">
              {recent.employees.map((employee) => (
                <li key={employee.id}>
                  <Link
                    href={`/employees/${employee.id}`}
                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium">{employee.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.department ?? tCommon("noDepartment")} · {employee.employee_number}
                      </p>
                    </div>
                    {employee.status && <Badge variant="outline">{employee.status}</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </RecentListCard>

        <RecentListCard
          title={t("recentTasks")}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">{tCommon("viewAll")}</Link>
            </Button>
          }
        >
          {recent.tasks.length === 0 ? (
            <RecentEmptyState message={t("noTasksYet")} />
          ) : (
            <ul className="space-y-3">
              {recent.tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="block rounded-lg p-2 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{task.title}</p>
                      {task.status && (
                        <Badge
                          variant="outline"
                          style={
                            task.status_color
                              ? { borderColor: task.status_color, color: task.status_color }
                              : undefined
                          }
                        >
                          {task.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {task.assignee ?? tCommon("unassigned")}
                      {task.due_date && ` · ${tCommon("due", { date: formatDate(task.due_date) })}`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </RecentListCard>

        <RecentListCard title={t("recentPayments")}>
          {recent.payments.length === 0 ? (
            <RecentEmptyState message={t("noPaymentsYet")} />
          ) : (
            <ul className="space-y-3">
              {recent.payments.map((payment) => (
                <li key={payment.id} className="rounded-lg p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{payment.payment_number}</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {payment.employee ?? tCommon("na")} · {payment.type ?? tCommon("na")}
                    {payment.payment_date && ` · ${formatDate(payment.payment_date)}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </RecentListCard>

        <RecentListCard
          title={t("recentExpenses")}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/expenses">{tCommon("viewAll")}</Link>
            </Button>
          }
        >
          {recent.expenses.length === 0 ? (
            <RecentEmptyState message={t("noExpensesYet")} />
          ) : (
            <ul className="space-y-3">
              {recent.expenses.map((expense) => (
                <li key={expense.id}>
                  <Link
                    href={`/expenses/${expense.id}`}
                    className="block rounded-lg p-2 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{expense.expense_number}</p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {expense.category ?? tCommon("na")}
                      {expense.expense_date && ` · ${formatDate(expense.expense_date)}`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </RecentListCard>

        <RecentListCard
          title={t("recentActivities")}
          className="lg:col-span-2 xl:col-span-2"
          action={<Activity className="h-4 w-4 text-muted-foreground" />}
        >
          {recent.activities.length === 0 ? (
            <RecentEmptyState message={t("noActivityYet")} />
          ) : (
            <ul className="space-y-3">
              {recent.activities.map((activity) => (
                <li key={activity.id} className="flex gap-3 rounded-lg p-2">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{activity.description ?? activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user ?? tCommon("system")}
                      {activity.subject_type && ` · ${activity.subject_type}`}
                      {" · "}
                      {formatDateTime(activity.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 capitalize">
                    {activity.action}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </RecentListCard>
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { data: auth, isLoading: authLoading } = useCurrentUser();
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const isEmployee =
    Boolean(auth?.user) &&
    !auth?.user?.roles?.includes("admin") &&
    (auth?.user?.roles?.includes("employee") ||
      auth?.user?.permissions?.some((p) =>
        ["tasks.view-own", "tasks.update-status", "tasks.comment"].includes(p),
      ));

  if (authLoading || isLoading || !auth?.user) {
    return (
      <div className="space-y-6">
        <div className={`grid gap-4 sm:grid-cols-2 ${isEmployee ? "xl:grid-cols-4" : "xl:grid-cols-5"}`}>
          {Array.from({ length: isEmployee ? 7 : 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        {!isEmployee && (
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        )}
        <div className={`grid gap-4 lg:grid-cols-2 ${isEmployee ? "" : "xl:grid-cols-3"}`}>
          {Array.from({ length: isEmployee ? 4 : 5 }).map((_, i) => (
            <RecentListSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <DashboardErrorState onRetry={() => refetch()} />;
  }

  if (data.view === "employee") {
    return <EmployeeDashboard data={data} isFetching={isFetching} />;
  }

  return <AdminDashboard data={data} isFetching={isFetching} />;
}
