import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const { data } = await apiClient.get<ApiResponse<DashboardData>>("/dashboard");
    return data.data;
  },
};
