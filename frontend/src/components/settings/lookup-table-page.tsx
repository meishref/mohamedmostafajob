"use client";

import { getNestedValue } from "@/config/settings";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFormatters } from "@/hooks/use-formatters";
import { usePermissions } from "@/hooks/use-permissions";
import {
  useDeleteLookup,
  useLookupList,
  useRestoreLookup,
} from "@/hooks/use-settings";
import type {
  LookupListParams,
  LookupRecord,
  SettingsResourceConfig,
  SettingsResourceSlug,
} from "@/types/settings";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

const COLUMN_LABEL_KEYS: Record<string, string> = {
  name: "name",
  code: "code",
  "parent.name": "parent",
  "department.name": "department",
  is_active: "active",
  created_at: "created",
  color: "color",
  sort_order: "order",
  is_default: "default",
  is_closed: "closed",
  level: "level",
  is_final: "final",
  website: "website",
  from_currency: "from",
  to_currency: "to",
  rate: "rate",
  effective_date: "effectiveDate",
};

interface LookupTablePageProps {
  config: SettingsResourceConfig;
}

function getDisplayName(item: LookupRecord): string {
  if (item.name) return item.name;
  if (item.from_currency && item.to_currency) {
    return `${item.from_currency} → ${item.to_currency}`;
  }
  return item.id;
}

export function LookupTablePage({ config }: LookupTablePageProps) {
  const { canManageSettings } = usePermissions();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { formatDate } = useFormatters();
  const resourceKey = RESOURCE_KEYS[config.slug];
  const label = t(`resources.${resourceKey}.label` as "resources.departments.label");
  const singular = t(`resources.${resourceKey}.singular` as "resources.departments.singular");

  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<LookupListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
    trashed: "without",
  });

  const { data, isLoading, isFetching } = useLookupList(config.slug, params);
  const deleteLookup = useDeleteLookup(config.slug);
  const restoreLookup = useRestoreLookup(config.slug);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<LookupListParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const toggleSort = (field: string) => {
    setParams((prev) => ({
      ...prev,
      sort_by: field,
      sort_direction:
        prev.sort_by === field && prev.sort_direction === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (params.sort_by !== field) return <ArrowUpDown className="ml-1 inline h-3 w-3" />;
    return params.sort_direction === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  };

  const renderCellValue = (item: LookupRecord, key: string): React.ReactNode => {
    const value = getNestedValue(item, key);

    if (value === null || value === undefined || value === "") return tCommon("na");

    if (key === "is_active" || key === "is_default" || key === "is_closed" || key === "is_final") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? tCommon("yes") : tCommon("no")}
        </Badge>
      );
    }

    if (key === "color" && typeof value === "string") {
      return (
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-muted-foreground">{value}</span>
        </div>
      );
    }

    if ((key === "created_at" || key === "effective_date") && typeof value === "string") {
      return formatDate(value);
    }

    if (key === "website" && typeof value === "string") {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {value}
        </a>
      );
    }

    return String(value);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("deleteConfirm", { name }))) return;
    try {
      await deleteLookup.mutateAsync(id);
      toast.success(t("toast.deleted", { singular }));
    } catch {
      toast.error(t("toast.deleteFailed", { singular: singular.toLowerCase() }));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreLookup.mutateAsync(id);
      toast.success(t("toast.restored", { singular }));
    } catch {
      toast.error(t("toast.restoreFailed", { singular: singular.toLowerCase() }));
    }
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const basePath = `/settings/${config.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
          <p className="text-sm text-muted-foreground">
            {t("manageLookup", { label: label.toLowerCase() })}
          </p>
        </div>
        {canManageSettings && (
          <Button asChild>
            <Link href={`${basePath}/new`}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addItem", { singular })}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tCommon("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {config.hasActiveFilter && (
              <Select
                value={params.is_active ?? ""}
                onChange={(e) => updateParams({ is_active: e.target.value || undefined })}
              >
                <option value="">{t("allStatuses")}</option>
                <option value="true">{t("activeOnly")}</option>
                <option value="false">{t("inactiveOnly")}</option>
              </Select>
            )}
            <Select
              value={params.trashed ?? "without"}
              onChange={(e) =>
                updateParams({ trashed: e.target.value as LookupListParams["trashed"] })
              }
            >
              <option value="without">{t("activeRecords")}</option>
              <option value="only">{t("deletedOnly")}</option>
              <option value="with">{t("includeDeleted")}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {config.columns.map((col) => {
                        const colKey = COLUMN_LABEL_KEYS[col.key];
                        const colLabel = colKey
                          ? t(`columns.${colKey}` as "columns.name")
                          : col.label;
                        return (
                          <TableHead
                            key={col.key}
                            className={
                              col.sortable
                                ? "cursor-pointer select-none whitespace-nowrap"
                                : "whitespace-nowrap"
                            }
                            onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                          >
                            {colLabel}
                            {col.sortable && <SortIcon field={col.key} />}
                          </TableHead>
                        );
                      })}
                      <TableHead className="text-right">{t("columns.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={config.columns.length + 1}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {t("empty")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id} className={item.deleted_at ? "opacity-60" : ""}>
                          {config.columns.map((col) => (
                            <TableCell key={col.key} className="whitespace-nowrap">
                              {renderCellValue(item, col.key)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {!item.deleted_at && canManageSettings && (
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`${basePath}/${item.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              {item.deleted_at && canManageSettings && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRestore(item.id)}
                                  disabled={restoreLookup.isPending}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              {!item.deleted_at && canManageSettings && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(item.id, getDisplayName(item))}
                                  disabled={deleteLookup.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {meta && meta.last_page > 1 && (
                <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {tCommon("pageOf", {
                      current: meta.current_page,
                      total: meta.last_page,
                      count: meta.total,
                    })}
                    {isFetching && ` · ${tCommon("updating")}`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.current_page <= 1}
                      onClick={() => updateParams({ page: (params.page ?? 1) - 1 })}
                    >
                      {tCommon("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.current_page >= meta.last_page}
                      onClick={() => updateParams({ page: (params.page ?? 1) + 1 })}
                    >
                      {tCommon("next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
