import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  CreateEmployeeData,
  Employee,
  EmployeeListParams,
  EmployeeResponse,
  UpdateEmployeeData,
} from "@/types/employees";

function buildQueryString(params: EmployeeListParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

function buildFormData(payload: CreateEmployeeData | UpdateEmployeeData): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === "profile_image" && value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== "") {
      formData.append(key, String(value));
    } else if (value === null || value === "") {
      formData.append(key, "");
    }
  });
  return formData;
}

export const employeeService = {
  async list(
    params: EmployeeListParams = {},
  ): Promise<{ employees: Employee[]; meta: PaginatedMeta }> {
    const { data } = await apiClient.get<ApiResponse<Employee[]>>(
      `/employees${buildQueryString(params)}`,
    );
    const meta = (data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }) as unknown as PaginatedMeta;
    return { employees: data.data, meta };
  },

  async get(id: string): Promise<EmployeeResponse> {
    const { data } = await apiClient.get<ApiResponse<EmployeeResponse>>(`/employees/${id}`);
    return data.data;
  },

  async create(payload: CreateEmployeeData): Promise<EmployeeResponse> {
    const { data } = await apiClient.post<ApiResponse<EmployeeResponse>>(
      "/employees",
      buildFormData(payload),
    );
    return data.data;
  },

  async update(id: string, payload: UpdateEmployeeData): Promise<EmployeeResponse> {
    const formData = buildFormData(payload);
    formData.append("_method", "PUT");
    const { data } = await apiClient.post<ApiResponse<EmployeeResponse>>(
      `/employees/${id}`,
      formData,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/employees/${id}`);
  },

  async restore(id: string): Promise<EmployeeResponse> {
    const { data } = await apiClient.post<ApiResponse<EmployeeResponse>>(
      `/employees/${id}/restore`,
    );
    return data.data;
  },
};
