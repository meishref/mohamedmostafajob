"use client";

import { FormField } from "@/components/common/form-field";
import { CurrencySelect } from "@/components/common/currency-select";
import { LookupSelect } from "@/components/common/lookup-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateExpenseFormValues, UpdateExpenseFormValues } from "@/lib/validations/expense.schema";
import { Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

interface ExpenseFormFieldsProps {
  register: UseFormRegister<CreateExpenseFormValues | UpdateExpenseFormValues>;
  errors: FieldErrors<CreateExpenseFormValues | UpdateExpenseFormValues>;
  control: Control<CreateExpenseFormValues | UpdateExpenseFormValues>;
  existingAttachmentName?: string | null;
  existingAttachmentUrl?: string | null;
  onAttachmentChange?: (file: File | null) => void;
}

export function ExpenseFormFields({
  register,
  errors,
  control,
  existingAttachmentName,
  existingAttachmentUrl,
  onAttachmentChange,
}: ExpenseFormFieldsProps) {
  const t = useTranslations("expenses.fields");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAttachmentChange?.(e.target.files?.[0] ?? null);
  };

  return (
    <div className="space-y-4">
      <FormField label={t("category")} htmlFor="category_id" error={errors.category_id?.message}>
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <LookupSelect
              resource="expense-categories"
              placeholder={t("selectCategory")}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label={t("platform")} htmlFor="platform_id" error={errors.platform_id?.message}>
        <Controller
          name="platform_id"
          control={control}
          render={({ field }) => (
            <LookupSelect
              resource="advertising-platforms"
              placeholder={t("selectPlatform")}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("amount")} htmlFor="amount" error={errors.amount?.message}>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder={t("amountPlaceholder")}
            {...register("amount", { valueAsNumber: true })}
          />
        </FormField>

        <FormField label={t("currency")} htmlFor="currency" error={errors.currency?.message}>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <CurrencySelect id="currency" value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>
      </div>

      <FormField label={t("date")} htmlFor="expense_date" error={errors.expense_date?.message}>
        <Input id="expense_date" type="date" {...register("expense_date")} />
      </FormField>

      <FormField label={t("notes")} htmlFor="notes" error={errors.notes?.message}>
        <textarea
          id="notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t("notesPlaceholder")}
          {...register("notes")}
        />
      </FormField>

      <FormField label={t("attachment")} htmlFor="attachment">
        <div className="space-y-2">
          {existingAttachmentName && existingAttachmentUrl && (
            <p className="text-sm text-muted-foreground">
              {t("currentAttachment")}{" "}
              <a
                href={existingAttachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {existingAttachmentName}
              </a>
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Paperclip className="mr-2 h-4 w-4" />
              {t("uploadAttachment")}
            </Button>
            <span className="text-xs text-muted-foreground">{t("attachmentHint")}</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </FormField>
    </div>
  );
}
