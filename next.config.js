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
  // Optimisations images
  images: {
    domains: ['dkwgorynhgnmldzbhhrb.supabase.co'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig