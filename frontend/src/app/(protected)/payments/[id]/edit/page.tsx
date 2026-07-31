"use client";

import { PaymentFormFields } from "@/components/payments/payment-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { usePayment, useUpdatePayment } from "@/hooks/use-payments";
import { useUpdatePaymentSchema, type UpdatePaymentFormValues } from "@/lib/validations/payment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;
  const { data: payment, isLoading } = usePayment(paymentId);
  const updatePayment = useUpdatePayment(paymentId);
  const { parseError } = useApiError();
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const updatePaymentSchema = useUpdatePaymentSchema();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdatePaymentFormValues>({
    resolver: zodResolver(updatePaymentSchema),
  });

  useEffect(() => {
    if (payment) {
      reset({
        employee_id: payment.employee_id ?? "",
        payment_type_id: payment.payment_type_id,
        payment_status_id: payment.payment_status_id,
        amount: typeof payment.amount === "string" ? parseFloat(payment.amount) : payment.amount,
        currency: payment.currency,
        payment_date: payment.payment_date ?? "",
        reference: payment.reference ?? "",
        notes: payment.notes ?? "",
      });
    }
  }, [payment, reset]);

  const onSubmit = async (values: UpdatePaymentFormValues) => {
    try {
      await updatePayment.mutateAsync({
        employee_id: values.employee_id,
        payment_type_id: values.payment_type_id,
        payment_status_id: values.payment_status_id,
        amount: values.amount,
        currency: values.currency,
        payment_date: values.payment_date,
        reference: values.reference || null,
        notes: values.notes || null,
      });
      toast.success(t("toast.updated"));
      router.push(`/payments/${paymentId}`);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (isLoading || !payment) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("edit.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("edit.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("edit.cardTitle")}</CardTitle>
          <CardDescription>{t("edit.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <PaymentFormFields register={register} errors={errors} control={control} />
            <div className="flex gap-3">
              <Button type="submit" disabled={updatePayment.isPending}>
                {updatePayment.isPending ? t("edit.saving") : t("edit.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/payments/${paymentId}`}>{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
