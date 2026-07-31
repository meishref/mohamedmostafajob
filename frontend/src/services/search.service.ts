import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { GlobalSearchResponse } from "@/types/search";

export const searchService = {
  async search(query: string): Promise<GlobalSearchResponse> {
    const { data } = await apiClient.get<ApiResponse<GlobalSearchResponse>>(
      `/search?q=${encodeURIComponent(query)}`,
    );
    return data.data;
  },
};
