/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@buzz8n/ui'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
