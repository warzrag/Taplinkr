import Providers from '@/components/Providers'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import DebugConsole from '@/components/DebugConsole'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'
import '../styles/theme-transitions.css'

export const metadata = {
  title: 'TapLinkr - Tap Into Your Digital World',
  description: 'Create a beautiful mobile-first bio page to share all your social links with just one tap',
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
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/final.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TapLinkr" />
      </head>
      <body className="h-full bg-gray-50 dark:bg-gray-900 antialiased transition-colors duration-300">
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
          <DebugConsole />
        </ErrorBoundary>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}