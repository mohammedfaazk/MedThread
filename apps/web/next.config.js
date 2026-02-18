/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@medthread/ui', '@medthread/types'],
  experimental: {
    optimizePackageImports: ['@medthread/ui']
  },
  // PWA Configuration
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/manifest+json',
        },
      ],
    },
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
