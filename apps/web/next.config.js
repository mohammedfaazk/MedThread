/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@medthread/ui', '@medthread/database', '@medthread/types'],
  webpack: (config, { isServer }) => {
    // Handle leaflet on client side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // Disable static optimization for dynamic pages
  experimental: {
    optimizeCss: false,
  },
  // Increase timeout for static generation (default is 60s)
  staticPageGenerationTimeout: 180,
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
