"use client";

import { UserFormFields } from "@/components/users/user-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiError } from "@/hooks/use-api-error";
import { useCreateUser } from "@/hooks/use-users";
import { useCreateUserSchema, type CreateUserFormValues } from "@/lib/validations/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const { parseError } = useApiError();
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const createUserSchema = useCreateUserSchema();
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { status: "active", role: "employee" },
  });

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      await createUser.mutateAsync({
        ...values,
        profile_image: profileImage ?? undefined,
      });
      toast.success(t("toast.created"));
      router.push("/users");
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

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
            <UserFormFields
              register={register}
              errors={errors}
              mode="create"
              onImageChange={setProfileImage}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? t("new.submitting") : t("new.submit")}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/users">{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
