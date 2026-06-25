import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "purrquinox.com" },
      { protocol: "https", hostname: "*.purrquinox.com" },
    ],
  },
};

export default nextConfig;
