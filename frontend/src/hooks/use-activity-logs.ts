"use client";

import { activityLogService } from "@/services/activity-log.service";
import type { ActivityLogListParams } from "@/types/activity-logs";
import { useQuery } from "@tanstack/react-query";

export const activityLogKeys = {
  all: ["activity-logs"] as const,
  lists: () => [...activityLogKeys.all, "list"] as const,
  list: (params: ActivityLogListParams) => [...activityLogKeys.lists(), params] as const,
  details: () => [...activityLogKeys.all, "detail"] as const,
  detail: (id: string) => [...activityLogKeys.details(), id] as const,
  filters: () => [...activityLogKeys.all, "filters"] as const,
};

export function useActivityLogs(params: ActivityLogListParams = {}) {
  return useQuery({
    queryKey: activityLogKeys.list(params),
    queryFn: () => activityLogService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useActivityLog(id: string, enabled = true) {
  return useQuery({
    queryKey: activityLogKeys.detail(id),
    queryFn: () => activityLogService.get(id),
    enabled: enabled && id.length > 0,
    select: (data) => data.activity_log,
  });
}

export function useActivityLogFilters() {
  return useQuery({
    queryKey: activityLogKeys.filters(),
    queryFn: () => activityLogService.getFilters(),
    staleTime: 10 * 60 * 1000,
  });
}
