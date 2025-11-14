/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
};

module.exports = nextConfig;
