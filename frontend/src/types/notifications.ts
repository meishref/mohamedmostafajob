import type { PaginatedMeta } from "./api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationListParams {
  search?: string;
  type?: string;
  read?: "read" | "unread";
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface NotificationTypeOption {
  value: string;
  label: string;
}

export interface NotificationResponse {
  notification: Notification;
}

export interface UnreadCountResponse {
  count: number;
}

export type NotificationListResult = {
  notifications: Notification[];
  meta: PaginatedMeta;
};
