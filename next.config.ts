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
  
  // Turbopack configuration (optional, can be removed if not needed)
  turbopack: {
    resolveAlias: {},
  },
  
  // REMOVED: outputFileTracingRoot - this was causing the build error
  // If you need this for monorepo, use relative path like:
  // outputFileTracingRoot: path.join(__dirname, '../'),
};

export default nextConfig;