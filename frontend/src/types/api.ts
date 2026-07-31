export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginatedMeta;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  profile_image_url: string | null;
  status: string;
  status_label: string;
  email_verified_at: string | null;
  roles?: string[];
  permissions?: string[];
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string | null;
  profile_image?: File;
}

export interface UpdateAccountSettingsData {
  email?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}
