/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['socket.io', 'socket.io-client']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      }
    }
    return config
  }
}

module.exports = nextConfig
