import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/lib/analytics-service'
import { getGeoData, parseUserAgent } from '@/lib/geo-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Récupérer le lien par son slug
    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    // Si le lien n'existe pas ou n'est pas actif
    if (!link || !link.isActive) {
      return NextResponse.redirect(new URL('/404', request.url))
    }
    
    // Enregistrer le clic avec des données complètes
    try {
      // Obtenir l'IP et les données géographiques
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                request.headers.get('x-real-ip') || 
                'unknown'
      const userAgent = request.headers.get('user-agent') || 'Unknown'
      const referer = request.headers.get('referer') || 'direct'
      
      // Parser les informations de l'appareil
      const deviceInfo = parseUserAgent(userAgent)
      
      // Obtenir les données géographiques
      const geoData = await getGeoData(ip)
      
      // Enregistrer le clic dans la table Click
      await prisma.click.create({
        data: {
          linkId: link.id,
          userId: link.userId,
          country: geoData.country || 'Unknown',
          device: deviceInfo.deviceType,
          referer: referer,
          userAgent: userAgent,
          ip: ip
        }
      })
      
      // Utiliser le service analytics pour un tracking plus détaillé
      await analyticsService.trackEvent({
        linkId: link.id,
        userId: link.userId,
        eventType: 'click',
        request: {
          ip,
          userAgent,
          referer,
          url: request.url
        }
      })
      
      // Incrémenter le compteur de clics
      await prisma.link.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } }
      })
    } catch (error) {
      console.error('Error tracking click:', error)
      // Continue même si le tracking échoue
    }
    
    // Si c'est un lien direct
    if (link.isDirect && link.directUrl) {
      // Si Shield ou ULTRA LINK est activé, rediriger vers la page intermédiaire
      if (link.shieldEnabled || link.isUltraLink) {
        return NextResponse.redirect(new URL(`/shield/${slug}`, request.url))
      }
      
      // Sinon, rediriger directement vers l'URL cible
      return NextResponse.redirect(link.directUrl)
    }
    
    // Pour tous les multi-links, rediriger vers la page de preview
    return NextResponse.redirect(new URL(`/link/${slug}`, request.url))
    
  } catch (error) {
    console.error('Error in redirect handler:', error)
    return NextResponse.redirect(new URL('/404', request.url))
  }
}