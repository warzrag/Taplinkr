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
      linkId: { in: linkIds }
    }

    if (device !== 'all') {
      if (device === 'mobile') {
        whereConditions.OR = [
          { device: 'mobile' },
          { device: 'tablet' }
        ]
      } else if (device === 'desktop') {
        whereConditions.device = 'desktop'
      }
    }

    // Récupérer les clics
    const [clicks, total] = await Promise.all([
      prisma.click.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          userAgent: true,
          ip: true,
          referer: true,
          device: true,
          linkId: true,
          country: true
        }
      }),
      prisma.click.count({
        where: whereConditions
      })
    ])

    // Transformer les clics en format visiteur
    const visitors = await Promise.all(clicks.map(async (click) => {
      const link = linkMap.get(click.linkId)
      const parsedUA = parseUserAgent(click.userAgent || '')
      const location = await getLocationFromIP(click.ip || '')
      const parsedReferrer = parseReferer(click.referer || '')
      
      // Déterminer le type d'appareil
      let deviceName = 'Desktop Computer'
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      
      if (click.device === 'mobile') {
        deviceName = 'Mobile Phone'
        deviceType = 'mobile'
      } else if (click.device === 'tablet') {
        deviceName = 'Tablet'
        deviceType = 'tablet'
      }

      // Déterminer le statut (toujours success pour l'instant)
      let status: 'success' | 'blocked' | 'bot' = 'success'

      return {
        id: click.id,
        timestamp: click.createdAt.toISOString(),
        location: {
          city: location.city || 'N/A',
          region: location.region || 'N/A',
          country: location.country || click.country || 'Unknown',
          countryCode: location.countryCode || 'XX'
        },
        linkSlug: link?.slug || 'unknown',
        linkTitle: link?.title || 'Lien supprimé',
        browser: parsedUA.browser || 'Unknown Browser',
        os: parsedUA.os || 'Unknown OS',
        referrer: click.referer || '',
        referrerDomain: parsedReferrer.source,
        device: deviceName,
        deviceType: deviceType,
        status: status,
        ip: click.ip || '',
        userAgent: click.userAgent || ''
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