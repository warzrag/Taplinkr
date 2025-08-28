import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/lib/analytics-service'
import { getLocationFromIP } from '@/lib/geo-location-helper'

export async function POST(request: NextRequest) {
  try {
    const { linkId, referrer, userAgent } = await request.json()
    
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    // Récupérer l'IP du visiteur
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Vérifier si le lien existe et récupérer l'userId
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { 
        id: true, 
        userId: true,
        views: true,
        isDirect: true
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // On ne compte les vues que pour les liens directs (pas pour les multi-liens)
    // Car les multi-liens ont leur propre tracking
    if (link.isDirect) {
      return NextResponse.json({ 
        success: true, 
        message: 'View tracking skipped for direct link',
        views: link.views 
      })
    }

    // Incrémenter le compteur de clics (c'est ce qui est affiché dans le dashboard)
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: { 
        clicks: { increment: 1 },  // Incrémenter les clics
        views: { increment: 1 }     // Et aussi les vues pour garder les stats complètes
      },
      select: { views: true, clicks: true }
    })

    // Enregistrer l'événement dans le service analytics
    await analyticsService.trackEvent({
      linkId,
      userId: link.userId,
      eventType: 'view',
      request: {
        ip,
        referer: referrer,
        userAgent,
        url: request.url
      }
    })

    // Détection simple du device
    const device = userAgent?.toLowerCase().includes('mobile') ? 'mobile' : 
                  userAgent?.toLowerCase().includes('tablet') ? 'tablet' : 'desktop'

    // Récupérer la géolocalisation
    const ipAddress = ip.toString().split(',')[0].trim()
    let locationData
    try {
      locationData = await getLocationFromIP(ipAddress)
    } catch (error) {
      console.log('Erreur géolocalisation:', error)
      locationData = { country: 'Unknown' }
    }

    // Créer aussi un enregistrement dans la table Click pour la page visiteurs
    await prisma.click.create({
      data: {
        linkId,
        userId: link.userId,
        ip: ipAddress,
        userAgent: userAgent || '',
        referer: referrer || '',
        device,
        country: locationData.country,
        city: locationData.city || null,
        region: locationData.region || null
      }
    })

    // Retourner la réponse avec les compteurs mis à jour
    return NextResponse.json({ 
      success: true,
      views: updatedLink.views,
      clicks: updatedLink.clicks
    })

  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Endpoint GET pour récupérer le nombre de vues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { views: true, clicks: true }
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      views: link.views,
      clicks: link.clicks
    })
    
  } catch (error) {
    console.error('Error fetching views:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}