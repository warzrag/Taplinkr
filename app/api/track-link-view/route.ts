import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/lib/analytics-service'
import { getLocationFromIP } from '@/lib/geo-location-helper'

export async function POST(request: NextRequest) {
  try {
    const { linkId, referrer, userAgent, screenResolution, language, timezone } = await request.json()
    
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

    // Incrémenter les vues ET les clics
    // Chaque visite de page = 1 vue + 1 clic
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        views: { increment: 1 },
        clicks: { increment: 1 }
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

    // Extraire browser et OS du userAgent
    const browser = extractBrowser(userAgent)
    const os = extractOS(userAgent)

    // Créer aussi un enregistrement dans la table Click pour la page visiteurs
    const clickRecord = await prisma.click.create({
      data: {
        linkId,
        userId: link.userId,
        ip: ipAddress,
        userAgent: userAgent || '',
        referer: referrer || '',
        device,
        browser,
        os,
        screenResolution,
        language,
        timezone,
        country: locationData.country,
        city: locationData.city || null,
        region: locationData.region || null,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null
      }
    })

    // Retourner la réponse avec les compteurs mis à jour et le clickId
    return NextResponse.json({ 
      success: true,
      views: updatedLink.views,
      clicks: updatedLink.clicks,
      clickId: clickRecord.id
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

// Fonctions d'extraction du navigateur et OS
function extractBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown'
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Chromium') && !userAgent.includes('Edg')) {
    return 'Chrome'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari'
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox'
  } else if (userAgent.includes('Edg')) {
    return 'Edge'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return 'Opera'
  }
  return 'Other'
}

function extractOS(userAgent: string): string {
  if (!userAgent) return 'Unknown'
  
  if (userAgent.includes('Windows')) {
    return 'Windows'
  } else if (userAgent.includes('Mac OS X')) {
    return 'macOS'
  } else if (userAgent.includes('Linux')) {
    return 'Linux'
  } else if (userAgent.includes('Android')) {
    return 'Android'
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'iOS'
  }
  return 'Other'
}