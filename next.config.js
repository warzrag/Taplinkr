/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/webp'], // Seulement WebP pour vitesse maximale
    deviceSizes: [640, 750, 828], // Réduire nombre de tailles
    imageSizes: [32, 64, 96], // Réduire nombre de tailles
    minimumCacheTTL: 3600, // Cache long pour performance
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
  async headers() {
    const scriptPolicy = process.env.NODE_ENV === 'development'
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
      : "script-src 'self' 'unsafe-inline' https://js.stripe.com"
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Content-Security-Policy', value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; ${scriptPolicy}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.googleapis.com https://*.firebaseio.com https://*.vercel-storage.com; frame-src https://js.stripe.com https://hooks.stripe.com${process.env.NODE_ENV === 'production' ? '; upgrade-insecure-requests' : ''}` },
    ]
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }] },
    ]
  },
}

module.exports = nextConfig
