import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  ActivityLog,
  ActivityLogFilters,
  ActivityLogListParams,
  ActivityLogResponse,
} from "@/types/activity-logs";

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

export const activityLogService = {
  async list(params: ActivityLogListParams = {}): Promise<{
    activity_logs: ActivityLog[];
    meta: PaginatedMeta;
  }> {
    const { data } = await apiClient.get<ApiResponse<ActivityLog[]>>(
      `/activity-logs${buildQueryString(params as Record<string, unknown>)}`,
    );
    const meta = (data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }) as unknown as PaginatedMeta;
    return { activity_logs: data.data, meta };
  },

  async get(id: string): Promise<ActivityLogResponse> {
    const { data } = await apiClient.get<ApiResponse<ActivityLogResponse>>(`/activity-logs/${id}`);
    return data.data;
  },

  async getFilters(): Promise<ActivityLogFilters> {
    const { data } = await apiClient.get<ApiResponse<ActivityLogFilters>>(
      "/activity-logs/filters",
    );
    return data.data;
  },
};
