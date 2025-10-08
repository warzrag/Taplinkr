import { Inter } from 'next/font/google'

// Une seule font optimisée pour les pages publiques
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        {/* Préconnexion Supabase pour images */}
        <link rel="preconnect" href="https://dkwgorynhgnmldzbhhrb.supabase.co" />
        <link rel="dns-prefetch" href="https://dkwgorynhgnmldzbhhrb.supabase.co" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
