import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Détection des bots par User-Agent
  const userAgent = request.headers.get('user-agent') || ''
  const botPatterns = [
    'bot', 'crawl', 'spider', 'scrape', 'facebookexternalhit',
    'whatsapp', 'telegram', 'twitter', 'pinterest', 'linkedin',
    'instagram', 'meta', 'facebook', 'tiktok'
  ]
  
  const isBot = botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  )

  // Headers de sécurité ultra-stricts
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Protection CSP pour empêcher l'exécution de scripts externes
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
  )
  
  // Pour les pages de landing
  if (request.nextUrl.pathname.startsWith('/l/')) {
    // Anti-cache complet
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    // Si c'est un bot, on peut retourner une page 404 ou une page neutre
    if (isBot) {
      // Log pour debug
      console.log('Bot detected:', userAgent)
      
      // Optionnel : retourner une page différente pour les bots
      // return NextResponse.rewrite(new URL('/bot-page', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/l/:path*']
}