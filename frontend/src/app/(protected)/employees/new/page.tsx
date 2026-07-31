"use client";

import { EmployeeFormFields } from "@/components/employees/employee-form-fields";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useCreateEmployee } from "@/hooks/use-employees";
import { useLookupOptions } from "@/hooks/use-settings";
import {
  useCreateEmployeeSchema,
  type CreateEmployeeFormValues,
} from "@/lib/validations/employee.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = useCreateEmployee();
  const { parseError } = useApiError();
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const createEmployeeSchema = useCreateEmployeeSchema();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const { data: statuses = [], isLoading: statusesLoading } = useLookupOptions("employee-statuses");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      department_id: "",
      job_title_id: "",
      employee_status_id: "",
      hire_date: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (statuses.length > 0) {
      const defaultStatus = statuses.find((s) => s.code === "active")?.id ?? statuses[0].id;
      reset((prev) => ({ ...prev, employee_status_id: defaultStatus }));
    }
  }, [statuses, reset]);

  const onSubmit = async (values: CreateEmployeeFormValues) => {
    try {
      await createEmployee.mutateAsync({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || undefined,
        department_id: values.department_id || undefined,
        job_title_id: values.job_title_id || undefined,
        employee_status_id: values.employee_status_id,
        hire_date: values.hire_date || undefined,
        notes: values.notes || undefined,
        profile_image: profileImage ?? undefined,
      });
      toast.success(t("toast.created"));
      router.push("/employees");
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (statusesLoading) {
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
            <EmployeeFormFields
              mode="create"
              register={register}
              errors={errors}
              control={control}
              onImageChange={setProfileImage}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? t("new.submitting") : t("new.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/employees">{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
