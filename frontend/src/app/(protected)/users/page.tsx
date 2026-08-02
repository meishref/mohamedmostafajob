"use client";

import { DataTableCard } from "@/components/common/data-table-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SortIcon } from "@/components/common/sort-icon";
import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDeleteUser, useRestoreUser, useUsers } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-users";
import { useRoleLabel } from "@/hooks/use-role-label";
import { RoleBadges } from "@/components/users/role-badges";
import { USER_STATUSES, type UserListParams } from "@/types/users";
import { Eye, Pencil, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { formatDate } = useFormatters();
  const { canCreateUsers, canDeleteUsers, canRestoreUsers } = usePermissions();
  const confirm = useConfirm();
  const { data: roles = [] } = useRoles();
  const roleLabel = useRoleLabel();
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    per_page: 10,
    sort_by: "created_at",
    sort_direction: "desc",
    trashed: "without",
  });

  const { data, isLoading, isFetching, isError, refetch } = useUsers(params);
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<UserListParams>) => {
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

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.description", { name }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteUser.mutateAsync(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreUser.mutateAsync(id);
      toast.success(t("toast.restored"));
    } catch {
      toast.error(t("toast.restoreFailed"));
    }
  };

  const users = data?.users ?? [];
  const meta = data?.meta;
  const hasFilters = searchInput || params.status || params.role;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          canCreateUsers ? (
            <Button asChild>
              <Link href="/users/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("addUser")}
              </Link>
            </Button>
          ) : undefined
        }
      />

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
            <Select
              value={params.status ?? ""}
              onChange={(e) => updateParams({ status: e.target.value || undefined })}
            >
              <option value="">{t("allStatuses")}</option>
              {USER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(`statuses.${s.value}`)}
                </option>
              ))}
            </Select>
            <Select
              value={params.role ?? ""}
              onChange={(e) => updateParams({ role: e.target.value || undefined })}
            >
              <option value="">{t("allRoles")}</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </Select>
            <Select
              value={params.trashed ?? "without"}
              onChange={(e) =>
                updateParams({ trashed: e.target.value as UserListParams["trashed"] })
              }
            >
              <option value="without">{t("activeUsers")}</option>
              <option value="only">{t("deletedOnly")}</option>
              <option value="with">{t("includeDeleted")}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTableCard
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={users.length === 0}
        emptyState={
          <EmptyState
            icon={Users}
            title={t("emptyTitle")}
            description={hasFilters ? t("emptyFiltered") : t("emptyDefault")}
            variant="card"
            action={
              canCreateUsers && !hasFilters ? (
                <Button asChild size="sm">
                  <Link href="/users/new">{t("addUser")}</Link>
                </Button>
              ) : undefined
            }
          />
        }
        meta={meta}
        onPageChange={(page) => updateParams({ page })}
        isFetching={isFetching}
        skeletonColumns={7}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.user")}</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("email")}
              >
                {t("columns.email")}{" "}
                <SortIcon
                  field="email"
                  sortBy={params.sort_by}
                  sortDirection={params.sort_direction}
                />
              </TableHead>
              <TableHead>{t("columns.phone")}</TableHead>
              <TableHead>{t("columns.role")}</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("status")}
              >
                {t("columns.status")}{" "}
                <SortIcon
                  field="status"
                  sortBy={params.sort_by}
                  sortDirection={params.sort_direction}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("created_at")}
              >
                {t("columns.created")}{" "}
                <SortIcon
                  field="created_at"
                  sortBy={params.sort_by}
                  sortDirection={params.sort_direction}
                />
              </TableHead>
              <TableHead className="text-right">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const initials = user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <TableRow key={user.id} className={user.deleted_at ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_image_url ?? undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone ?? tCommon("na")}</TableCell>
                  <TableCell>
                    <RoleBadges roles={user.roles} className="mr-1" />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active"
                          ? "default"
                          : user.status === "suspended"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {user.status === "active" ||
                      user.status === "inactive" ||
                      user.status === "suspended"
                        ? t(`statuses.${user.status}`)
                        : user.status_label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/users/${user.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {!user.deleted_at && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/users/${user.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {user.deleted_at && canRestoreUsers && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(user.id)}
                          disabled={restoreUser.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {!user.deleted_at && canDeleteUsers && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleteUser.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  );
}
