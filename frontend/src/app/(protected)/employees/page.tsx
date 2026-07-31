"use client";

import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { DataTableCard } from "@/components/common/data-table-card";
import { EmptyState } from "@/components/common/empty-state";
import { LookupSelect } from "@/components/common/lookup-select";
import { PageHeader } from "@/components/common/page-header";
import { SortIcon } from "@/components/common/sort-icon";
import { StatusBadge } from "@/components/common/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDeleteEmployee, useEmployees, useRestoreEmployee } from "@/hooks/use-employees";
import type { EmployeeListParams } from "@/types/employees";
import { Eye, Pencil, Plus, RotateCcw, Trash2, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EmployeesPage() {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate } = useFormatters();
  const { canCreateEmployees, canDeleteEmployees, canRestoreEmployees } = usePermissions();
  const confirm = useConfirm();
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<EmployeeListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
    trashed: "without",
  });

  const { data, isLoading, isFetching, isError, refetch } = useEmployees(params);
  const deleteEmployee = useDeleteEmployee();
  const restoreEmployee = useRestoreEmployee();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<EmployeeListParams>) => {
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

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.description", { name }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteEmployee.mutateAsync(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreEmployee.mutateAsync(id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  const employees = data?.employees ?? [];
  const meta = data?.meta;
  const hasFilters =
    searchInput ||
    params.department_id ||
    params.job_title_id ||
    params.employee_status_id ||
    params.date_from ||
    params.date_to;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          canCreateEmployees ? (
            <Button asChild>
              <Link href="/employees/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("addEmployee")}
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
            <LookupSelect
              resource="departments"
              placeholder={t("allDepartments")}
              value={params.department_id ?? ""}
              onChange={(v) => updateParams({ department_id: v || undefined })}
            />
            <LookupSelect
              resource="job-titles"
              placeholder={t("allJobTitles")}
              value={params.job_title_id ?? ""}
              onChange={(v) => updateParams({ job_title_id: v || undefined })}
            />
            <LookupSelect
              resource="employee-statuses"
              placeholder={t("allStatuses")}
              value={params.employee_status_id ?? ""}
              onChange={(v) => updateParams({ employee_status_id: v || undefined })}
            />
            <Select
              value={params.trashed ?? "without"}
              onChange={(e) =>
                updateParams({ trashed: e.target.value as EmployeeListParams["trashed"] })
              }
            >
              <option value="without">{t("activeEmployees")}</option>
              <option value="only">{t("deletedOnly")}</option>
              <option value="with">{t("includeDeleted")}</option>
            </Select>
            <Input
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
        isEmpty={employees.length === 0}
        emptyState={
          <EmptyState
            icon={UserCircle}
            title={t("emptyTitle")}
            description={hasFilters ? t("emptyFiltered") : t("emptyDefault")}
            variant="card"
            action={
              canCreateEmployees && !hasFilters ? (
                <Button asChild size="sm">
                  <Link href="/employees/new">{t("addEmployee")}</Link>
                </Button>
              ) : undefined
            }
          />
        }
        meta={meta}
        onPageChange={(page) => updateParams({ page })}
        isFetching={isFetching}
        skeletonColumns={7}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.employee")}</TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("email")}
                >
                  {t("columns.email")}{" "}
                  <SortIcon
                    field="email"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.department")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.jobTitle")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.status")}</TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("hire_date")}
                >
                  {t("columns.hireDate")}{" "}
                  <SortIcon
                    field="hire_date"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const initials = employee.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <TableRow
                    key={employee.id}
                    className={employee.deleted_at ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.profile_image_url ?? undefined} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {employee.employee_number}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department?.name ?? tCommon("na")}</TableCell>
                    <TableCell>{employee.job_title?.name ?? tCommon("na")}</TableCell>
                    <TableCell>
                      {employee.employee_status ? (
                        <StatusBadge
                          name={employee.employee_status.name}
                          color={employee.employee_status.color}
                        />
                      ) : (
                        tCommon("na")
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.hire_date ? formatDate(employee.hire_date) : tCommon("na")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/employees/${employee.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {!employee.deleted_at && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/employees/${employee.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {employee.deleted_at && canRestoreEmployees && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestore(employee.id)}
                            disabled={restoreEmployee.isPending}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {!employee.deleted_at && canDeleteEmployees && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(employee.id, employee.full_name)}
                            disabled={deleteEmployee.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DataTableCard>
    </div>
  );
}
