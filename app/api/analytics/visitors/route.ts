import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLocationFromIP } from '@/lib/geo-location-helper'
import { parseUserAgent, parseReferer } from '@/lib/geo-service'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const device = searchParams.get('device') || 'all'
    const offset = (page - 1) * limit

    // Récupérer tous les liens de l'utilisateur
    const userLinks = await prisma.link.findMany({
      where: { userId: session.user.id },
      select: { id: true, slug: true, title: true }
    })

    const linkIds = userLinks.map(link => link.id)
    
    // Créer un map pour accès rapide aux infos des liens
    const linkMap = new Map(userLinks.map(link => [link.id, link]))

    // Construire les conditions de filtre
    const whereConditions: any = {
      linkId: { in: linkIds },
      eventType: 'click'
    }

    if (device !== 'all') {
      if (device === 'mobile') {
        whereConditions.OR = [
          { metadata: { path: ['device', 'type'], equals: 'mobile' } },
          { metadata: { path: ['device', 'type'], equals: 'tablet' } }
        ]
      } else if (device === 'desktop') {
        whereConditions.metadata = { path: ['device', 'type'], equals: 'desktop' }
      }
    }

    // Récupérer les événements
    const [events, total] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          userAgent: true,
          ip: true,
          referrer: true,
          metadata: true,
          linkId: true
        }
      }),
      prisma.analyticsEvent.count({
        where: whereConditions
      })
    ])

    // Transformer les événements en format visiteur
    const visitors = await Promise.all(events.map(async (event) => {
      const link = linkMap.get(event.linkId)
      const parsedUA = parseUserAgent(event.userAgent || '')
      const location = await getLocationFromIP(event.ip || '')
      const parsedReferrer = parseReferer(event.referrer)
      
      // Déterminer le type d'appareil
      let deviceName = 'Desktop Computer'
      
      if (parsedUA.deviceType === 'mobile') {
        deviceName = 'Mobile Phone'
      } else if (parsedUA.deviceType === 'tablet') {
        deviceName = 'Tablet'
      }

      // Déterminer le statut (toujours success pour l'instant)
      let status: 'success' | 'blocked' | 'bot' = 'success'

      return {
        id: event.id,
        timestamp: event.createdAt.toISOString(),
        location: {
          city: location.city || 'N/A',
          region: location.region || 'N/A',
          country: location.country || 'Unknown',
          countryCode: location.countryCode || 'XX'
        },
        linkSlug: link?.slug || 'unknown',
        linkTitle: link?.title || 'Lien supprimé',
        browser: parsedUA.browser || 'Unknown Browser',
        os: parsedUA.os || 'Unknown OS',
        referrer: event.referrer || '',
        referrerDomain: parsedReferrer.source,
        device: deviceName,
        deviceType: parsedUA.deviceType,
        status: status,
        ip: event.ip || '',
        userAgent: event.userAgent || ''
      }
    }))

    return NextResponse.json({
      visitors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des visiteurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des visiteurs' },
      { status: 500 }
    )
  }
}