import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Headers de performance et sécurité
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Cache intelligent selon le type de route
  if (pathname.startsWith('/_next/static')) {
    // Assets statiques - cache long immutable
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|woff2)$/)) {
    // Images et fonts - cache long
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // Pages dashboard/admin - pas de cache
    response.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
  } else if (pathname.startsWith('/')) {
    // Pages publiques - cache court
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  }

  // Ignorer les routes API, static files et les routes Next.js
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/debug') ||
    pathname.startsWith('/link/') ||
    pathname.startsWith('/redirect/') ||
    pathname.startsWith('/shield/') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/teams/') ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname === '/favicon.ico'
  ) {
    return response
  }

  // 🔥 SMART REDIRECT: Détecter les navigateurs in-app et forcer l'ouverture externe
  const userAgent = request.headers.get('user-agent') || ''
  const isInstagram = userAgent.includes('Instagram')
  const isFacebook = userAgent.includes('FBAN') || userAgent.includes('FBAV')
  const isTikTok = userAgent.includes('TikTok') || userAgent.includes('musical_ly')
  const isInAppBrowser = isInstagram || isFacebook || isTikTok

  // Vérifier si on a déjà essayé de rediriger (éviter la boucle infinie)
  const redirectAttempted = request.nextUrl.searchParams.get('_openedExternal')

  // Si c'est un navigateur in-app ET qu'on n'a pas encore essayé de rediriger
  if (isInAppBrowser && pathname.length > 1 && !redirectAttempted) {
    // 🚀 REDIRECTION INSTANTANÉE : Renvoyer une page HTML ultra-légère
    // Détection de plateforme
    const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')
    const isAndroid = userAgent.includes('Android')

    const currentUrl = `https://${request.headers.get('host')}${pathname}`

    // Page HTML minimale avec script inline pour redirection instantanée
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Redirection...</title>
  <style>
    body{margin:0;padding:0;background:#111;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .loader{text-align:center}
    .spinner{width:40px;height:40px;margin:0 auto 20px;border:4px solid #333;border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Redirection vers votre navigateur...</p>
  </div>
  <script>
    (function() {
      const isIOS = ${isIOS};
      const isAndroid = ${isAndroid};
      const currentUrl = '${currentUrl}';

      if (isIOS) {
        const safariUrl = 'x-safari-https://' + currentUrl.replace(/^https?:\\/\\//, '');
        console.log('🍎 iOS - Redirection Safari');
        window.location.href = safariUrl;
      } else if (isAndroid) {
        const host = currentUrl.replace(/^https?:\\/\\//, '').replace(/\\/$/, '');
        const intentUrl = 'intent://' + host + '#Intent;scheme=https;action=android.intent.action.VIEW;end';
        console.log('🤖 Android - Redirection Chrome');
        window.location.href = intentUrl;
      } else {
        // Fallback: charger la vraie page
        window.location.href = currentUrl + '?_openedExternal=1';
      }
    })();
  </script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, must-revalidate'
      }
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth pages)
     * - dashboard (dashboard pages)
     * - admin (admin pages)
     * - debug (debug pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|dashboard|admin|debug).*)',
  ],
}