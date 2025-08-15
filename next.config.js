/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds to avoid blocking
  eslint: {
    ignoreDuringBuilds: true,
  },
  // App Router is now stable in Next.js 13.4+
  experimental: {
    // Temporarily disabled due to critters module issue
    // optimizeCss: true,
    optimizePackageImports: ['framer-motion'],
  },

  // Server optimizations
  serverExternalPackages: [],

  // Image optimization - disabled for static export
  images: {
    unoptimized: true,
    domains: ['notion.so'],
  },

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,
  
  // Compression
  compress: true,
  
  // Optimize build output
  productionBrowserSourceMaps: false,
  
  // Keep server-side rendering for API routes
  // output: 'export', // Disabled because we have API routes
  
  // Cloudflare Pages compatibility
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration with cache disabling for production
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Disable caching in production builds for Cloudflare Pages
      config.cache = false;
    }
    
    // Bundle analyzer configuration
    if (process.env.ANALYZE === 'true') {
      config.resolve.fallback = { fs: false, path: false };
    }
    
    return config;
  },
};

module.exports = nextConfig;
