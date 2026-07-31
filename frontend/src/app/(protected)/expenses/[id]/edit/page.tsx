"use client";

import { ExpenseFormFields } from "@/components/expenses/expense-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useExpense, useUpdateExpense } from "@/hooks/use-expenses";
import { useUpdateExpenseSchema, type UpdateExpenseFormValues } from "@/lib/validations/expense.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;
  const { data: expense, isLoading } = useExpense(expenseId);
  const updateExpense = useUpdateExpense(expenseId);
  const { parseError } = useApiError();
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
  const updateExpenseSchema = useUpdateExpenseSchema();
  const [attachment, setAttachment] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateExpenseFormValues>({
    resolver: zodResolver(updateExpenseSchema),
  });

  useEffect(() => {
    if (expense) {
      reset({
        category_id: expense.category_id,
        platform_id: expense.platform_id ?? "",
        amount: typeof expense.amount === "string" ? parseFloat(expense.amount) : expense.amount,
        currency: expense.currency,
        expense_date: expense.expense_date,
        notes: expense.notes ?? "",
      });
    }
  }, [expense, reset]);

  const onSubmit = async (values: UpdateExpenseFormValues) => {
    try {
      await updateExpense.mutateAsync({
        category_id: values.category_id,
        platform_id: values.platform_id || null,
        amount: values.amount,
        currency: values.currency,
        expense_date: values.expense_date,
        notes: values.notes || null,
        attachment: attachment ?? undefined,
      });
      toast.success(t("toast.updated"));
      router.push(`/expenses/${expenseId}`);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (isLoading || !expense) {
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
            <ExpenseFormFields
              register={register}
              errors={errors}
              control={control}
              existingAttachmentName={expense.attachment_name}
              existingAttachmentUrl={expense.attachment_url}
              onAttachmentChange={setAttachment}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={updateExpense.isPending}>
                {updateExpense.isPending ? t("edit.saving") : t("edit.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/expenses/${expenseId}`}>{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
