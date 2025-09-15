import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    return NextResponse.next()
  }

  // Extraire le slug/username depuis l'URL
  const slug = pathname.slice(1) // Enlever le / au début

  if (slug && slug.length > 0) {
    // Ne rien faire, laisser Next.js router vers /[slug]
    return NextResponse.next()
  }

  return NextResponse.next()
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