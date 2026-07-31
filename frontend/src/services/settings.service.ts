import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  LookupItemResponse,
  LookupListParams,
  LookupOption,
  LookupRecord,
  SettingsResourceMeta,
  SettingsResourceSlug,
} from "@/types/settings";

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

export const settingsService = {
  async getResources(): Promise<SettingsResourceMeta[]> {
    const { data } = await apiClient.get<ApiResponse<SettingsResourceMeta[]>>("/settings/resources");
    return data.data;
  },

  async list(
    resource: SettingsResourceSlug,
    params: LookupListParams = {},
  ): Promise<{ items: LookupRecord[]; meta: PaginatedMeta }> {
    const { data } = await apiClient.get<ApiResponse<LookupRecord[]>>(
      `/settings/${resource}${buildQueryString(params as Record<string, unknown>)}`,
    );
    const meta = (data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }) as unknown as PaginatedMeta;
    return { items: data.data, meta };
  },

  async get(resource: SettingsResourceSlug, id: string): Promise<LookupRecord> {
    const { data } = await apiClient.get<ApiResponse<LookupItemResponse>>(
      `/settings/${resource}/${id}`,
    );
    return data.data.item;
  },

  async create(
    resource: SettingsResourceSlug,
    payload: Record<string, unknown>,
  ): Promise<LookupRecord> {
    const { data } = await apiClient.post<ApiResponse<LookupItemResponse>>(
      `/settings/${resource}`,
      payload,
    );
    return data.data.item;
  },

  async update(
    resource: SettingsResourceSlug,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<LookupRecord> {
    const { data } = await apiClient.put<ApiResponse<LookupItemResponse>>(
      `/settings/${resource}/${id}`,
      payload,
    );
    return data.data.item;
  },

  async delete(resource: SettingsResourceSlug, id: string): Promise<void> {
    await apiClient.delete(`/settings/${resource}/${id}`);
  },

  async restore(resource: SettingsResourceSlug, id: string): Promise<LookupRecord> {
    const { data } = await apiClient.post<ApiResponse<LookupItemResponse>>(
      `/settings/${resource}/${id}/restore`,
    );
    return data.data.item;
  },

  async getOptions(
    resource: SettingsResourceSlug,
    params: { search?: string; active_only?: boolean } = {},
  ): Promise<LookupOption[]> {
    const { data } = await apiClient.get<ApiResponse<LookupOption[]>>(
      `/lookups/${resource}${buildQueryString(params as Record<string, unknown>)}`,
    );
    return data.data;
  },
};
