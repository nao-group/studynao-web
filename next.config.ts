import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The external volume creates AppleDouble metadata that corrupts Turbopack's disk cache.
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
