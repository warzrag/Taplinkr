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

        {/* 🔥 REDIRECTION INSTANTANÉE - S'exécute AVANT React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var ua = navigator.userAgent || '';
                  var isInApp = ua.indexOf('Instagram') > -1 || ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1 || ua.indexOf('TikTok') > -1;

                  if (!isInApp) return;

                  var isIOS = /iPad|iPhone|iPod/.test(ua);
                  var isAndroid = /Android/.test(ua);
                  var url = window.location.href;

                  console.log('🚨 In-app browser detected');

                  setTimeout(function() {
                    if (isIOS) {
                      console.log('🍎 Redirecting to Safari');
                      window.location.href = 'x-safari-https://' + url.replace(/^https?:\\/\\//, '');
                    } else if (isAndroid) {
                      console.log('🤖 Redirecting to Chrome');
                      var host = url.replace(/^https?:\\/\\//, '').replace(/\\/$/, '');
                      window.location.href = 'intent://' + host + '#Intent;scheme=https;action=android.intent.action.VIEW;end';
                    }
                  }, 500);
                } catch(e) {
                  console.error('Redirect error:', e);
                }
              })();
            `
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
