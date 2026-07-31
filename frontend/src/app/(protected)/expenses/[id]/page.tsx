"use client";

import { AttachmentManager } from "@/components/common/attachment-manager";
import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { DetailPageSkeleton } from "@/components/common/detail-page-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { NotFoundState } from "@/components/common/not-found-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFormatters } from "@/hooks/use-formatters";
import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteExpense, useExpense, useRestoreExpense } from "@/hooks/use-expenses";
import { ArrowLeft, Download, ExternalLink, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ExpenseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;
  const { data: expense, isLoading, isError, refetch } = useExpense(expenseId);
  const { canUpdateExpenses, canDeleteExpenses, canRestoreExpenses } = usePermissions();
  const deleteExpense = useDeleteExpense();
  const restoreExpense = useRestoreExpense();
  const confirm = useConfirm();
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate, formatDateTime, formatCurrency } = useFormatters();

  const handleDelete = async () => {
    if (!expense) return;
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.shortDescription", { number: expense.expense_number }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteExpense.mutateAsync(expense.id);
      toast.success(t("toast.deleted"));
      router.push("/expenses");
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async () => {
    if (!expense) return;
    try {
      await restoreExpense.mutateAsync(expense.id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  if (isLoading) return <DetailPageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!expense) {
    return (
      <NotFoundState
        title={t("detail.notFoundTitle")}
        message={t("detail.notFoundMessage")}
        backHref="/expenses"
        backLabel={t("detail.backLabel")}
      />
    );
  }

  const isImage = expense.attachment_url?.match(/\.(jpg|jpeg|png|webp)$/i);
  const amountLabel = formatCurrency(expense.amount, expense.currency);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/expenses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{expense.expense_number}</h1>
            <p className="text-sm text-muted-foreground">
              {amountLabel} · {formatDate(expense.expense_date)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!expense.deleted_at && canUpdateExpenses && (
            <Button variant="outline" asChild>
              <Link href={`/expenses/${expense.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {tCommon("edit")}
              </Link>
            </Button>
          )}
          {expense.deleted_at && canRestoreExpenses && (
            <Button variant="outline" onClick={handleRestore} disabled={restoreExpense.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {tCommon("restore")}
            </Button>
          )}
          {!expense.deleted_at && canDeleteExpenses && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleteExpense.isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {expense.category && <Badge variant="secondary">{expense.category.name}</Badge>}
            {expense.platform && <Badge variant="outline">{expense.platform.name}</Badge>}
          </div>
          <CardTitle className="text-3xl">{amountLabel}</CardTitle>
          <CardDescription>
            {t("detail.recordedOn", { date: formatDate(expense.expense_date) })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.category")}</p>
              <p>{expense.category?.name ?? tCommon("na")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("detail.advertisingPlatform")}
              </p>
              <p>{expense.platform?.name ?? tCommon("na")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.currency")}</p>
              <p>{expense.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.date")}</p>
              <p>{formatDate(expense.expense_date)}</p>
            </div>
          </div>

          {expense.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.notes")}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{expense.notes}</p>
              </div>
            </>
          )}

          {expense.attachment_url && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  {t("detail.attachment")}
                </p>
                {isImage ? (
                  <a href={expense.attachment_url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={expense.attachment_url}
                      alt={t("detail.attachmentAlt")}
                      className="max-h-64 rounded-md border object-contain"
                    />
                  </a>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm">{expense.attachment_name}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={expense.attachment_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {tCommon("view")}
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={expense.attachment_url} download>
                        <Download className="mr-2 h-4 w-4" />
                        {tCommon("download")}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {expense.creator && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.createdBy")}</p>
                <p>{expense.creator.name}</p>
                <p className="text-sm text-muted-foreground">{expense.creator.email}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <p>{t("detail.created")}</p>
              <p>{formatDateTime(expense.created_at)}</p>
            </div>
            <div>
              <p>{t("detail.lastUpdated")}</p>
              <p>{formatDateTime(expense.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!expense.deleted_at && canUpdateExpenses && (
        <AttachmentManager
          resource="expenses"
          resourceId={expense.id}
          canUpload={canUpdateExpenses}
          canDelete={canUpdateExpenses}
        />
      )}
    </div>
  );
}
