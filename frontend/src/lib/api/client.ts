import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { env } from "@/config/env";
import type { ApiResponse } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase() ?? "get";

    // Let the browser set multipart boundary — a bare multipart Content-Type breaks validation.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    if (typeof document !== "undefined") {
      const locale =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("NEXT_LOCALE="))
          ?.split("=")[1] ?? "en-US";
      config.headers.set("Accept-Language", decodeURIComponent(locale));
    }

    if (MUTATING_METHODS.has(method)) {
      await getCsrfCookie();
      const token = getCookie("XSRF-TOKEN");
      if (token) {
        config.headers.set("X-XSRF-TOKEN", token);
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.data) {
      const { message, errors } = error.response.data;
      throw new ApiError(
        message ?? "An unexpected error occurred.",
        error.response.status,
        errors,
      );
    }

    if (error.request) {
      throw new ApiError("Network error. Please check your connection.", 0);
    }

    throw new ApiError(error.message ?? "An unexpected error occurred.", 0);
  },
);

export async function getCsrfCookie(): Promise<void> {
  await axios.get(`${env.backendUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}

export { apiClient };
