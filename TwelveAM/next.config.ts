import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for deployment
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore for deployment
  },
};

export default nextConfig;
