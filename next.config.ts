import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
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
