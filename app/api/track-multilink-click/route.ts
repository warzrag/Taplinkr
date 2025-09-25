import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocationFromIP } from '@/lib/geo-location-helper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { multiLinkId, screenResolution, language, timezone } = body

    if (!multiLinkId) {
      return NextResponse.json({ error: 'multiLinkId requis' }, { status: 400 })
    }

    // Vérifier que le MultiLink existe et récupérer le lien parent
    const multiLink = await prisma.multiLink.findUnique({
      where: { id: multiLinkId },
      include: {
        link: true
      }
    })

    if (!multiLink) {
      return NextResponse.json({ error: 'MultiLink non trouvé' }, { status: 404 })
    }

    // Récupérer les informations de la requête
    const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Détection simple du device
    const device = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                  userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop'

    // Récupérer la géolocalisation
    const ipAddress = ip.toString().split(',')[0].trim()
    let locationData
    try {
      locationData = await getLocationFromIP(ipAddress)
    } catch (error) {
      console.log('Erreur géolocalisation:', error)
      locationData = { country: 'Unknown' }
    }

    // Extraire browser et OS
    const browser = extractBrowser(userAgent)
    const os = extractOS(userAgent)

    // Créer un enregistrement dans la table Click
    await prisma.click.create({
      data: {
        linkId: multiLink.linkId,
        userId: multiLink.link.userId,
        ip: ipAddress,
        userAgent,
        referer,
        device,
        browser,
        os,
        screenResolution: screenResolution || null,
        language: language || null,
        timezone: timezone || null,
        country: locationData.country,
        city: locationData.city || null,
        region: locationData.region || null,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        multiLinkId: multiLinkId
      }
    })

    // Incrémenter le compteur de clics du MultiLink
    await prisma.multiLink.update({
      where: { id: multiLinkId },
      data: {
        clicks: {
          increment: 1
        }
      }
    })

    // Ne pas incrémenter le compteur du lien principal
    // Les clics sont comptés uniquement lors des visites de page

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic MultiLink:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
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