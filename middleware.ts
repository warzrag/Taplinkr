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
    const currentUrl = request.nextUrl.clone()
    const targetUrl = currentUrl.toString()

    // Retourner une page HTML minimaliste qui force l'ouverture externe
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirection...</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      text-align: center;
      color: white;
      width: 100%;
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      font-size: 28px;
      margin: 0 0 12px;
      font-weight: 600;
    }
    p {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    .btn {
      display: block;
      width: 100%;
      background: white;
      color: #667eea;
      border: none;
      padding: 18px 32px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 16px;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-decoration: none;
      margin-bottom: 16px;
    }
    .btn:active {
      transform: scale(0.98);
    }
    .small-text {
      font-size: 13px;
      opacity: 0.7;
      margin-top: 20px;
    }
  </style>
  <script>
    function openInBrowser() {
      const targetUrl = "${targetUrl}";
      const urlWithParam = targetUrl + (targetUrl.includes('?') ? '&' : '?') + '_openedExternal=1';
      window.location.href = urlWithParam;
    }
  </script>
</head>
<body>
  <div class="container">
    <div class="icon">🚀</div>
    <h1>Ouvre dans ton navigateur</h1>
    <p>Pour accéder à ce contenu, ouvre cette page dans Safari ou Chrome</p>
    <a href="${targetUrl}?_openedExternal=1" class="btn" target="_blank" rel="noopener noreferrer">
      Ouvrir dans Safari
    </a>
    <p class="small-text">Appuie sur le bouton ci-dessus pour continuer</p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  }

  // Extraire le slug/username depuis l'URL
  const slug = pathname.slice(1)

  if (slug && slug.length > 0) {
    return response
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