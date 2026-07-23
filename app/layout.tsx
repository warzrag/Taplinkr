import Providers from '@/components/Providers'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import { WebVitals } from '@/components/WebVitals'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import '../styles/theme-transitions.css'
import './performance-optimizations.css'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taplinkr.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'TapLinkr — Un seul lien qui convertit', template: '%s | TapLinkr' },
  description: 'Cr\u00e9ez une page mobile propre, partagez vos liens importants et suivez vos clics depuis un dashboard simple.',
  openGraph: {
    title: 'TapLinkr — Un seul lien qui convertit',
    description: 'Créez une page élégante pour vos contenus, vos offres et vos réseaux.',
    url: '/',
    siteName: 'TapLinkr',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'TapLinkr — Un seul lien qui convertit', description: 'Créez une page élégante pour tous vos liens.' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TapLinkr'
  },
  icons: {
    icon: '/final.png',
    shortcut: '/final.png',
    apple: '/final.png'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/final.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TapLinkr" />


        {/* Préchargement des routes critiques */}
        <link rel="prefetch" href="/dashboard" as="document" />
        <link rel="prefetch" href="/dashboard/links" as="document" />
        <link rel="prefetch" href="/dashboard/analytics" as="document" />
      </head>
      <body className="h-full bg-gray-50 dark:bg-gray-900 antialiased transition-colors duration-300">
        <WebVitals />
        <ErrorBoundary>
          <ThemeProvider>
            <Providers>
              {children}
              <Toaster
              position="top-right"
              toastOptions={{
                className: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100',
                duration: 4000,
              }}
            />
            </Providers>
          </ThemeProvider>
        </ErrorBoundary>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
