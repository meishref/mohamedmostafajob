export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Business Management System",
  sessionCookie:
    process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "business-management-system-session",
} as const;
