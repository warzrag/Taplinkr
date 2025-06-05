import Providers from '@/components/Providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata = {
  title: 'GetAllMyLinks - Create Your Link Page',
  description: 'Create and manage your personalized link page with analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 antialiased">
        <Providers session={null}>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-white border border-gray-200 text-gray-900',
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  )
}