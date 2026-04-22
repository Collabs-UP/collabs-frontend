import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_ORIGIN ??
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

function normalizeBackendOrigin(value: string): string {
  return value
    .trim()
    .replace(/^['\"]|['\"]$/g, "")
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
}

const normalizedBackendOrigin = normalizeBackendOrigin(backendOrigin);

const nextConfig: NextConfig = {
  async rewrites() {
    if (!normalizedBackendOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
