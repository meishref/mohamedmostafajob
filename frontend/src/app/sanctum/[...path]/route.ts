import { proxyRouteHandlers } from "@/lib/api/backend-proxy";

export const { GET, POST, PUT, PATCH, DELETE, OPTIONS } =
  proxyRouteHandlers("/sanctum");
