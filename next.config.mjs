/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['rankforge-front.vercel.app'],
  },
  output: 'standalone',
  // Increase timeout for API routes
  serverRuntimeConfig: {
    maxDuration: 60,
  },
};

export default nextConfig;
