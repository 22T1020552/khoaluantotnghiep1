import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
=======
  // Add an empty turbopack config to avoid Turbopack/webpack conflict error
  turbopack: {},
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
