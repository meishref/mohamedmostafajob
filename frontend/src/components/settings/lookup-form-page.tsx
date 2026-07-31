"use client";

import { LookupFormFields, useSettingsFieldLabel } from "@/components/settings/lookup-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useApiError } from "@/hooks/use-api-error";
import {
  useCreateLookup,
  useLookupItem,
  useUpdateLookup,
} from "@/hooks/use-settings";
import {
  buildDefaultValues,
  recordToFormValues,
  useBuildLookupSchema,
} from "@/lib/validations/settings.schema";
import type { SettingsResourceConfig, SettingsResourceSlug } from "@/types/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RESOURCE_KEYS: Record<SettingsResourceSlug, string> = {
  departments: "departments",
  "job-titles": "jobTitles",
  "employee-statuses": "employeeStatuses",
  "task-statuses": "taskStatuses",
  priorities: "priorities",
  "payment-types": "paymentTypes",
  "payment-statuses": "paymentStatuses",
  "expense-categories": "expenseCategories",
  "advertising-platforms": "advertisingPlatforms",
  "exchange-rates": "exchangeRates",
};

interface LookupFormPageProps {
  config: SettingsResourceConfig;
  mode: "create" | "edit";
  id?: string;
}

export function LookupFormPage({ config, mode, id }: LookupFormPageProps) {
  const router = useRouter();
  const { parseError } = useApiError();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const buildLookupSchema = useBuildLookupSchema();
  const getFieldLabel = useSettingsFieldLabel();
  const resourceKey = RESOURCE_KEYS[config.slug];
  const singular = t(`resources.${resourceKey}.singular` as "resources.departments.singular");

  const schema = useMemo(
    () => buildLookupSchema(config.fields, getFieldLabel),
    [buildLookupSchema, config.fields, getFieldLabel],
  );

  const createLookup = useCreateLookup(config.slug);
  const updateLookup = useUpdateLookup(config.slug, id ?? "");
  const { data: record, isLoading } = useLookupItem(config.slug, id ?? "", mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(config.fields),
  });

  useEffect(() => {
    if (mode === "edit" && record) {
      reset(recordToFormValues(record, config.fields));
    }
  }, [mode, record, reset, config.fields]);

  const basePath = `/settings/${config.slug}`;
  const isPending = createLookup.isPending || updateLookup.isPending;

  const onSubmit = async (values: Record<string, unknown>) => {
    const payload = { ...values };
    for (const field of config.fields) {
      if (field.type === "lookup" && payload[field.name] === "") {
        payload[field.name] = null;
      }
    }

    try {
      if (mode === "create") {
        await createLookup.mutateAsync(payload);
        toast.success(t("toast.created", { singular }));
      } else if (id) {
        await updateLookup.mutateAsync(payload);
        toast.success(t("toast.updated", { singular }));
      }
      router.push(basePath);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (mode === "edit" && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "create"
            ? t("form.addTitle", { singular })
            : t("form.editTitle", { singular })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? t("form.createDescription", { singular: singular.toLowerCase() })
            : t("form.updateDescription", { singular: singular.toLowerCase() })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("form.cardTitle", { singular })}</CardTitle>
          <CardDescription>{t("form.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <LookupFormFields
              fields={config.fields}
              register={register}
              errors={errors}
              control={control}
              excludeSelfId={id}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("form.saving")
                  : mode === "create"
                    ? t("form.create", { singular })
                    : t("form.save")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={basePath}>{tCommon("cancel")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
