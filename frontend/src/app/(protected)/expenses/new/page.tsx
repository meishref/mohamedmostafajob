"use client";

import { ExpenseFormFields } from "@/components/expenses/expense-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useCreateExpense, useCurrencies } from "@/hooks/use-expenses";
import { useCreateExpenseSchema, type CreateExpenseFormValues } from "@/lib/validations/expense.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewExpensePage() {
  const router = useRouter();
  const createExpense = useCreateExpense();
  const { parseError } = useApiError();
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
  const createExpenseSchema = useCreateExpenseSchema();
  const [attachment, setAttachment] = useState<File | null>(null);
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrencies();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      category_id: "",
      platform_id: "",
      amount: undefined as unknown as number,
      currency: "USD",
      expense_date: new Date().toISOString().split("T")[0],
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

  const onSubmit = async (values: CreateExpenseFormValues) => {
    try {
      await createExpense.mutateAsync({
        category_id: values.category_id,
        platform_id: values.platform_id || undefined,
        amount: values.amount,
        currency: values.currency,
        expense_date: values.expense_date,
        notes: values.notes || undefined,
        attachment: attachment ?? undefined,
      });
      toast.success(t("toast.created"));
      router.push("/expenses");
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
            <ExpenseFormFields
              register={register}
              errors={errors}
              control={control}
              onAttachmentChange={setAttachment}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={createExpense.isPending}>
                {createExpense.isPending ? t("new.submitting") : t("new.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/expenses">{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
