"use client";

import { PaymentFormFields } from "@/components/payments/payment-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useCurrencies } from "@/hooks/use-expenses";
import { useCreatePayment } from "@/hooks/use-payments";
import { useCreatePaymentSchema, type CreatePaymentFormValues } from "@/lib/validations/payment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewPaymentPage() {
  const router = useRouter();
  const createPayment = useCreatePayment();
  const { parseError } = useApiError();
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const createPaymentSchema = useCreatePaymentSchema();
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrencies();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      employee_id: "",
      payment_type_id: "",
      payment_status_id: "",
      amount: undefined as unknown as number,
      currency: "USD",
      payment_date: new Date().toISOString().split("T")[0],
      reference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (currencies.length > 0) {
      reset((prev) => ({
        ...prev,
        currency: prev.currency || currencies[0].code,
      }));
    }
  }, [currencies, reset]);

  const onSubmit = async (values: CreatePaymentFormValues) => {
    try {
      const result = await createPayment.mutateAsync({
        employee_id: values.employee_id,
        payment_type_id: values.payment_type_id,
        payment_status_id: values.payment_status_id,
        amount: values.amount,
        currency: values.currency,
        payment_date: values.payment_date,
        reference: values.reference || undefined,
        notes: values.notes || undefined,
      });
      toast.success(t("toast.created"));
      router.push(`/payments/${result.payment.id}`);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (currenciesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("new.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("new.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("new.cardTitle")}</CardTitle>
          <CardDescription>{t("new.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <PaymentFormFields register={register} errors={errors} control={control} />
            <div className="flex gap-3">
              <Button type="submit" disabled={createPayment.isPending}>
                {createPayment.isPending ? t("new.submitting") : t("new.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/payments">{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
