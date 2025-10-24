// ...existing code...
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false;
    }
    return config;
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

 
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ugmartbacked-2.onrender.com/:path*',
      },
    ];
  },
  
  // ✅ Move turbo config here (remove from experimental)
  turbopack: {
    resolveAlias: {},
  },
  
  // ✅ Set workspace root to silence lockfile warning
  outputFileTracingRoot: '/Users/extremesales/project1',
};

export default nextConfig;
// ...existing code...