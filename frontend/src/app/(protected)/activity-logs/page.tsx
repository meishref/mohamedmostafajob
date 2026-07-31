"use client";

import { DataTableCard } from "@/components/common/data-table-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
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
import { usePermissions } from "@/hooks/use-permissions";
import { useFormatters } from "@/hooks/use-formatters";
import { useActivityLogFilters, useActivityLogs } from "@/hooks/use-activity-logs";
import type { ActivityLogListParams } from "@/types/activity-logs";
import { Eye, History } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ActivityLogsPage() {
  const t = useTranslations("activityLogs");
  const tCommon = useTranslations("common");
  const { formatDateTime } = useFormatters();
  const { canViewActivityLogs } = usePermissions();
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<ActivityLogListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
  });

  const { data, isLoading, isFetching, isError, refetch } = useActivityLogs(params);
  const { data: filters } = useActivityLogFilters();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<ActivityLogListParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  if (!canViewActivityLogs) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("permissionDenied")}</p>
      </div>
    );
  }

  const logs = data?.activity_logs ?? [];
  const meta = data?.meta;

  const hasFilters =
    searchInput || params.module || params.action || params.date_from || params.date_to;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{tCommon("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="xl:col-span-2"
            />
            <Select
              value={params.module ?? ""}
              onChange={(e) => updateParams({ module: e.target.value || undefined })}
            >
              <option value="">{t("allModules")}</option>
              {(filters?.modules ?? []).map((module) => (
                <option key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </option>
              ))}
            </Select>
            <Select
              value={params.action ?? ""}
              onChange={(e) => updateParams({ action: e.target.value || undefined })}
            >
              <option value="">{t("allActions")}</option>
              {(filters?.actions ?? []).map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={params.date_from ?? ""}
              onChange={(e) => updateParams({ date_from: e.target.value || undefined })}
            />
            <Input
              type="date"
              value={params.date_to ?? ""}
              onChange={(e) => updateParams({ date_to: e.target.value || undefined })}
            />
          </div>
        </CardContent>
      </Card>

      <DataTableCard
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={logs.length === 0}
        emptyState={
          <EmptyState
            icon={History}
            title={t("emptyTitle")}
            description={hasFilters ? t("emptyFiltered") : t("emptyDefault")}
            variant="card"
          />
        }
        meta={meta}
        onPageChange={(page) => updateParams({ page })}
        isFetching={isFetching}
        skeletonColumns={7}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.user")}</TableHead>
                <TableHead>{t("columns.module")}</TableHead>
                <TableHead>{t("columns.action")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("columns.description")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("columns.ip")}</TableHead>
                <TableHead>{t("columns.date")}</TableHead>
                <TableHead className="text-right">{t("columns.details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.user?.name ?? t("systemUser")}
                  </TableCell>
                  <TableCell>
                    {log.module ? (
                      <Badge variant="secondary">{log.module}</Badge>
                    ) : (
                      tCommon("na")
                    )}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="hidden max-w-xs truncate lg:table-cell">
                    {log.description ?? tCommon("na")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {log.ip_address ?? tCommon("na")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/activity-logs/${log.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DataTableCard>
    </div>
  );
}
