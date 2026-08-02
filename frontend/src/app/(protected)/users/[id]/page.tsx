"use client";

import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { DetailPageSkeleton } from "@/components/common/detail-page-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { NotFoundState } from "@/components/common/not-found-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import { RoleBadges } from "@/components/users/role-badges";
import { useApiError } from "@/hooks/use-api-error";
import { useRoleLabel } from "@/hooks/use-role-label";
import { useFormatters } from "@/hooks/use-formatters";
import { usePermissions } from "@/hooks/use-permissions";
import {
  useActivateUser,
  useAssignRole,
  useDeleteUser,
  useResetUserPassword,
  useRestoreUser,
  useRoles,
  useSuspendUser,
  useUser,
} from "@/hooks/use-users";
import {
  useResetUserPasswordSchema,
  type ResetUserPasswordFormValues,
} from "@/lib/validations/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Ban, KeyRound, Pencil, RotateCcw, Trash2, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { data, isLoading, isError, refetch } = useUser(userId);
  const { data: roles = [] } = useRoles();
  const roleLabel = useRoleLabel();
  const { parseError } = useApiError();
  const {
    canUpdateUsers,
    canDeleteUsers,
    canSuspendUsers,
    canResetPassword,
    canRestoreUsers,
  } = usePermissions();
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate, formatDateTime } = useFormatters();
  const resetUserPasswordSchema = useResetUserPasswordSchema();

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();
  const resetPassword = useResetUserPassword(userId);
  const assignRole = useAssignRole(userId);
  const confirm = useConfirm();

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ResetUserPasswordFormValues>({
    resolver: zodResolver(resetUserPasswordSchema),
  });

  if (isLoading) return <DetailPageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const user = data?.user;
  if (!user) {
    return (
      <NotFoundState
        title={t("detail.notFoundTitle")}
        message={t("detail.notFoundMessage")}
        backHref="/users"
        backLabel={t("detail.backLabel")}
      />
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSuspend = async () => {
    try {
      await suspendUser.mutateAsync(userId);
      toast.success(t("toast.suspended"));
      refetch();
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  const handleActivate = async () => {
    try {
      await activateUser.mutateAsync(userId);
      toast.success(t("toast.activated"));
      refetch();
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.shortDescription", { name: user.name }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteUser.mutateAsync(userId);
      toast.success(t("toast.deleted"));
      router.push("/users");
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreUser.mutateAsync(userId);
      toast.success(t("toast.restored"));
      refetch();
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  const onResetPassword = async (values: ResetUserPasswordFormValues) => {
    try {
      await resetPassword.mutateAsync(values);
      toast.success(t("toast.passwordReset"));
      resetForm();
      setShowResetPassword(false);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedRole) return;
    try {
      await assignRole.mutateAsync({ role: selectedRole });
      toast.success(t("toast.roleAssigned"));
      refetch();
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("detail.title")}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        {canUpdateUsers && !user.deleted_at && (
          <Button variant="outline" asChild>
            <Link href={`/users/${userId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              {tCommon("edit")}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="flex items-start gap-6 pt-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profile_image_url ?? undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  user.status === "active"
                    ? "default"
                    : user.status === "suspended"
                      ? "destructive"
                      : "secondary"
                }
              >
                {user.status_label}
              </Badge>
              <RoleBadges roles={user.roles} />
              {user.deleted_at && <Badge variant="destructive">{t("detail.deletedBadge")}</Badge>}
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{tCommon("phone")}</dt>
                <dd>{user.phone ?? tCommon("na")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("detail.emailVerified")}</dt>
                <dd>
                  {user.email_verified_at
                    ? formatDate(user.email_verified_at)
                    : t("detail.notVerified")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{tCommon("created")}</dt>
                <dd>{formatDateTime(user.created_at)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{tCommon("updated")}</dt>
                <dd>{formatDateTime(user.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      {canUpdateUsers && !user.deleted_at && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.assignRoleTitle")}</CardTitle>
            <CardDescription>{t("detail.assignRoleDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Select
              value={selectedRole || user.roles?.[0] || ""}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="max-w-xs"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </Select>
            <Button onClick={handleAssignRole} disabled={assignRole.isPending}>
              {t("detail.assignRole")}
            </Button>
          </CardContent>
        </Card>
      )}

      {canResetPassword && !user.deleted_at && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.resetPasswordTitle")}</CardTitle>
            <CardDescription>{t("detail.resetPasswordDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!showResetPassword ? (
              <Button variant="outline" onClick={() => setShowResetPassword(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                {t("detail.resetPassword")}
              </Button>
            ) : (
              <form
                onSubmit={handleSubmit(onResetPassword)}
                className="max-w-sm space-y-4"
                noValidate
              >
                <FormField
                  label={t("detail.newPassword")}
                  htmlFor="password"
                  error={errors.password?.message}
                  required
                >
                  <PasswordInput
                    id="password"
                    placeholder={t("detail.newPasswordPlaceholder")}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                </FormField>
                <FormField
                  label={t("detail.confirmPassword")}
                  htmlFor="password_confirmation"
                  error={errors.password_confirmation?.message}
                  required
                >
                  <PasswordInput
                    id="password_confirmation"
                    placeholder={t("detail.confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password_confirmation}
                    {...register("password_confirmation")}
                  />
                </FormField>
                <div className="flex gap-2">
                  <Button type="submit" loading={resetPassword.isPending}>
                    {resetPassword.isPending ? t("detail.resetting") : t("detail.confirmReset")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetPassword(false)}
                  >
                    {tCommon("cancel")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("detail.actions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {canSuspendUsers && !user.deleted_at && user.status !== "suspended" && (
            <Button variant="outline" onClick={handleSuspend} disabled={suspendUser.isPending}>
              <Ban className="mr-2 h-4 w-4" />
              {t("detail.suspend")}
            </Button>
          )}
          {canUpdateUsers && !user.deleted_at && user.status !== "active" && (
            <Button variant="outline" onClick={handleActivate} disabled={activateUser.isPending}>
              <UserCheck className="mr-2 h-4 w-4" />
              {t("detail.activate")}
            </Button>
          )}
          {user.deleted_at && canRestoreUsers && (
            <Button variant="outline" onClick={handleRestore} disabled={restoreUser.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {tCommon("restore")}
            </Button>
          )}
          {!user.deleted_at && canDeleteUsers && (
            <>
              <Separator orientation="vertical" className="hidden h-9 sm:block" />
              <Button variant="destructive" onClick={handleDelete} disabled={deleteUser.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("detail.deleteUser")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
