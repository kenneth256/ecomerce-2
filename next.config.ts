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
        destination: 'https://ugmartbacked-2.onrender.com/api/:path*',  // ✅ Added /api
      },
    ];
  },
  
  // Turbopack configuration (optional, can be removed if not needed)
  turbopack: {
    resolveAlias: {},
  },
};

export default nextConfig;
// ```

// ## The Difference:

// **Before (WRONG):**
// ```
// Frontend calls: /api/products/products
// Rewrites to: https://ugmartbacked-2.onrender.com/products/products  ❌
// Backend expects: https://ugmartbacked-2.onrender.com/api/products/products
// ```

// **After (CORRECT):**
// ```
// Frontend calls: /api/products/products
// Rewrites to: https://ugmartbacked-2.onrender.com/api/products/products  ✅
// Backend receives: Correct path!

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});