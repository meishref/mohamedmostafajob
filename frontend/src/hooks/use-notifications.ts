"use client";

import { notificationService } from "@/services/notification.service";
import type { NotificationListParams } from "@/types/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: NotificationListParams) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  types: () => [...notificationKeys.all, "types"] as const,
};

export function useNotifications(
  params: NotificationListParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params),
    enabled: options.enabled ?? true,
    staleTime: 15 * 1000,
  });
}

export function useNotification(id: string, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.get(id),
    enabled: enabled && id.length > 0,
    select: (data) => data.notification,
  });
}

export function useUnreadNotificationCount(pollInterval = 30000) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
  });
}

export function useNotificationTypes() {
  return useQuery({
    queryKey: notificationKeys.types(),
    queryFn: () => notificationService.getTypes(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
