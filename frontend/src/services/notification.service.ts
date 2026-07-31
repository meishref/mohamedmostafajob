import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  Notification,
  NotificationListParams,
  NotificationListResult,
  NotificationResponse,
  NotificationTypeOption,
  UnreadCountResponse,
} from "@/types/notifications";

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const notificationService = {
  async list(params: NotificationListParams = {}): Promise<NotificationListResult> {
    const { data } = await apiClient.get<ApiResponse<Notification[]>>(
      `/notifications${buildQueryString(params as Record<string, unknown>)}`,
    );
    const meta = (data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }) as unknown as PaginatedMeta;
    return { notifications: data.data, meta };
  },

  async get(id: string): Promise<NotificationResponse> {
    const { data } = await apiClient.get<ApiResponse<NotificationResponse>>(`/notifications/${id}`);
    return data.data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<ApiResponse<UnreadCountResponse>>(
      "/notifications/unread-count",
    );
    return data.data.count;
  },

  async markAsRead(id: string): Promise<NotificationResponse> {
    const { data } = await apiClient.post<ApiResponse<NotificationResponse>>(
      `/notifications/${id}/read`,
    );
    return data.data;
  },

  async markAllAsRead(): Promise<number> {
    const { data } = await apiClient.post<ApiResponse<{ updated: number }>>(
      "/notifications/mark-all-read",
    );
    return data.data.updated;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async getTypes(): Promise<NotificationTypeOption[]> {
    const { data } = await apiClient.get<ApiResponse<{ types: NotificationTypeOption[] }>>(
      "/notifications/types",
    );
    return data.data.types;
  },
};
