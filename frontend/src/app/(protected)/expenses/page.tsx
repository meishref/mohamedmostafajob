"use client";

import { CurrencySelect } from "@/components/common/currency-select";
import { DataTableCard } from "@/components/common/data-table-card";
import { EmptyState } from "@/components/common/empty-state";
import { LookupSelect } from "@/components/common/lookup-select";
import { PageHeader } from "@/components/common/page-header";
import { SortIcon } from "@/components/common/sort-icon";
import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { Badge } from "@/components/ui/badge";
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
import { useDeleteExpense, useExpenses, useRestoreExpense } from "@/hooks/use-expenses";
import type { ExpenseListParams } from "@/types/expenses";
import { Eye, Pencil, Plus, Receipt, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ExpensesPage() {
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate, formatCurrency } = useFormatters();
  const { canCreateExpenses, canDeleteExpenses, canRestoreExpenses } = usePermissions();
  const confirm = useConfirm();
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<ExpenseListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
    trashed: "without",
  });

  const { data, isLoading, isFetching, isError, refetch } = useExpenses(params);
  const deleteExpense = useDeleteExpense();
  const restoreExpense = useRestoreExpense();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<ExpenseListParams>) => {
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
      await deleteExpense.mutateAsync(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreExpense.mutateAsync(id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  const expenses = data?.expenses ?? [];
  const meta = data?.meta;
  const hasFilters = searchInput || params.category_id || params.platform_id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          canCreateExpenses ? (
            <Button asChild>
              <Link href="/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("createExpense")}
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
              resource="expense-categories"
              value={params.category_id ?? ""}
              onChange={(v) => updateParams({ category_id: v || undefined })}
              placeholder={t("allCategories")}
            />
            <LookupSelect
              resource="advertising-platforms"
              value={params.platform_id ?? ""}
              onChange={(v) => updateParams({ platform_id: v || undefined })}
              placeholder={t("allPlatforms")}
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
                updateParams({ trashed: e.target.value as ExpenseListParams["trashed"] })
              }
            >
              <option value="without">{t("activeExpenses")}</option>
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
        isEmpty={expenses.length === 0}
        emptyState={
          <EmptyState
            icon={Receipt}
            title={t("emptyTitle")}
            description={hasFilters ? t("emptyFiltered") : t("emptyDefault")}
            variant="card"
            action={
              canCreateExpenses && !searchInput ? (
                <Button asChild size="sm">
                  <Link href="/expenses/new">{t("createExpense")}</Link>
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
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("expense_number")}
                >
                  {t("columns.number")}{" "}
                  <SortIcon
                    field="expense_number"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.category")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.platform")}</TableHead>
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
                  onClick={() => toggleSort("expense_date")}
                >
                  {t("columns.date")}{" "}
                  <SortIcon
                    field="expense_date"
                    sortBy={params.sort_by}
                    sortDirection={params.sort_direction}
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap">{t("columns.attachment")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} className={expense.deleted_at ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{expense.expense_number}</TableCell>
                  <TableCell>{expense.category?.name ?? tCommon("na")}</TableCell>
                  <TableCell>{expense.platform?.name ?? tCommon("na")}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(expense.amount, expense.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(expense.expense_date)}
                  </TableCell>
                  <TableCell>
                    {expense.attachment_url ? (
                      <Badge variant="outline">{t("attached")}</Badge>
                    ) : (
                      tCommon("na")
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expenses/${expense.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {!expense.deleted_at && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/expenses/${expense.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {expense.deleted_at && canRestoreExpenses && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(expense.id)}
                          disabled={restoreExpense.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {!expense.deleted_at && canDeleteExpenses && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id, expense.expense_number)}
                          disabled={deleteExpense.isPending}
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
