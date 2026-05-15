import Providers from '@/components/Providers'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import DebugConsole from '@/components/DebugConsole'
import ErrorBoundary from '@/components/ErrorBoundary'
import { WebVitals } from '@/components/WebVitals'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import '../styles/theme-transitions.css'
import './performance-optimizations.css'

// Optimisation fonts avec next/font - 0 layout shift
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})

export const metadata = {
  title: 'TapLinkr - Pages de liens rapides et analytics claires',
  description: 'Cr\u00e9ez une page mobile propre, partagez vos liens importants et suivez vos clics depuis un dashboard simple.',
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`h-full ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/final.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TapLinkr" />


        {/* Préchargement des routes critiques */}
        <link rel="prefetch" href="/dashboard" as="document" />
        <link rel="prefetch" href="/dashboard/links" as="document" />
        <link rel="prefetch" href="/dashboard/visitors" as="document" />
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
          {process.env.NODE_ENV === 'development' && <DebugConsole />}
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
