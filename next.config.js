/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // Optimisations extrêmes pour WSL
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Configuration optimisée pour WSL
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
        aggregateTimeout: 600,
        poll: 2000
      }
      // Désactiver les optimisations coûteuses
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        minimize: false,
        concatenateModules: false,
        usedExports: false,
        providedExports: false,
        sideEffects: false,
      }
      // Garder le devtool par défaut pour éviter les problèmes de performance
      // config.devtool = 'cheap-module-source-map'
    }
    return config
  },
  // Optimisations supplémentaires
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // experimental: {
  //   optimizeCss: false,
  //   turbotrace: false,
  // },
  poweredByHeader: false,
  compress: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.taplinkr.com',
          },
        ],
        destination: 'https://taplinkr.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig