"use client";

import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadges } from "@/components/users/role-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApiError } from "@/hooks/use-api-error";
import { useCurrentUser, useUpdateProfile } from "@/hooks/use-auth";
import {
  useUpdateProfileSchema,
  type UpdateProfileFormValues,
} from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data, isLoading, isError, refetch } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const { parseError } = useApiError();
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const updateProfileSchema = useUpdateProfileSchema();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (data?.user) {
      reset({
        name: data.user.name,
        phone: data.user.phone ?? "",
      });
    }
  }, [data, reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("google_auth") !== "success") return;

    toast.success(tAuth("googleSignInSuccess"));
    void refetch();
    window.history.replaceState({}, "", "/profile");
  }, [refetch, tAuth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: UpdateProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        phone: values.phone || null,
        profile_image: selectedFile ?? undefined,
      });
      toast.success(t("toast.updated"));
      setSelectedFile(null);
      setPreview(null);
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

  if (isError || !data?.user) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const user = data.user;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={preview ?? user.profile_image_url ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="secondary">{user.status_label}</Badge>
                <RoleBadges roles={user.roles} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label={t("fullName")} htmlFor="name" error={errors.name?.message}>
              <Input id="name" {...register("name")} />
            </FormField>

            <FormField label={t("phone")} htmlFor="phone" error={errors.phone?.message}>
              <Input
                id="phone"
                type="tel"
                placeholder={t("phonePlaceholder")}
                {...register("phone")}
              />
            </FormField>

            <FormField label={t("profileImage")} htmlFor="profile_image">
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </FormField>

            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? t("saving") : t("saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
