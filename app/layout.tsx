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
  title: { default: 'TapLinkr — One link that converts', template: '%s | TapLinkr' },
  description: 'Create a polished mobile page, share your most important links, and track clicks from one simple dashboard.',
  openGraph: {
    title: 'TapLinkr — One link that converts',
    description: 'Create a polished page for your content, offers, and social profiles.',
    url: '/',
    siteName: 'TapLinkr',
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'TapLinkr — One link that converts', description: 'Create a polished page for all your links.' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TapLinkr'
  },
  icons: {
    icon: '/final.png',
    shortcut: '/final.png',
    apple: '/taplinkr-apple-touch.png'
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
    <html lang="en-US" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/taplinkr-apple-touch.png" />
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
      </body>
    </html>
  )
}
