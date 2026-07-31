"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatters } from "@/hooks/use-formatters";
import { usePermissions } from "@/hooks/use-permissions";
import { useActivityLog } from "@/hooks/use-activity-logs";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { use } from "react";

export default function ActivityLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { canViewActivityLogs } = usePermissions();
  const { data: log, isLoading, isError } = useActivityLog(id);
  const t = useTranslations("activityLogs");
  const tCommon = useTranslations("common");
  const { formatDateTime } = useFormatters();

  if (!canViewActivityLogs) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("permissionDenied")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !log) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">{t("detail.notFound")}</p>
        <Button variant="outline" asChild>
          <Link href="/activity-logs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("detail.back")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/activity-logs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("detail.title")}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(log.created_at)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.eventInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label={t("detail.user")} value={log.user?.name ?? t("systemUser")} />
            <DetailRow label={t("detail.email")} value={log.user?.email ?? tCommon("na")} />
            <DetailRow label={t("detail.module")}>
              {log.module ? <Badge variant="secondary">{log.module}</Badge> : tCommon("na")}
            </DetailRow>
            <DetailRow label={t("detail.action")} value={log.action} />
            <DetailRow label={t("detail.description")} value={log.description ?? tCommon("na")} />
            {log.subject_type && (
              <DetailRow
                label={t("detail.subject")}
                value={`${log.subject_type}${log.subject_id ? ` (${log.subject_id})` : ""}`}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.clientInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label={t("detail.ipAddress")} value={log.ip_address ?? tCommon("na")} />
            <DetailRow label={t("detail.browser")} value={log.browser ?? tCommon("na")} />
            <DetailRow
              label={t("detail.operatingSystem")}
              value={log.operating_system ?? tCommon("na")}
            />
            <DetailRow label={t("detail.userAgent")}>
              <span className="break-all text-sm text-muted-foreground">
                {log.user_agent ?? tCommon("na")}
              </span>
            </DetailRow>
          </CardContent>
        </Card>

        {log.properties && Object.keys(log.properties).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t("detail.additionalProperties")}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(log.properties, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm sm:text-right">{children ?? value}</span>
    </div>
  );
}
