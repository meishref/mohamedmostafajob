import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedMeta } from "@/types/api";
import type {
  AssignRoleData,
  CreateUserData,
  ResetUserPasswordData,
  RolesResponse,
  UpdateUserData,
  UserListParams,
  UserListResponse,
  UserResponse,
} from "@/types/users";

function buildQueryString(params: UserListParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const userService = {
  async list(params: UserListParams = {}): Promise<{ users: UserListResponse["users"]; meta: PaginatedMeta }> {
    const { data } = await apiClient.get<ApiResponse<UserListResponse["users"]>>(
      `/users${buildQueryString(params)}`,
    );
    const meta = (data.meta ?? { current_page: 1, last_page: 1, per_page: 15, total: 0 }) as unknown as PaginatedMeta;
    return { users: data.data, meta };
  },

  async get(id: string): Promise<UserResponse> {
    const { data } = await apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return data.data;
  },

  async create(payload: CreateUserData): Promise<UserResponse> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("password_confirmation", payload.password_confirmation);
    formData.append("role", payload.role);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.status) formData.append("status", payload.status);
    if (payload.profile_image) formData.append("profile_image", payload.profile_image);

    const { data } = await apiClient.post<ApiResponse<UserResponse>>("/users", formData);
    return data.data;
  },

  async update(id: string, payload: UpdateUserData): Promise<UserResponse> {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone !== undefined) formData.append("phone", payload.phone ?? "");
    if (payload.status) formData.append("status", payload.status);
    if (payload.role) formData.append("role", payload.role);
    if (payload.profile_image) formData.append("profile_image", payload.profile_image);
    formData.append("_method", "PUT");

    const { data } = await apiClient.post<ApiResponse<UserResponse>>(`/users/${id}`, formData);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async restore(id: string): Promise<UserResponse> {
    const { data } = await apiClient.post<ApiResponse<UserResponse>>(`/users/${id}/restore`);
    return data.data;
  },

  async suspend(id: string): Promise<UserResponse> {
    const { data } = await apiClient.post<ApiResponse<UserResponse>>(`/users/${id}/suspend`);
    return data.data;
  },

  async activate(id: string): Promise<UserResponse> {
    const { data } = await apiClient.post<ApiResponse<UserResponse>>(`/users/${id}/activate`);
    return data.data;
  },

  async resetPassword(id: string, payload: ResetUserPasswordData): Promise<void> {
    await apiClient.post(`/users/${id}/reset-password`, payload);
  },

  async assignRole(id: string, payload: AssignRoleData): Promise<UserResponse> {
    const { data } = await apiClient.put<ApiResponse<UserResponse>>(`/users/${id}/role`, payload);
    return data.data;
  },

  async getRoles(): Promise<string[]> {
    const { data } = await apiClient.get<ApiResponse<RolesResponse>>("/roles");
    return data.data.roles;
  },
};
