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

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

/** Encrypted XSRF-TOKEN cookie value for cross-origin requests (must match the cookie sent by the browser). */
let xsrfToken: string | null = null;
let csrfPromise: Promise<void> | null = null;

function isNgrokBackend(): boolean {
  return env.backendUrl.includes("ngrok");
}

function isCrossOriginBackend(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(env.backendUrl).origin !== window.location.origin;
  } catch {
    return false;
  }
}

function ngrokRequestHeaders(): Record<string, string> {
  if (!isNgrokBackend()) return {};
  return { "ngrok-skip-browser-warning": "true" };
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function applyXsrfHeader(config: InternalAxiosRequestConfig): void {
  if (xsrfToken) {
    config.headers.set("X-XSRF-TOKEN", xsrfToken);
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  withXSRFToken: !isCrossOriginBackend(),
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...ngrokRequestHeaders(),
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase() ?? "get";

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

    if (isNgrokBackend()) {
      config.headers.set("ngrok-skip-browser-warning", "true");
    }

    if (MUTATING_METHODS.has(method)) {
      await ensureCsrfCookie();
      if (isCrossOriginBackend()) {
        applyXsrfHeader(config);
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

function storeXsrfTokenFromResponse(headers: Record<string, unknown>): void {
  const raw =
    headers["x-xsrf-token"] ??
    headers["X-XSRF-TOKEN"] ??
    headers["X-Xsrf-Token"];
  if (typeof raw === "string" && raw.length > 0) {
    xsrfToken = raw;
  }
}

async function fetchCsrfCookie(): Promise<void> {
  const response = await apiClient.get(`${env.backendUrl}/sanctum/csrf-cookie`, {
    headers: {
      Accept: "application/json",
      ...ngrokRequestHeaders(),
    },
  });

  const contentType = String(response.headers["content-type"] ?? "");
  if (contentType.includes("text/html")) {
    throw new ApiError(
      "Ngrok returned an HTML page instead of the API. Add ngrok-skip-browser-warning and verify NEXT_PUBLIC_BACKEND_URL.",
      0,
    );
  }

  storeXsrfTokenFromResponse(response.headers as Record<string, unknown>);

  if (isCrossOriginBackend() && !xsrfToken) {
    throw new ApiError(
      "CSRF token was not received. Check SANCTUM_STATEFUL_DOMAINS, CORS exposed headers, and SESSION_SAME_SITE=none.",
      0,
    );
  }

  if (!xsrfToken && !readCookie("XSRF-TOKEN")) {
    throw new ApiError(
      "CSRF token was not received. Check SANCTUM_STATEFUL_DOMAINS and CORS credentials.",
      0,
    );
  }
}

/** Fetch CSRF cookie + token (uses the same axios instance as all API calls). */
export async function ensureCsrfCookie(): Promise<void> {
  if (!csrfPromise) {
    csrfPromise = fetchCsrfCookie().finally(() => {
      csrfPromise = null;
    });
  }

  return csrfPromise;
}

/** @deprecated Use ensureCsrfCookie — kept for existing imports */
export const getCsrfCookie = ensureCsrfCookie;

export { apiClient };
