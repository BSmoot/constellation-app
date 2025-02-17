import { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  experimental: {
    turbo: {
      rules: {
        // Add any specific Turbopack rules here
      }
    }
  }
};

export default nextConfig;