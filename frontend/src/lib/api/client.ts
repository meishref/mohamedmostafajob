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

/** Encrypted XSRF-TOKEN value for cross-origin requests. */
let xsrfToken: string | null = null;
let csrfPromise: Promise<void> | null = null;

type ClientApiConfig = {
  apiBaseUrl: string;
  csrfCookieUrl: string;
  sameOrigin: boolean;
  ngrokDirect: boolean;
};

function safeOrigin(url: string, fallback: string): string {
  try {
    return new URL(url, fallback).origin;
  } catch {
    return "";
  }
}

/** Resolve API URLs at runtime so proxy mode works even if only BACKEND_URL was updated. */
function resolveClientApiConfig(): ClientApiConfig {
  const fallback = env.appUrl;

  if (typeof window === "undefined") {
    const ngrokDirect = env.backendUrl.includes("ngrok") || env.apiUrl.includes("ngrok");
    return {
      apiBaseUrl: env.apiUrl,
      csrfCookieUrl: `${env.backendUrl}/sanctum/csrf-cookie`,
      sameOrigin: false,
      ngrokDirect,
    };
  }

  const windowOrigin = window.location.origin;
  const backendOrigin = safeOrigin(env.backendUrl, windowOrigin);
  const apiOrigin = safeOrigin(env.apiUrl, windowOrigin);
  const sameOrigin =
    backendOrigin === windowOrigin || apiOrigin === windowOrigin;

  if (sameOrigin) {
    return {
      apiBaseUrl: `${windowOrigin}/api/v1`,
      csrfCookieUrl: `${windowOrigin}/sanctum/csrf-cookie`,
      sameOrigin: true,
      ngrokDirect: false,
    };
  }

  return {
    apiBaseUrl: env.apiUrl,
    csrfCookieUrl: `${env.backendUrl}/sanctum/csrf-cookie`,
    sameOrigin: false,
    ngrokDirect: env.backendUrl.includes("ngrok") || env.apiUrl.includes("ngrok"),
  };
}

function ngrokRequestHeaders(config: ClientApiConfig): Record<string, string> {
  if (!config.ngrokDirect) return {};
  return { "ngrok-skip-browser-warning": "true" };
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function applyXsrfHeader(config: InternalAxiosRequestConfig): void {
  const token = xsrfToken ?? readCookie("XSRF-TOKEN");
  if (token) {
    config.headers.set("X-XSRF-TOKEN", token);
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const clientConfig = resolveClientApiConfig();
    config.baseURL = clientConfig.apiBaseUrl;

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

    for (const [key, value] of Object.entries(ngrokRequestHeaders(clientConfig))) {
      config.headers.set(key, value);
    }

    if (MUTATING_METHODS.has(method)) {
      await ensureCsrfCookie();
      if (!clientConfig.sameOrigin) {
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
  const clientConfig = resolveClientApiConfig();

  const response = await apiClient.get(clientConfig.csrfCookieUrl, {
    baseURL: "",
    headers: {
      Accept: "application/json",
      ...ngrokRequestHeaders(clientConfig),
    },
  });

  const contentType = String(response.headers["content-type"] ?? "");
  if (contentType.includes("text/html")) {
    throw new ApiError(
      clientConfig.sameOrigin
        ? "API proxy returned HTML. Set BACKEND_PROXY_URL to your ngrok URL and restart the frontend (npm run dev / npm run start)."
        : "Ngrok returned an HTML page instead of the API. Verify NEXT_PUBLIC_BACKEND_URL and ngrok-skip-browser-warning.",
      0,
    );
  }

  storeXsrfTokenFromResponse(response.headers as Record<string, unknown>);

  if (!xsrfToken) {
    xsrfToken = readCookie("XSRF-TOKEN");
  }

  if (!xsrfToken) {
    if (clientConfig.sameOrigin) {
      throw new ApiError(
        "CSRF cookie was not set. Ensure BACKEND_PROXY_URL points to ngrok, backend is running, and restart the frontend after changing .env.",
        0,
      );
    }

    throw new ApiError(
      "CSRF token was not received. Use same-origin proxy: set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_BACKEND_URL to your frontend URL (e.g. http://168.231.111.10:3000) and BACKEND_PROXY_URL to ngrok, then restart the frontend.",
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
