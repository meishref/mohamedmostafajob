"use client";

import { CurrencySelect } from "@/components/common/currency-select";
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
import { useDeletePayment, usePayments, useRestorePayment } from "@/hooks/use-payments";
import type { PaymentListParams } from "@/types/payments";
import { Banknote, Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate, formatCurrency } = useFormatters();
  const { canCreatePayments, canDeletePayments, canRestorePayments } = usePermissions();
  const confirm = useConfirm();
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<PaymentListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
    trashed: "without",
  });

  const { data, isLoading, isFetching, isError, refetch } = usePayments(params);
  const deletePayment = useDeletePayment();
  const restorePayment = useRestorePayment();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<PaymentListParams>) => {
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

  const handleDelete = async (id: string, number: string) => {
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.description", { number }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deletePayment.mutateAsync(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restorePayment.mutateAsync(id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  const payments = data?.payments ?? [];
  const meta = data?.meta;
  const hasFilters =
    searchInput ||
    params.employee_id ||
    params.payment_type_id ||
    params.payment_status_id ||
    params.currency ||
    params.date_from ||
    params.date_to;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          canCreatePayments ? (
            <Button asChild>
              <Link href="/payments/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("createPayment")}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <EmployeeSelect
              value={params.employee_id ?? ""}
              onChange={(v) => updateParams({ employee_id: v || undefined })}
              placeholder={t("allEmployees")}
            />
            <LookupSelect
              resource="payment-types"
              value={params.payment_type_id ?? ""}
              onChange={(v) => updateParams({ payment_type_id: v || undefined })}
              placeholder={t("allTypes")}
            />
            <LookupSelect
              resource="payment-statuses"
              value={params.payment_status_id ?? ""}
              onChange={(v) => updateParams({ payment_status_id: v || undefined })}
              placeholder={t("allStatuses")}
            />
            <CurrencySelect
              value={params.currency ?? ""}
              onChange={(v) => updateParams({ currency: v || undefined })}
              placeholder={t("allCurrencies")}
            />
            <Input
              type="date"
              value={params.date_from ?? ""}
              onChange={(e) => updateParams({ date_from: e.target.value || undefined })}
              placeholder={tCommon("fromDate")}
            />
            <Input
              type="date"
              value={params.date_to ?? ""}
              onChange={(e) => updateParams({ date_to: e.target.value || undefined })}
              placeholder={tCommon("toDate")}
            />
          </div>
          <div className="mt-4 max-w-xs">
            <Select
              value={params.trashed ?? "without"}
              onChange={(e) =>
                updateParams({ trashed: e.target.value as PaymentListParams["trashed"] })
              }
            >
              <option value="without">{t("activePayments")}</option>
              <option value="only">{t("deletedOnly")}</option>
              <option value="with">{t("includeDeleted")}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTableCard
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={payments.length === 0}
        emptyState={
          <EmptyState
            icon={Banknote}
            title={t("emptyTitle")}
            description={hasFilters ? t("emptyFiltered") : t("emptyDefault")}
            variant="card"
            action={
              canCreatePayments && !hasFilters ? (
                <Button asChild size="sm">
                  <Link href="/payments/new">{t("createPayment")}</Link>
                </Button>
              ) : undefined
            }
          />
        }
        meta={meta}
        onPageChange={(page) => updateParams({ page })}
        isFetching={isFetching}
        skeletonColumns={8}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("payment_number")}
                >
                  {t("columns.number")}{" "}
                  <SortIcon
                    field="payment_number"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.employee")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.type")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.status")}</TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("amount")}
                >
                  {t("columns.amount")}{" "}
                  <SortIcon
                    field="amount"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("payment_date")}
                >
                  {t("columns.date")}{" "}
                  <SortIcon
                    field="payment_date"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.reference")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className={payment.deleted_at ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{payment.payment_number}</TableCell>
                  <TableCell>{payment.employee?.full_name ?? tCommon("na")}</TableCell>
                  <TableCell>{payment.payment_type?.name ?? tCommon("na")}</TableCell>
                  <TableCell>
                    {payment.payment_status ? (
                      <StatusBadge
                        name={payment.payment_status.name}
                        color={payment.payment_status.color}
                      />
                    ) : (
                      tCommon("na")
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {payment.payment_date ? formatDate(payment.payment_date) : tCommon("na")}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {payment.reference ?? tCommon("na")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/payments/${payment.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {!payment.deleted_at && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/payments/${payment.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {payment.deleted_at && canRestorePayments && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(payment.id)}
                          disabled={restorePayment.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {!payment.deleted_at && canDeletePayments && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(payment.id, payment.payment_number)}
                          disabled={deletePayment.isPending}
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
