"use client";

import { useConfirm } from "@/components/common/confirm-dialog-provider";
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
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationTypes,
  useNotifications,
} from "@/hooks/use-notifications";
import { useFormatters } from "@/hooks/use-formatters";
import type { NotificationListParams } from "@/types/notifications";
import { CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDateTime } = useFormatters();
  const confirm = useConfirm();
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<NotificationListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
  });

  const { data, isLoading, isFetching } = useNotifications(params);
  const { data: types = [] } = useNotificationTypes();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<NotificationListParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
      toast.success(t("toast.markedRead"));
    } catch {
      toast.error(t("toast.markReadFailed"));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success(t("toast.allMarkedRead"));
    } catch {
      toast.error(t("toast.markAllFailed"));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: tConfirm("title"),
      description: t("deleteConfirm"),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteNotification.mutateAsync(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const notifications = data?.notifications ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
          <CheckCheck className="mr-2 h-4 w-4" />
          {t("markAllAsRead")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{tCommon("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Select
              value={params.read ?? ""}
              onChange={(e) =>
                updateParams({
                  read: (e.target.value as "read" | "unread") || undefined,
                })
              }
            >
              <option value="">{t("allStatus")}</option>
              <option value="unread">{t("unread")}</option>
              <option value="read">{t("read")}</option>
            </Select>
            <Select
              value={params.type ?? ""}
              onChange={(e) => updateParams({ type: e.target.value || undefined })}
            >
              <option value="">{t("allTypes")}</option>
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            <Select
              value={String(params.per_page ?? 10)}
              onChange={(e) => updateParams({ per_page: Number(e.target.value) })}
            >
              <option value="10">{tCommon("perPage", { count: 10 })}</option>
              <option value="15">{tCommon("perPage", { count: 15 })}</option>
              <option value="25">{tCommon("perPage", { count: 25 })}</option>
              <option value="50">{tCommon("perPage", { count: 50 })}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("columns.status")}</TableHead>
                      <TableHead>{t("columns.title")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("columns.message")}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t("columns.type")}</TableHead>
                      <TableHead>{t("columns.date")}</TableHead>
                      <TableHead className="text-right">{t("columns.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                          {t("emptyTitle")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            {notification.is_read ? (
                              <Badge variant="outline">{t("read")}</Badge>
                            ) : (
                              <Badge>{t("new")}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{notification.title}</TableCell>
                          <TableCell className="hidden max-w-xs truncate md:table-cell">
                            {notification.message}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">{notification.type}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatDateTime(notification.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {typeof notification.data?.task_id === "string" && (
                                <Button variant="ghost" size="icon" asChild>
                                  <Link
                                    href={`/tasks/${notification.data.task_id}`}
                                    aria-label={tCommon("view")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMarkRead(notification.id)}
                                  disabled={markRead.isPending}
                                  aria-label={t("markAsRead")}
                                >
                                  <CheckCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDelete(notification.id)}
                                disabled={deleteNotification.isPending}
                                aria-label={tCommon("delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
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
                      onClick={() => updateParams({ page: meta.current_page - 1 })}
                    >
                      {tCommon("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.current_page >= meta.last_page}
                      onClick={() => updateParams({ page: meta.current_page + 1 })}
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
