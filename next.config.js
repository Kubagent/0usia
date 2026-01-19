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
  
  // Static export for Cloudflare Pages (disabled for API testing)
  // output: 'export',
  trailingSlash: true,
  
  // Security headers and caching
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://app.cal.com https://app.cal.eu; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://app.cal.com https://app.cal.eu; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self'; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://app.cal.com https://app.cal.eu; frame-src https://app.cal.com https://app.cal.eu; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Aggressive caching for venture logos
      {
        source: '/venture-logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year cache
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // General image caching
      {
        source: '/:path*.(png|jpg|jpeg|gif|svg|webp|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate', // 24 hours with revalidation
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
