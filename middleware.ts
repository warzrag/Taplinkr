import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hiddenPublicRoutes = [
    '/admin-login',
    '/debug',
    '/diagnostic',
    '/emergency-data',
    '/emergency-links',
    '/emergency-reset',
    '/system-check',
    '/test',
    '/test-config',
    '/test-login',
    '/test-slug',
  ]
  const hiddenApiRoutes = [
    '/api/auth-debug',
    '/api/test',
    '/api/test-auth',
    '/api/test-db',
    '/api/test-email',
    '/api/test-geo',
    '/api/test-login',
    '/api/test-register',
    '/api/test-route',
    '/api/links/test',
    '/api/teams/test',
    '/api/analytics/test-simple',
  ]

  if (
    process.env.NODE_ENV === 'production' &&
    [...hiddenPublicRoutes, ...hiddenApiRoutes].some((route) => pathname === route || pathname.startsWith(`${route}/`))
  ) {
    return new NextResponse('Not found', { status: 404 })
  }

  const response = NextResponse.next()

  // Headers de performance et sécurité
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Cache intelligent selon le type de route
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  } else if (pathname.startsWith('/_next/static')) {
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
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
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

  // 🔥 SMART REDIRECT: Désactivé pour permettre l'affichage de la page avant redirection
  // La redirection se fait côté client après 500ms pour montrer la belle page publique
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth pages)
     * - dashboard (dashboard pages)
     * - admin (admin pages)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
