/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@medthread/ui', '@medthread/types'],
  experimental: {
    optimizePackageImports: ['@medthread/ui']
  }
}

module.exports = nextConfig
