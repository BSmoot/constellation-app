import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep existing webpack config for database compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        pg: false,
        'pg-native': false
      };
    }
    return config;
  },

  // Update experimental config
  experimental: {
    // Remove turbo as it's no longer needed in latest Next.js
    serverActions: true,
    typedRoutes: true
  },

  // Add these recommended settings
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,

  // Handle keyboard listener issue
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

export default nextConfig;