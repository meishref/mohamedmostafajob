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
import { useDeletePayment, usePayment, useRestorePayment } from "@/hooks/use-payments";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

function StatusBadge({ name, color }: { name: string; color?: string | null }) {
  return (
    <Badge variant="outline" style={color ? { borderColor: color, color } : undefined}>
      {name}
    </Badge>
  );
}

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;
  const { data: payment, isLoading, isError, refetch } = usePayment(paymentId);
  const { canUpdatePayments, canDeletePayments, canRestorePayments } = usePermissions();
  const deletePayment = useDeletePayment();
  const restorePayment = useRestorePayment();
  const confirm = useConfirm();
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate, formatDateTime, formatCurrency } = useFormatters();

  const handleDelete = async () => {
    if (!payment) return;
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.shortDescription", { number: payment.payment_number }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deletePayment.mutateAsync(payment.id);
      toast.success(t("toast.deleted"));
      router.push("/payments");
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async () => {
    if (!payment) return;
    try {
      await restorePayment.mutateAsync(payment.id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  if (isLoading) return <DetailPageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!payment) {
    return (
      <NotFoundState
        title={t("detail.notFoundTitle")}
        message={t("detail.notFoundMessage")}
        backHref="/payments"
        backLabel={t("detail.backLabel")}
      />
    );
  }

  const amountLabel = formatCurrency(payment.amount, payment.currency);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/payments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{payment.payment_number}</h1>
            <p className="text-sm text-muted-foreground">
              {amountLabel}
              {payment.payment_date && <> · {formatDate(payment.payment_date)}</>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!payment.deleted_at && canUpdatePayments && (
            <Button variant="outline" asChild>
              <Link href={`/payments/${payment.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {tCommon("edit")}
              </Link>
            </Button>
          )}
          {payment.deleted_at && canRestorePayments && (
            <Button variant="outline" onClick={handleRestore} disabled={restorePayment.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {tCommon("restore")}
            </Button>
          )}
          {!payment.deleted_at && canDeletePayments && (
            <Button variant="destructive" onClick={handleDelete} disabled={deletePayment.isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {payment.payment_type && (
              <Badge variant="secondary">{payment.payment_type.name}</Badge>
            )}
            {payment.payment_status && (
              <StatusBadge
                name={payment.payment_status.name}
                color={payment.payment_status.color}
              />
            )}
          </div>
          <CardTitle className="text-3xl">{amountLabel}</CardTitle>
          <CardDescription>
            {payment.payment_date
              ? t("detail.paidOn", { date: formatDate(payment.payment_date) })
              : t("detail.noPaymentDate")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.employee")}</p>
              <p>{payment.employee?.full_name ?? tCommon("na")}</p>
              {payment.employee?.employee_number && (
                <p className="text-sm text-muted-foreground">{payment.employee.employee_number}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.paymentType")}</p>
              <p>{payment.payment_type?.name ?? tCommon("na")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.status")}</p>
              {payment.payment_status ? (
                <StatusBadge
                  name={payment.payment_status.name}
                  color={payment.payment_status.color}
                />
              ) : (
                <p>{tCommon("na")}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.currency")}</p>
              <p>{payment.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.paymentDate")}</p>
              <p>{formatDate(payment.payment_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("detail.reference")}</p>
              <p>{payment.reference ?? tCommon("na")}</p>
            </div>
          </div>

          {payment.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.notes")}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{payment.notes}</p>
              </div>
            </>
          )}

          {payment.creator && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("detail.createdBy")}</p>
                <p>{payment.creator.name}</p>
                <p className="text-sm text-muted-foreground">{payment.creator.email}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <p>{t("detail.created")}</p>
              <p>{formatDateTime(payment.created_at)}</p>
            </div>
            <div>
              <p>{t("detail.lastUpdated")}</p>
              <p>{formatDateTime(payment.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!payment.deleted_at && (
        <AttachmentManager
          resource="payments"
          resourceId={payment.id}
          canUpload={canUpdatePayments}
          canDelete={canUpdatePayments}
        />
      )}
    </div>
  );
}
