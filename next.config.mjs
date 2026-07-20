/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['rankforge-front.vercel.app'],
  },
  output: 'standalone',
};

export default nextConfig;
