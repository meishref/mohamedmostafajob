import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** API proxy is handled by src/app/api/[...path]/route.ts and src/app/sanctum/[...path]/route.ts */
const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
