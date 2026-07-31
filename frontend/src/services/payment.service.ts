import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  CreatePaymentData,
  Payment,
  PaymentListParams,
  PaymentResponse,
  UpdatePaymentData,
} from "@/types/payments";

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

export const paymentService = {
  async list(params: PaymentListParams = {}): Promise<{ payments: Payment[]; meta: PaginatedMeta }> {
    const { data } = await apiClient.get<ApiResponse<Payment[]>>(
      `/payments${buildQueryString(params as Record<string, unknown>)}`,
    );
    const meta = (data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }) as unknown as PaginatedMeta;
    return { payments: data.data, meta };
  },

  async get(id: string): Promise<PaymentResponse> {
    const { data } = await apiClient.get<ApiResponse<PaymentResponse>>(`/payments/${id}`);
    return data.data;
  },

  async create(payload: CreatePaymentData): Promise<PaymentResponse> {
    const { data } = await apiClient.post<ApiResponse<PaymentResponse>>("/payments", payload);
    return data.data;
  },

  async update(id: string, payload: UpdatePaymentData): Promise<PaymentResponse> {
    const { data } = await apiClient.put<ApiResponse<PaymentResponse>>(`/payments/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  },

  async restore(id: string): Promise<PaymentResponse> {
    const { data } = await apiClient.post<ApiResponse<PaymentResponse>>(`/payments/${id}/restore`);
    return data.data;
  },
};
