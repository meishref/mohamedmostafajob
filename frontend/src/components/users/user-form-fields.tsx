"use client";

import { FormField } from "@/components/common/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { USER_STATUSES } from "@/types/users";
import type { CreateUserFormValues, UpdateUserFormValues } from "@/lib/validations/user.schema";
import { useRoles } from "@/hooks/use-users";
import { useRoleLabel } from "@/hooks/use-role-label";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface BaseUserFormFieldsProps {
  defaultImageUrl?: string | null;
  onImageChange?: (file: File | null) => void;
}

interface CreateUserFormFieldsProps extends BaseUserFormFieldsProps {
  mode: "create";
  register: UseFormRegister<CreateUserFormValues>;
  errors: FieldErrors<CreateUserFormValues>;
}

interface EditUserFormFieldsProps extends BaseUserFormFieldsProps {
  mode: "edit";
  register: UseFormRegister<UpdateUserFormValues>;
  errors: FieldErrors<UpdateUserFormValues>;
}

type UserFormFieldsProps = CreateUserFormFieldsProps | EditUserFormFieldsProps;

export function UserFormFields(props: UserFormFieldsProps) {
  const { mode, defaultImageUrl, onImageChange } = props;
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onImageChange?.(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const register = props.register as UseFormRegister<CreateUserFormValues & UpdateUserFormValues>;
  const errors = props.errors as FieldErrors<CreateUserFormValues & UpdateUserFormValues>;
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const roleLabel = useRoleLabel();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={preview ?? defaultImageUrl ?? undefined} />
          <AvatarFallback>IMG</AvatarFallback>
        </Avatar>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {tCommon("uploadPhoto")}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <FormField label={t("fields.fullName")} htmlFor="name" error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </FormField>

      <FormField label={t("fields.email")} htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" {...register("email")} />
      </FormField>

      <FormField label={t("fields.phone")} htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" placeholder={t("fields.phonePlaceholder")} {...register("phone")} />
      </FormField>

      <FormField label={t("fields.role")} htmlFor="role" error={errors.role?.message} required>
        <Select id="role" {...register("role")} disabled={rolesLoading}>
          {rolesLoading && <option value="">{t("loadingRoles")}</option>}
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label={t("fields.status")} htmlFor="status" error={errors.status?.message}>
        <Select id="status" {...register("status")}>
          {USER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {t(`statuses.${s.value}`)}
            </option>
          ))}
        </Select>
      </FormField>

      {mode === "create" && (
        <>
          <FormField
            label={t("fields.password")}
            htmlFor="password"
            error={errors.password?.message}
            hint={t("fields.passwordHint")}
            required
          >
            <PasswordInput
              id="password"
              placeholder={t("fields.passwordPlaceholder")}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </FormField>
          <FormField
            label={t("fields.confirmPassword")}
            htmlFor="password_confirmation"
            error={errors.password_confirmation?.message}
            required
          >
            <PasswordInput
              id="password_confirmation"
              placeholder={t("fields.confirmPasswordPlaceholder")}
              autoComplete="new-password"
              aria-invalid={!!errors.password_confirmation}
              {...register("password_confirmation")}
            />
          </FormField>
        </>
      )}
    </div>
  );
}
