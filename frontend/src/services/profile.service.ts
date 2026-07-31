import { apiClient } from "@/lib/api/client";
import type { ApiResponse, AuthResponse, UpdateAccountSettingsData, UpdateProfileData } from "@/types/api";

export const profileService = {
  async getProfile(): Promise<AuthResponse> {
    const { data } = await apiClient.get<ApiResponse<AuthResponse>>("/profile");
    return data.data;
  },

  async updateProfile(payload: UpdateProfileData): Promise<AuthResponse> {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.phone !== undefined) formData.append("phone", payload.phone ?? "");
    if (payload.profile_image) formData.append("profile_image", payload.profile_image);

    const { data } = await apiClient.post<ApiResponse<AuthResponse>>("/profile", formData);
    return data.data;
  },

  async updateAccountSettings(payload: UpdateAccountSettingsData): Promise<AuthResponse> {
    const { data } = await apiClient.put<ApiResponse<AuthResponse>>(
      "/account/settings",
      payload,
    );
    return data.data;
  },
};
