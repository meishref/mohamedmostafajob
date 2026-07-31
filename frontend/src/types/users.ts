import type { User } from "./api";

export interface UserListParams {
  search?: string;
  status?: string;
  role?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  trashed?: "with" | "only" | "without";
}

export interface UserListResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface RolesResponse {
  roles: string[];
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  status?: string;
  role: string;
  profile_image?: File;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string | null;
  status?: string;
  role?: string;
  profile_image?: File;
}

export interface ResetUserPasswordData {
  password: string;
  password_confirmation: string;
}

export interface AssignRoleData {
  role: string;
}

export const USER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
] as const;
