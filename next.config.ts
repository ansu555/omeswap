import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (cfg) => {
    cfg.resolve.fallback = {
      ...(cfg.resolve.fallback || {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return cfg;
  },
};

export default config;
