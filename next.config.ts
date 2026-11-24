import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  devIndicators: false,
  poweredByHeader: false,
};

export default nextConfig;
