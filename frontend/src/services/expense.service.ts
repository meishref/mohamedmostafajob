import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  CreateExpenseData,
  CurrencyOption,
  Expense,
  ExpenseListParams,
  ExpenseResponse,
  UpdateExpenseData,
} from "@/types/expenses";

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

function buildFormData(payload: CreateExpenseData | UpdateExpenseData): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === "attachment" && value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== "") {
      formData.append(key, String(value));
    } else if (value === null || value === "") {
      formData.append(key, "");
    }
  });
  return formData;
}

export const expenseService = {
  async list(params: ExpenseListParams = {}): Promise<{ expenses: Expense[]; meta: PaginatedMeta }> {
    const { data } = await apiClient.get<ApiResponse<Expense[]>>(
      `/expenses${buildQueryString(params as Record<string, unknown>)}`,
    );
    const meta = (data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }) as unknown as PaginatedMeta;
    return { expenses: data.data, meta };
  },

  async get(id: string): Promise<ExpenseResponse> {
    const { data } = await apiClient.get<ApiResponse<ExpenseResponse>>(`/expenses/${id}`);
    return data.data;
  },

  async create(payload: CreateExpenseData): Promise<ExpenseResponse> {
    const { data } = await apiClient.post<ApiResponse<ExpenseResponse>>(
      "/expenses",
      buildFormData(payload),
    );
    return data.data;
  },

  async update(id: string, payload: UpdateExpenseData): Promise<ExpenseResponse> {
    const formData = buildFormData(payload);
    formData.append("_method", "PUT");
    const { data } = await apiClient.post<ApiResponse<ExpenseResponse>>(
      `/expenses/${id}`,
      formData,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },

  async restore(id: string): Promise<ExpenseResponse> {
    const { data } = await apiClient.post<ApiResponse<ExpenseResponse>>(
      `/expenses/${id}/restore`,
    );
    return data.data;
  },

  async getCurrencies(): Promise<CurrencyOption[]> {
    const { data } = await apiClient.get<ApiResponse<CurrencyOption[]>>("/lookups/currencies");
    return data.data;
  },
};
