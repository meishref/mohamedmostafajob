import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Proxies /api and /sanctum to BACKEND_PROXY_URL (ngrok/Laravel).
 * Requires BACKEND_PROXY_URL — do not fall back to NEXT_PUBLIC_BACKEND_URL
 * or same-origin URLs would proxy to themselves.
 */
const backendProxyUrl = process.env.BACKEND_PROXY_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendProxyUrl) {
      return [];
    }

    return [
      {
        source: "/sanctum/:path*",
        destination: `${backendProxyUrl}/sanctum/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendProxyUrl}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
