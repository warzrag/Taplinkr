import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const hostname = forwardedHost.split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '')
  const isPlatformHostname =
    !hostname ||
    hostname === 'taplinkr.com' ||
    hostname === 'www.taplinkr.com' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app')

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
    '/api/test-clicks',
    '/api/test-create',
    '/api/links/test',
    '/api/teams/test',
    '/api/analytics/test-simple',
    '/api/check-auth',
    '/api/check-clicks',
    '/api/check-db',
    '/api/check-links',
    '/api/check-my-links',
    '/api/force-add-clicks',
    '/api/links-temp-fix',
    '/api/migrate',
    '/api/sync-user-links',
  ]

  if (
    process.env.NODE_ENV === 'production' &&
    [...hiddenPublicRoutes, ...hiddenApiRoutes].some((route) => pathname === route || pathname.startsWith(`${route}/`))
  ) {
    return new NextResponse('Not found', { status: 404 })
  }

  // A verified customer domain serves its selected Taplinkr destination at
  // the domain root. Resolution stays server-side so domain ownership cannot
  // be spoofed through a query parameter or client-side redirect.
  if (!isPlatformHostname && pathname === '/') {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = `/custom-domain/${encodeURIComponent(hostname)}`
    const rewrite = NextResponse.rewrite(rewriteUrl)
    rewrite.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
    rewrite.headers.set('X-Frame-Options', 'SAMEORIGIN')
    rewrite.headers.set('X-Content-Type-Options', 'nosniff')
    return rewrite
  }

  const response = NextResponse.next()

  // Headers de performance et sécurité
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Cache intelligent selon le type de route
  if (pathname === '/sw.js') {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
    response.headers.set('Clear-Site-Data', '"cache"')
  } else if (pathname === '/api/health') {
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
  } else if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  } else if (pathname.startsWith('/_next/static')) {
    // Assets statiques - cache long immutable
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|woff2)$/)) {
    // Images et fonts - cache long
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/teams')
  ) {
    // Pages dashboard/admin - pas de cache
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  } else if (pathname.startsWith('/')) {
    // A public URL can be a page or a direct link. Its response depends on the
    // calling browser, so it must never be reused for another request.
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
    response.headers.set('Vary', 'User-Agent, Referer')
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
