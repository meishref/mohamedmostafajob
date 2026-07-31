"use client";

import { EmployeeFormFields } from "@/components/employees/employee-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import {
  useUpdateEmployeeSchema,
  type UpdateEmployeeFormValues,
} from "@/lib/validations/employee.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const { data: employee, isLoading } = useEmployee(employeeId);
  const updateEmployee = useUpdateEmployee(employeeId);
  const { parseError } = useApiError();
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const updateEmployeeSchema = useUpdateEmployeeSchema();
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(updateEmployeeSchema),
  });

  useEffect(() => {
    if (employee) {
      reset({
        full_name: employee.full_name,
        email: employee.email,
        phone: employee.phone ?? "",
        department_id: employee.department_id ?? "",
        job_title_id: employee.job_title_id ?? "",
        employee_status_id: employee.employee_status_id,
        hire_date: employee.hire_date ?? "",
        notes: employee.notes ?? "",
      });
    }
  }, [employee, reset]);

  const onSubmit = async (values: UpdateEmployeeFormValues) => {
    try {
      await updateEmployee.mutateAsync({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || null,
        department_id: values.department_id || null,
        job_title_id: values.job_title_id || null,
        employee_status_id: values.employee_status_id,
        hire_date: values.hire_date || null,
        notes: values.notes || null,
        profile_image: profileImage ?? undefined,
      });
      toast.success(t("toast.updated"));
      router.push(`/employees/${employeeId}`);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (isLoading || !employee) {
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
            <EmployeeFormFields
              mode="edit"
              register={register}
              errors={errors}
              control={control}
              defaultImageUrl={employee.profile_image_url}
              onImageChange={setProfileImage}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? t("edit.saving") : t("edit.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/employees/${employeeId}`}>{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
