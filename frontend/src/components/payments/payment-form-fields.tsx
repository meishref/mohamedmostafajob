"use client";

import { FormField } from "@/components/common/form-field";
import { CurrencySelect } from "@/components/common/currency-select";
import { EmployeeSelect } from "@/components/common/employee-select";
import { LookupSelect } from "@/components/common/lookup-select";
import { Input } from "@/components/ui/input";
import type { CreatePaymentFormValues, UpdatePaymentFormValues } from "@/lib/validations/payment.schema";
import { useTranslations } from "next-intl";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

interface PaymentFormFieldsProps {
  register: UseFormRegister<CreatePaymentFormValues | UpdatePaymentFormValues>;
  errors: FieldErrors<CreatePaymentFormValues | UpdatePaymentFormValues>;
  control: Control<CreatePaymentFormValues | UpdatePaymentFormValues>;
}

export function PaymentFormFields({ register, errors, control }: PaymentFormFieldsProps) {
  const t = useTranslations("payments.fields");

  return (
    <div className="space-y-4">
      <FormField label={t("employee")} htmlFor="employee_id" error={errors.employee_id?.message}>
        <Controller
          name="employee_id"
          control={control}
          render={({ field }) => (
            <EmployeeSelect
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={t("selectEmployee")}
            />
          )}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("paymentType")} htmlFor="payment_type_id" error={errors.payment_type_id?.message}>
          <Controller
            name="payment_type_id"
            control={control}
            render={({ field }) => (
              <LookupSelect
                resource="payment-types"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder={t("selectType")}
              />
            )}
          />
        </FormField>
        <FormField
          label={t("paymentStatus")}
          htmlFor="payment_status_id"
          error={errors.payment_status_id?.message}
        >
          <Controller
            name="payment_status_id"
            control={control}
            render={({ field }) => (
              <LookupSelect
                resource="payment-statuses"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder={t("selectStatus")}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("amount")} htmlFor="amount" error={errors.amount?.message}>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
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

      <FormField label={t("paymentDate")} htmlFor="payment_date" error={errors.payment_date?.message}>
        <Input id="payment_date" type="date" {...register("payment_date")} />
      </FormField>

      <FormField label={t("reference")} htmlFor="reference" error={errors.reference?.message}>
        <Input id="reference" placeholder={t("referencePlaceholder")} {...register("reference")} />
      </FormField>

      <FormField label={t("notes")} htmlFor="notes" error={errors.notes?.message}>
        <Input id="notes" placeholder={t("notesPlaceholder")} {...register("notes")} />
      </FormField>
    </div>
  );
}
