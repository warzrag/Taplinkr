import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocationFromIP } from '@/lib/geo-location-helper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { multiLinkId, sessionId, screenResolution, language, timezone } = body

    if (!multiLinkId) {
      return NextResponse.json({ error: 'multiLinkId requis' }, { status: 400 })
    }

    // Récupérer les informations de la requête
    const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // 🤖 BOT DETECTION (GetMySocial style)
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper',
      'curl', 'wget', 'python-requests', 'http',
      'axios', 'fetch', 'postman'
    ]
    const isBot = botPatterns.some(pattern =>
      userAgent.toLowerCase().includes(pattern)
    )

    if (isBot) {
      console.log('🤖 Bot détecté, clic ignoré:', userAgent)
      return NextResponse.json({
        success: true,
        counted: false,
        reason: 'bot_detected'
      })
    }

    // ⚡ RATE LIMITING (GetMySocial style - max 10 clics/minute par IP)
    const ipAddress = ip.toString().split(',')[0].trim()
    const oneMinuteAgo = new Date(Date.now() - 60000)

    const recentClicks = await prisma.click.count({
      where: {
        ip: ipAddress,
        createdAt: { gte: oneMinuteAgo }
      }
    })

    if (recentClicks >= 10) {
      console.log('🚫 Rate limit dépassé:', ipAddress, '- Clics:', recentClicks)
      return NextResponse.json({
        error: 'Trop de clics. Réessayez dans 1 minute.'
      }, { status: 429 })
    }

    // Vérifier que le MultiLink existe et récupérer le lien parent
    const multiLink = await prisma.multiLink.findUnique({
      where: { id: multiLinkId },
      include: {
        parentLink: true
      }
    })

    if (!multiLink) {
      return NextResponse.json({ error: 'MultiLink non trouvé' }, { status: 404 })
    }

    // 🔥 DÉDUPLICATION PAR SESSION (comme GetMySocial avec timeout 30 min)
    // Vérifier si ce sessionId a déjà cliqué sur ce lien
    let isDuplicate = false
    if (sessionId) {
      const existingClick = await prisma.click.findFirst({
        where: {
          multiLinkId: multiLinkId,
          sessionId: sessionId
        }
      })

      if (existingClick) {
        isDuplicate = true
        console.log('🔄 Clic dupliqué détecté - Session:', sessionId, 'Link:', multiLinkId)
      }
    }

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

    // Créer un enregistrement dans la table Click (même si dupliqué, pour analytics)
    await prisma.click.create({
      data: {
        linkId: multiLink.parentLinkId,
        userId: multiLink.parentLink.userId,
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
        multiLinkId: multiLinkId,
        sessionId: sessionId || null // 🔥 Stocker le sessionId
      }
    })

    // 🔥 Incrémenter le compteur UNIQUEMENT si ce n'est PAS un duplicate
    if (!isDuplicate) {
      await prisma.multiLink.update({
        where: { id: multiLinkId },
        data: {
          clicks: {
            increment: 1
          }
        }
      })
      console.log('✅ Clic unique comptabilisé - Session:', sessionId, 'Link:', multiLinkId)
    } else {
      console.log('⏭️ Clic dupliqué ignoré dans le compteur - Session:', sessionId, 'Link:', multiLinkId)
    }

    // Ne pas incrémenter le compteur du lien principal
    // Les clics sont comptés uniquement lors des visites de page

    return NextResponse.json({ success: true, isDuplicate })
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