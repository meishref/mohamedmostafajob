"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { UserFormFields } from "@/components/users/user-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useUpdateUser, useUser } from "@/hooks/use-users";
import { useUpdateUserSchema, type UpdateUserFormValues } from "@/lib/validations/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { data, isLoading } = useUser(userId);
  const updateUser = useUpdateUser(userId);
  const { parseError } = useApiError();
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const updateUserSchema = useUpdateUserSchema();
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (data?.user) {
      reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone ?? "",
        status: data.user.status as UpdateUserFormValues["status"],
        role: (data.user.roles?.[0] ?? "employee") as UpdateUserFormValues["role"],
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: UpdateUserFormValues) => {
    try {
      await updateUser.mutateAsync({
        ...values,
        profile_image: profileImage ?? undefined,
      });
      toast.success(t("toast.updated"));
      router.push(`/users/${userId}`);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (isLoading) {
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
            <UserFormFields
              register={register}
              errors={errors}
              mode="edit"
              defaultImageUrl={data?.user.profile_image_url}
              onImageChange={setProfileImage}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? t("edit.saving") : t("edit.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/users/${userId}`}>{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
