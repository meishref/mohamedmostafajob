import { apiClient, getCsrfCookie } from "@/lib/api/client";
import { env } from "@/config/env";
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
} from "@/types/api";

export const authService = {
  async getCsrfCookie(): Promise<void> {
    await getCsrfCookie();
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await getCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      credentials,
    );
    return data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await getCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async me(): Promise<AuthResponse> {
    const { data } = await apiClient.get<ApiResponse<AuthResponse>>("/auth/me");
    return data.data;
  },

  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<string> {
    await getCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<null>>(
      "/auth/forgot-password",
      credentials,
    );
    return data.message;
  },

  async resetPassword(credentials: ResetPasswordCredentials): Promise<string> {
    await getCsrfCookie();
    const { data } = await apiClient.post<ApiResponse<null>>(
      "/auth/reset-password",
      credentials,
    );
    return data.message;
  },

  async sendVerificationEmail(): Promise<string> {
    const { data } = await apiClient.post<ApiResponse<null>>(
      "/auth/email/verification-notification",
    );
    return data.message;
  },

  async verifyEmail(signedUrl: string): Promise<AuthResponse> {
    const decoded = decodeURIComponent(signedUrl);
    const url = new URL(decoded);
    const apiPath = url.pathname.replace(/^\/api\/v1/, "") + url.search;
    const { data } = await apiClient.get<ApiResponse<AuthResponse>>(apiPath);
    return data.data;
  },

  getGoogleAuthUrl(): string {
    return `${env.apiUrl}/auth/google/redirect`;
  },
};
