import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/@libsql/**/*", "./node_modules/libsql/**/*"],
  },
  devIndicators: false,
  poweredByHeader: false,
};

export default nextConfig;
