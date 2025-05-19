// next.config.ts
import { type NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    // Prevent bundling Node built-ins in client code
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
