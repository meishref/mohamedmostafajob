import type { PaginatedMeta } from "./api";

export interface ActivityLogUser {
  id: string;
  name: string;
  email: string;
}

export interface ActivityLog {
  id: string;
  user: ActivityLogUser | null;
  action: string;
  module: string | null;
  description: string | null;
  properties: Record<string, unknown> | null;
  subject_type: string | null;
  subject_id: string | null;
  ip_address: string | null;
  browser: string | null;
  operating_system: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogListParams {
  search?: string;
  module?: string;
  action?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface ActivityLogFilters {
  modules: string[];
  actions: string[];
}

export interface ActivityLogResponse {
  activity_log: ActivityLog;
}

export type ActivityLogListResult = {
  activity_logs: ActivityLog[];
  meta: PaginatedMeta;
};
