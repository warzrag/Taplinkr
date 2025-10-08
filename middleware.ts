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
  <title>TapLinkr Shield</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #000;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .shield-header {
      text-align: center;
      padding: 30px 20px 20px;
      background: linear-gradient(180deg, #1a1a1a 0%, #000 100%);
    }
    .shield-icon {
      font-size: 60px;
      margin-bottom: 15px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .shield-title {
      color: #fff;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .shield-subtitle {
      color: #888;
      font-size: 14px;
    }
    .main-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .btn-container {
      width: 100%;
      max-width: 500px;
    }
    .btn {
      display: block;
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 24px 40px;
      font-size: 20px;
      font-weight: 700;
      border-radius: 20px;
      cursor: pointer;
      box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
      text-decoration: none;
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: transform 0.1s;
    }
    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s;
    }
    .btn:hover::before {
      left: 100%;
    }
    .btn:active {
      transform: scale(0.98);
    }
    .btn-icon {
      font-size: 24px;
      margin-right: 10px;
      vertical-align: middle;
    }
    .secure-badge {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
    .secure-badge span {
      color: #4CAF50;
      font-weight: 600;
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
  <div class="shield-header">
    <div class="shield-icon">🛡️</div>
    <div class="shield-title">Protection activée</div>
    <div class="shield-subtitle">Redirection sécurisée en cours...</div>
  </div>

  <div class="main-action">
    <div class="btn-container">
      <a href="${targetUrl}?_openedExternal=1" class="btn" target="_blank" rel="noopener noreferrer">
        <span class="btn-icon">🚀</span>
        Continuer
      </a>
    </div>
  </div>

  <div class="secure-badge">
    <span>✓</span> Connexion sécurisée via TapLinkr Shield
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