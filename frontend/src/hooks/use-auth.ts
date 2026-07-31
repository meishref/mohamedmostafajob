"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import type {
  ForgotPasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  UpdateAccountSettingsData,
  UpdateProfileData,
} from "@/types/api";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.me(),
    retry: false,
    enabled,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      // Drop previous user's cached dashboard/tasks/notifications so roles never leak.
      queryClient.clear();
      queryClient.setQueryData(authKeys.me(), data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (credentials: ForgotPasswordCredentials) =>
      authService.forgotPassword(credentials),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (credentials: ResetPasswordCredentials) =>
      authService.resetPassword(credentials),
  });
}

export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: () => authService.sendVerificationEmail(),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signedUrl: string) => authService.verifyEmail(signedUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => profileService.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileData) => profileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useUpdateAccountSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAccountSettingsData) =>
      profileService.updateAccountSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
