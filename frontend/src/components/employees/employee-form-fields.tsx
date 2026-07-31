"use client";

import { FormField } from "@/components/common/form-field";
import { LookupSelect } from "@/components/common/lookup-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CreateEmployeeFormValues,
  UpdateEmployeeFormValues,
} from "@/lib/validations/employee.schema";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

interface BaseEmployeeFormFieldsProps {
  defaultImageUrl?: string | null;
  onImageChange?: (file: File | null) => void;
  control: Control<CreateEmployeeFormValues | UpdateEmployeeFormValues>;
}

interface CreateEmployeeFormFieldsProps extends BaseEmployeeFormFieldsProps {
  mode: "create";
  register: UseFormRegister<CreateEmployeeFormValues>;
  errors: FieldErrors<CreateEmployeeFormValues>;
}

interface EditEmployeeFormFieldsProps extends BaseEmployeeFormFieldsProps {
  mode: "edit";
  register: UseFormRegister<UpdateEmployeeFormValues>;
  errors: FieldErrors<UpdateEmployeeFormValues>;
}

type EmployeeFormFieldsProps = CreateEmployeeFormFieldsProps | EditEmployeeFormFieldsProps;

export function EmployeeFormFields(props: EmployeeFormFieldsProps) {
  const { defaultImageUrl, onImageChange, control } = props;
  const t = useTranslations("employees.fields");
  const tCommon = useTranslations("common");
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const register = props.register as UseFormRegister<
    CreateEmployeeFormValues & UpdateEmployeeFormValues
  >;
  const errors = props.errors as FieldErrors<
    CreateEmployeeFormValues & UpdateEmployeeFormValues
  >;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onImageChange?.(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={preview ?? defaultImageUrl ?? undefined} />
          <AvatarFallback>EM</AvatarFallback>
        </Avatar>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {tCommon("uploadPhoto")}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <FormField label={t("fullName")} htmlFor="full_name" error={errors.full_name?.message}>
        <Input id="full_name" placeholder={t("fullNamePlaceholder")} {...register("full_name")} />
      </FormField>

      <FormField label={t("email")} htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" {...register("email")} />
      </FormField>

      <FormField label={t("phone")} htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" placeholder={t("phonePlaceholder")} {...register("phone")} />
      </FormField>

      <FormField label={t("department")} htmlFor="department_id" error={errors.department_id?.message}>
        <Controller
          name="department_id"
          control={control}
          render={({ field }) => (
            <LookupSelect
              resource="departments"
              placeholder={t("selectDepartment")}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label={t("jobTitle")} htmlFor="job_title_id" error={errors.job_title_id?.message}>
        <Controller
          name="job_title_id"
          control={control}
          render={({ field }) => (
            <LookupSelect
              resource="job-titles"
              placeholder={t("selectJobTitle")}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField
        label={t("employmentStatus")}
        htmlFor="employee_status_id"
        error={errors.employee_status_id?.message}
      >
        <Controller
          name="employee_status_id"
          control={control}
          render={({ field }) => (
            <LookupSelect
              resource="employee-statuses"
              placeholder={t("selectStatus")}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label={t("hireDate")} htmlFor="hire_date" error={errors.hire_date?.message}>
        <Input id="hire_date" type="date" {...register("hire_date")} />
      </FormField>

      <FormField label={t("notes")} htmlFor="notes" error={errors.notes?.message}>
        <textarea
          id="notes"
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t("notesPlaceholder")}
          {...register("notes")}
        />
      </FormField>
    </div>
  );
}
