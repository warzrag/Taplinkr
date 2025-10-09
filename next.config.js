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
    } else {
      // Production: minification maximale
      config.optimization = {
        ...config.optimization,
        minimize: true,
        usedExports: true,
        sideEffects: true,
      }
    }
    return config
  },
  // Optimisations images
  images: {
    domains: ['dkwgorynhgnmldzbhhrb.supabase.co'],
    formats: ['image/webp'], // Seulement WebP pour vitesse maximale
    deviceSizes: [640, 750, 828], // Réduire nombre de tailles
    imageSizes: [32, 64, 96], // Réduire nombre de tailles
    minimumCacheTTL: 3600, // Cache long pour performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
  // Optimisations production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig