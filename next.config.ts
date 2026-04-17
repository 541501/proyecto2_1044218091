import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    strictNullChecks: true,
    strict: true,
  },
  images: {
    unoptimized: true, // Para Vercel serverless
  },
  serverExternalPackages: ["bcryptjs"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          path: false,
          crypto: false,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
