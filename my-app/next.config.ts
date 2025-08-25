import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['@prisma/client'],
    turbo: {
      resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.optimization.usedExports = true;
      return config;
    },
  }),
};

export default nextConfig;
