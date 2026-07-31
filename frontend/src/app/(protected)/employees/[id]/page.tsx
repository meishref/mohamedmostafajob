"use client";

import { AttachmentManager } from "@/components/common/attachment-manager";
import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { DetailPageSkeleton } from "@/components/common/detail-page-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { NotFoundState } from "@/components/common/not-found-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFormatters } from "@/hooks/use-formatters";
import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteEmployee, useEmployee, useRestoreEmployee } from "@/hooks/use-employees";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const { data: employee, isLoading, isError, refetch } = useEmployee(employeeId);
  const { canUpdateEmployees, canDeleteEmployees, canRestoreEmployees } = usePermissions();
  const deleteEmployee = useDeleteEmployee();
  const restoreEmployee = useRestoreEmployee();
  const confirm = useConfirm();
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate, formatDateTime } = useFormatters();

  const handleDelete = async () => {
    if (!employee) return;
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.shortDescription", { name: employee.full_name }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteEmployee.mutateAsync(employee.id);
      toast.success(t("toast.deleted"));
      router.push("/employees");
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async () => {
    if (!employee) return;
    try {
      await restoreEmployee.mutateAsync(employee.id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  if (isLoading) return <DetailPageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!employee) {
    return (
      <NotFoundState
        title={t("detail.notFoundTitle")}
        message={t("detail.notFoundMessage")}
        backHref="/employees"
        backLabel={t("detail.backLabel")}
      />
    );
  }

  const initials = employee.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/employees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{employee.full_name}</h1>
            <p className="text-sm text-muted-foreground">{employee.employee_number}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!employee.deleted_at && canUpdateEmployees && (
            <Button variant="outline" asChild>
              <Link href={`/employees/${employee.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {tCommon("edit")}
              </Link>
            </Button>
          )}
          {employee.deleted_at && canRestoreEmployees && (
            <Button variant="outline" onClick={handleRestore} disabled={restoreEmployee.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {tCommon("restore")}
            </Button>
          )}
          {!employee.deleted_at && canDeleteEmployees && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleteEmployee.isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={employee.profile_image_url ?? undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{employee.full_name}</CardTitle>
              <CardDescription>{employee.email}</CardDescription>
              {employee.employee_status && (
                <Badge
                  className="mt-2"
                  variant="outline"
                  style={
                    employee.employee_status.color
                      ? {
                          borderColor: employee.employee_status.color,
                          color: employee.employee_status.color,
                        }
                      : undefined
                  }
                >
                  {employee.employee_status.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.phone")}</p>
              <p>{employee.phone ?? tCommon("na")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.hireDate")}</p>
              <p>{formatDate(employee.hire_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.department")}</p>
              <p>{employee.department?.name ?? tCommon("na")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.jobTitle")}</p>
              <p>{employee.job_title?.name ?? tCommon("na")}</p>
            </div>
          </div>

          {employee.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.notes")}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{employee.notes}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <p>{t("detail.created")}</p>
              <p>{formatDateTime(employee.created_at)}</p>
            </div>
            <div>
              <p>{t("detail.lastUpdated")}</p>
              <p>{formatDateTime(employee.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!employee.deleted_at && canUpdateEmployees && (
        <AttachmentManager
          resource="employees"
          resourceId={employee.id}
          canUpload={canUpdateEmployees}
          canDelete={canUpdateEmployees}
        />
      )}
    </div>
  );
}
